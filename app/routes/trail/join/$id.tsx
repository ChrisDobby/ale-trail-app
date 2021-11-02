import { MetaFunction, useLoaderData, ActionFunction, redirect, json, useSubmit } from "remix";
import format from "date-fns/format";
import { UserTrail } from "../../../types";
import { secure, AuthenticatedLoaderArgs, getUser } from "../../../authentication";
import { tokenCookie } from "../../../cookies";
import { getSession, commitSession } from "../../../session";
import { StoreLoaderArgs } from "../../../store";
import withStore from "../../../withStore";
import JoinTrail from "../../../components/joinTrail";
import { storedTrailToTrail } from "../../../utils";

function canJoinTrail(id: string, userTrails: UserTrail[]) {
    return !userTrails.map(trail => trail.id).includes(id);
}

export const meta: MetaFunction = ({ data: { trail } }) => {
    return {
        title: "Ale trail planner",
        description: `join trail on ${format(new Date(trail?.meeting?.dateTime), "dd-MMM-yyyy HH:mm")}`,
    };
};

async function joinLoader({
    context: {
        auth,
        store: { getTrail, trailsForUser },
    },
    params: { id },
}: AuthenticatedLoaderArgs & StoreLoaderArgs) {
    const user = getUser(auth);
    const [storedTrail, storedUserTrails] = await Promise.all([getTrail(id), trailsForUser(user.sub)]);

    const userTrails = Object.values(storedUserTrails) as UserTrail[];
    const trail = storedTrailToTrail(storedTrail);

    return { trail, canJoin: canJoinTrail(id, userTrails) };
}

export const loader = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(joinLoader));

const joinTrailAction: ActionFunction = async ({
    context: {
        auth,
        store: { trailsForUser, addTrailToUser, getTrail },
    },
    params,
}: AuthenticatedLoaderArgs & StoreLoaderArgs) => {
    const { id } = params;
    const { sub } = getUser(auth);
    const userTrails = Object.values(await trailsForUser(sub)) as UserTrail[];

    if (!canJoinTrail(id, userTrails)) {
        return json(null, { status: 400 });
    }

    const trail = await getTrail(id);
    await addTrailToUser(sub, id, { id, meeting: trail.meeting });

    return redirect("/dashboard");
};

export const action = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(joinTrailAction));

export default function Join() {
    const { trail, canJoin } = useLoaderData();

    const submit = useSubmit();

    const handleJoin = () => {
        submit(null, { method: "post" });
    };

    return <JoinTrail trail={trail} canJoin={canJoin} onJoin={handleJoin} />;
}
