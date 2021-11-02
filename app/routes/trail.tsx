import { MetaFunction, useLoaderData } from "remix";
import { Outlet } from "react-router-dom";
import Header from "../components/header";
import { tokenCookie } from "../cookies";
import { secure, getUser, AuthenticatedLoaderArgs } from "../authentication";
import { getSession, commitSession } from "../session";

function dashboardLoader({ context: { auth } }: AuthenticatedLoaderArgs) {
    return getUser(auth);
}

export const loader = (args: any) => secure({ cookie: tokenCookie, getSession, commitSession, args }, dashboardLoader);

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
            <Outlet />
        </>
    );
}
