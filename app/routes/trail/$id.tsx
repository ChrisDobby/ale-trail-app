import { useLoaderData } from "remix";
import type { MetaFunction } from "remix";
import format from "date-fns/format";
import { secure } from "../../authentication";
import { tokenCookie } from "../../cookies";
import { getSession, commitSession } from "../../session";
import { StoreLoaderArgs } from "../../store";
import withStore from "../../withStore";

export const meta: MetaFunction = (params: any) => {
    const { data } = params;
    return {
        title: `Ale trail - ${data?.meeting?.station?.name} ${format(
            new Date(data?.meeting?.dateTime),
            "dd-MMM-yyyy HH:mm",
        )}`,
        description: "",
    };
};

async function viewLoader({
    context: {
        store: { getTrail },
    },
    params,
}: StoreLoaderArgs) {
    return getTrail(params.id);
}

export const loader = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(viewLoader));

export default function ViewTrail() {
    const trail = useLoaderData();
    return <div>{JSON.stringify(trail)}</div>;
}
