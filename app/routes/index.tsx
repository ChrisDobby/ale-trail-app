import { LoaderFunction, MetaFunction, redirect } from "remix";
import Header from "../components/header";
import ComingSoon from "../components/comingSoon";
import { tokenCookie } from "../cookies";
import { getAuth } from "../authentication";

export const loader: LoaderFunction = async ({ request }) => {
    const auth = await getAuth(tokenCookie, request);
    if (auth) {
        return redirect("/dashboard");
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
    return (
        <>
            <Header />
            <ComingSoon />
        </>
    );
}
