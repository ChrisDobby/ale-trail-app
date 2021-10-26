import { useLoaderData, Link } from "remix";
import type { MetaFunction } from "remix";
import { AuthenticatedLoaderArgs, getAuthHeader, getUser, secure } from "../authentication";
import Header from "../components/header";
import { tokenCookie } from "../cookies";
import { getSession, commitSession } from "../session";
import ComingSoon from "../components/comingSoon";

export const meta: MetaFunction = () => {
    return {
        title: "Ale trail planner",
        description: "",
    };
};

function dashboardLoader({ context: { auth, headers } }: AuthenticatedLoaderArgs) {
    return getUser({ ...headers, ...getAuthHeader(auth) });
}

export const loader = (args: any) => secure({ cookie: tokenCookie, getSession, commitSession, args }, dashboardLoader);

export default function Dashboard() {
    const data = useLoaderData();
    return (
        <>
            <Header userProfile={data} />
            <ComingSoon />
            <Link to="/trail/create">Create new trail</Link>
        </>
    );
}
