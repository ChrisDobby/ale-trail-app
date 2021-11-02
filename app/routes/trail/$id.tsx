import { useLoaderData, ActionFunction, redirect, json, useSubmit } from "remix";
import type { MetaFunction } from "remix";
import format from "date-fns/format";
import { secure, AuthenticatedLoaderArgs, getUser } from "../../authentication";
import { tokenCookie } from "../../cookies";
import { getSession, commitSession } from "../../session";
import { StoreLoaderArgs } from "../../store";
import withStore from "../../withStore";
import ViewTrail from "../../components/viewTrail";
import { getCurrentStation, storedTrailToTrail } from "../../utils";

function canStartTrail(createdBy: string, meetingDateTime: string, userId: string, currentStop?: string) {
    return (
        typeof currentStop === "undefined" &&
        userId === createdBy &&
        new Date(meetingDateTime).toDateString() === new Date().toDateString()
    );
}

export const meta: MetaFunction = (params: any) => {
    const {
        data: { trail },
    } = params;
    return {
        title: `Ale trail - ${trail?.meeting?.station?.name} ${format(
            new Date(trail?.meeting?.dateTime),
            "dd-MMM-yyyy HH:mm",
        )}`,
        description: "",
    };
};

async function viewLoader({
    context: {
        auth,
        store: { getTrail },
    },
    params,
}: AuthenticatedLoaderArgs & StoreLoaderArgs) {
    const user = getUser(auth);
    const trail = storedTrailToTrail(await getTrail(params.id));

    return {
        trail,
        canStart: canStartTrail(trail.createdBy, trail.meeting.dateTime, user.sub, trail.currentStop),
        currentStation: getCurrentStation(trail),
        canUpdateProgress: user.sub === trail.createdBy && trail.currentStop,
    };
}

export const loader = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(viewLoader));

const startTrailAction: ActionFunction = async ({
    context: {
        auth,
        store: { setTrail, getTrail },
    },
    params,
}: AuthenticatedLoaderArgs & StoreLoaderArgs) => {
    const { id } = params;
    const { sub } = getUser(auth);
    const storedTrail = await getTrail(id);

    if (!canStartTrail(storedTrail.createdBy, storedTrail.meeting.dateTime, sub, storedTrail.currentStop)) {
        return json(null, { status: 400 });
    }

    const updatedTrail = { ...storedTrail, currentStop: "meeting" };
    await setTrail(id, updatedTrail);

    return redirect("/dashboard");
};

export const action = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(startTrailAction));

export default function View() {
    const { trail, canStart, currentStation, canUpdateProgress } = useLoaderData();

    const submit = useSubmit();

    const handleStart = () => {
        submit(null, { method: "post" });
    };

    return (
        <ViewTrail
            trail={trail}
            canStart={canStart}
            canUpdateProgress={canUpdateProgress}
            currentStation={currentStation}
            onStart={handleStart}
        />
    );
}
