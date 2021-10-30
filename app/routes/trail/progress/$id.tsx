import { json, useLoaderData, useSubmit, ActionFunction, redirect } from "remix";
import { UserTrail } from "../../../types";
import { secure, AuthenticatedLoaderArgs, getAuthHeader, getUser } from "../../../authentication";
import { tokenCookie } from "../../../cookies";
import { getSession, commitSession } from "../../../session";
import { StoreLoaderArgs } from "../../../store";
import withStore from "../../../withStore";
import { getCurrentStation, getNextTrain, moveToNextStation, storedTrailToTrail } from "../../../utils";
import TrailProgress from "../../../components/trailProgress";

function userCanUpdate(id: string, userTrails: any[]) {
    const userTrailIds = (Object.values(userTrails) as UserTrail[]).map(userTrail => userTrail.id);
    return userTrailIds.includes(id);
}

async function progressLoader({
    context: {
        auth,
        headers,
        store: { getTrail, trailsForUser },
    },
    params,
}: AuthenticatedLoaderArgs & StoreLoaderArgs) {
    const { id } = params;
    const userResponse = await getUser({ ...headers, ...getAuthHeader(auth) });
    const { sub } = await userResponse.json();

    const [storedTrail, storedUserTrails] = await Promise.all([getTrail(id), trailsForUser(sub)]);
    if (!userCanUpdate(id, storedUserTrails)) {
        return json(null, { status: 404 });
    }

    if (!storedTrail.currentStop) {
        return { trailNotStarted: true };
    }

    const trail = storedTrailToTrail(storedTrail);
    return { station: getCurrentStation(trail), nextTrain: getNextTrain(trail, new Date()) };
}

export const loader = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(progressLoader));

const updateProgressAction: ActionFunction = async ({
    request,
    context: {
        headers,
        auth,
        store: { trailsForUser, getTrail, updateProgress },
    },
    params,
}: AuthenticatedLoaderArgs & StoreLoaderArgs) => {
    const { id } = params;
    const body = new URLSearchParams(await request.text());
    const updateAction = body.get("action");
    const updateForStopIndex = body.get("stopIndex");
    const updateForTime = body.get("dateTime");

    const updateForStop = updateForStopIndex !== null ? `stop:${updateForStopIndex}` : "meeting";

    if (!updateAction || !updateForStop || !updateForTime) {
        return json(null, { status: 400 });
    }

    const userResponse = await getUser({ ...headers, ...getAuthHeader(auth) });
    const { sub } = await userResponse.json();

    const [storedTrail, storedUserTrails] = await Promise.all([getTrail(id), trailsForUser(sub)]);
    if (!userCanUpdate(id, storedUserTrails)) {
        return json(null, { status: 404 });
    }

    const trail = storedTrailToTrail(storedTrail);
    const update = updateAction === "missed" ? trail : moveToNextStation(trail);

    const updated = await updateProgress(id, updateForStop, updateForTime, () => ({
        ...update,
        progressUpdates: [
            ...(trail.progressUpdates || []),
            { stop: updateForStop, time: updateForTime, action: updateAction },
        ],
    }));

    return updated ? redirect(`/trail/${id}`) : null;
};

export const action = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(updateProgressAction));

export default function Progress() {
    const { trailNotStarted, station, nextTrain } = useLoaderData();

    const submit = useSubmit();

    const handleMoveToNextStation = () => {
        submit({ action: "next", stopIndex: station.stopIndex, dateTime: nextTrain.dateTime }, { method: "post" });
    };
    return (
        <TrailProgress
            station={station?.name}
            nextTrain={nextTrain}
            trailNotStarted={trailNotStarted}
            onMoveToNextStation={handleMoveToNextStation}
        />
    );
}
