import { useLoaderData } from "remix";
import type { MetaFunction } from "remix";
import format from "date-fns/format";
import { secure, AuthenticatedLoaderArgs, getAuthHeader, getUser } from "../../authentication";
import { tokenCookie } from "../../cookies";
import { getSession, commitSession } from "../../session";
import { StoreLoaderArgs } from "../../store";
import withStore from "../../withStore";
import ViewTrail from "../../components/viewTrail";

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
        headers,
        store: { getTrail },
    },
    params,
}: AuthenticatedLoaderArgs & StoreLoaderArgs) {
    const userResponse = await getUser({ ...headers, ...getAuthHeader(auth) });
    const user = await userResponse.json();
    const storedTrail = await getTrail(params.id);

    const trail = {
        ...storedTrail,
        stops: Object.values(storedTrail.stops),
    };

    return { trail, canStart: trail.createdBy === user.sub };
}

export const loader = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(viewLoader));

export default function View() {
    const { trail } = useLoaderData();

    const handleStart = () => {};

    return <ViewTrail trail={trail} canStart onStart={handleStart} />;
}
