import { json, useLoaderData, useSubmit, ActionFunction, redirect, useTransition } from "remix";
import { UserTrail, Trail } from "../../../types";
import { secure, AuthenticatedLoaderArgs, getUser } from "../../../authentication";
import { tokenCookie } from "../../../cookies";
import { getSession, commitSession } from "../../../session";
import { StoreLoaderArgs } from "../../../store";
import withStore from "../../../withStore";
import {
    getCurrentStation,
    getNextTrain,
    moveToNextStation,
    moveOnByTrain,
    storedTrailToTrail,
    prepareTrailForUpdate,
} from "../../../utils";
import TrailProgress from "../../../components/trailProgress";

function userCanUpdate(id: string, userTrails: any[]) {
    const userTrailIds = (Object.values(userTrails) as UserTrail[]).map(userTrail => userTrail.id);
    return userTrailIds.includes(id);
}

async function progressLoader({
    context: {
        auth,
        store: { getTrail, trailsForUser },
    },
    params,
}: AuthenticatedLoaderArgs & StoreLoaderArgs) {
    const { id } = params;
    const { sub } = getUser(auth);

    const [storedTrail, storedUserTrails] = await Promise.all([getTrail(id), trailsForUser(sub)]);
    if (!userCanUpdate(id, storedUserTrails)) {
        return json(null, { status: 404 });
    }

    if (!storedTrail.currentStop) {
        return { trailNotStarted: true };
    }

    const trail = storedTrailToTrail(storedTrail);
    return { station: getCurrentStation(trail), nextTrain: getNextTrain(trail, new Date(), sub === trail.createdBy) };
}

export const loader = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(progressLoader));

const updateProgressAction: ActionFunction = async ({
    request,
    context: {
        auth,
        store: { trailsForUser, updateProgress },
    },
    params,
}: AuthenticatedLoaderArgs & StoreLoaderArgs) => {
    const { id } = params;
    const body = new URLSearchParams(await request.text());
    const updateAction = body.get("action");
    const updateForStopIndex = body.get("stopIndex");
    const updateForTime = body.get("dateTime");

    const updateForStop = updateForStopIndex !== "" ? `stop:${updateForStopIndex}` : "meeting";

    if (!updateAction || !updateForStop || !updateForTime) {
        return json(null, { status: 400 });
    }

    const { sub } = getUser(auth);

    const storedUserTrails = await trailsForUser(sub);
    if (!userCanUpdate(id, storedUserTrails)) {
        return json(null, { status: 404 });
    }

    const update = (trail: Trail) => {
        const [canUpdate, preparedTrail] = prepareTrailForUpdate(
            trail,
            updateForStop,
            updateForTime,
            updateAction,
            sub,
        );

        if (!canUpdate) {
            return [false, trail];
        }

        return [
            true,
            {
                ...(updateAction === "missed" ? moveOnByTrain(preparedTrail) : moveToNextStation(preparedTrail)),
                progressUpdates: [
                    ...(preparedTrail.progressUpdates || []),
                    {
                        stop: updateForStop,
                        time: updateForTime,
                        action: updateAction,
                        stopTimes: trail.stops.map(({ dateTime }) => dateTime),
                    },
                ],
            },
        ];
    };

    const updated = await updateProgress(id, update);

    return updated ? redirect(`/trail/${id}`) : null;
};

export const action = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(updateProgressAction));

export default function Progress() {
    const { trailNotStarted, station, nextTrain } = useLoaderData();

    const submit = useSubmit();

    const { state } = useTransition();

    const getStopIndexForSubmit = () => {
        if (typeof nextTrain.index === "undefined" || nextTrain.index === 0) {
            return "";
        }
        return `${nextTrain.index - 1}`;
    };

    const handleMoveToNextStation = () => {
        submit(
            {
                action: "next",
                stopIndex: getStopIndexForSubmit(),
                dateTime: nextTrain.dateTime,
            },
            { method: "post" },
        );
    };

    const handleGetNextTrain = () => {
        submit(
            {
                action: "missed",
                stopIndex: getStopIndexForSubmit(),
                dateTime: nextTrain.dateTime,
            },
            { method: "post" },
        );
    };

    return (
        <TrailProgress
            station={station?.name}
            nextTrain={nextTrain}
            trailNotStarted={trailNotStarted}
            disabled={state === "submitting" || state === "loading"}
            onMoveToNextStation={handleMoveToNextStation}
            onGetNextTrain={handleGetNextTrain}
        />
    );
}
