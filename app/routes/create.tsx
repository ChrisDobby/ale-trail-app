import { MetaFunction, useLoaderData, json } from "remix";
import Header from "../components/header";
import { tokenCookie } from "../cookies";
import { AuthenticatedLoaderArgs, getAuthHeader, getUser, secure } from "../authentication";
import { getSession, commitSession } from "../session";
import CreateTrail from "../components/createTrail";

async function dashboardLoader({ context: { auth, headers } }: AuthenticatedLoaderArgs) {
    const userResponse = await getUser({ ...headers, ...getAuthHeader(auth) });
    const user = await userResponse.json();
    const stations = [
        "Batley",
        "Dewsbury",
        "Mirfield",
        "Huddersfield",
        "Slaithwaite",
        "Marsden",
        "Greenfield",
        "Stalybridge",
    ].map((name, id) => ({ id, name }));

    return json({ user, stations });
}

export const loader = (args: any) => secure({ cookie: tokenCookie, getSession, commitSession, args }, dashboardLoader);

export const meta: MetaFunction = () => {
    return {
        title: "Create a new trail",
    };
};

export default function Index() {
    const { user, stations } = useLoaderData();

    console.log(stations);
    return (
        <>
            <Header userProfile={user} />
            <CreateTrail stations={stations} />
        </>
    );
}
