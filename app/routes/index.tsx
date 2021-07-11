import { LoaderFunction, MetaFunction, useRouteData } from "remix";
import { Header } from "../components/header";
import ComingSoon from "../components/comingSoon";
import { tokenCookie } from "../cookies";
import { getAuth, getAuthHeader, getUser } from "../authentication";

export const loader: LoaderFunction = ({ request }) => {
    const auth = getAuth(tokenCookie, request);
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
    const user = useRouteData();
    return (
        <>
            <Header userProfile={user} />
            <ComingSoon />
        </>
    );
}
