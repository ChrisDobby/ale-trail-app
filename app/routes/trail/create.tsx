import { LoaderFunction, MetaFunction, ActionFunction, json, useLoaderData, useSubmit, redirect } from "remix";
import { v4 as uuid } from "uuid";
import CreateTrail, { TrailToCreate } from "../../components/createTrail";
import trailStations from "../../stations";
import { secure, getUser, AuthenticatedLoaderArgs } from "../../authentication";
import { tokenCookie } from "../../cookies";
import { getSession, commitSession } from "../../session";
import withStore from "../../withStore";
import { StoreLoaderArgs } from "../../store";

export const loader: LoaderFunction = () => {
    return json({ stations: trailStations });
};

const createTrailAction: ActionFunction = async ({
    request,
    context: {
        auth,
        store: { setTrail, addTrailToUser },
    },
}: AuthenticatedLoaderArgs & StoreLoaderArgs) => {
    const body = new URLSearchParams(await request.text());
    const trailParam = body.get("trail");
    if (!trailParam) {
        return json(null, { status: 400 });
    }

    const trail = JSON.parse(trailParam);
    const { sub } = getUser(auth);
    const id = uuid();

    await Promise.all([
        setTrail(id, { ...trail, id, createdBy: sub }),
        addTrailToUser(sub, id, { id, meeting: trail.meeting }),
    ]);

    return redirect("/dashboard");
};

export const action = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(createTrailAction));

export const meta: MetaFunction = () => {
    return {
        title: "Create a new trail",
    };
};

export default function Create() {
    const { stations } = useLoaderData();

    const submit = useSubmit();

    const handleCreate = (trail: TrailToCreate) => {
        submit({ trail: JSON.stringify(trail) }, { method: "post" });
    };

    return <CreateTrail stations={stations} onCreate={handleCreate} />;
}
