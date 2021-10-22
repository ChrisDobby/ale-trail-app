import { LoaderFunction, MetaFunction, useLoaderData } from "remix";
import Header from "../components/header";
import ComingSoon from "../components/comingSoon";
import { tokenCookie } from "../cookies";
import { getAuth, getAuthHeader, getUser } from "../authentication";

export const loader: LoaderFunction = async ({ request }) => {
    const auth = await getAuth(tokenCookie, request);
    if (auth) {
        return getUser(getAuthHeader(auth));
    }

    return null;
};

export const meta: MetaFunction = () => {
    return {
        title: "Ale trail planner",
        description: "Welcome to the ale trail planner",
    };
};

export default function Index() {
    const user = useLoaderData();
    return (
        <>
            <Header userProfile={user} />
            <ComingSoon />
        </>
    );
}
