import { json, useLoaderData } from "remix";
import { UserTrail } from "../../../types";
import { secure, AuthenticatedLoaderArgs, getAuthHeader, getUser } from "../../../authentication";
import { tokenCookie } from "../../../cookies";
import { getSession, commitSession } from "../../../session";
import { StoreLoaderArgs } from "../../../store";
import withStore from "../../../withStore";
import { getCurrentStation, getNextTrain } from "../../../utils";
import TrailProgress from "../../../components/trailProgress";

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
    const userTrailIds = (Object.values(storedUserTrails) as UserTrail[]).map(userTrail => userTrail.id);
    if (!userTrailIds.includes(id)) {
        return json(null, { status: 404 });
    }

    if (!storedTrail.currentStop) {
        return { trailNotStarted: true };
    }

    const trail = {
        ...storedTrail,
        stops: Object.values(storedTrail.stops),
    };

    return { station: getCurrentStation(trail), nextTrain: getNextTrain(trail, new Date()) };
}

export const loader = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(progressLoader));

export default function Progress() {
    const { trailNotStarted, station, nextTrain } = useLoaderData();

    return <TrailProgress station={station} nextTrain={nextTrain} trailNotStarted={trailNotStarted} />;
}
