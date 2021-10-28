import { useLoaderData, Link, json } from "remix";
import type { MetaFunction } from "remix";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { AuthenticatedLoaderArgs, getAuthHeader, getUser, secure } from "../authentication";
import Header from "../components/header";
import { tokenCookie } from "../cookies";
import { getSession, commitSession } from "../session";
import { StoreLoaderArgs } from "../store";
import withStore from "../withStore";
import UserTrails from "../components/userTrails";
import { UserTrail } from "../types";

export const meta: MetaFunction = () => {
    return {
        title: "Ale trail planner",
        description: "",
    };
};

async function dashboardLoader({
    context: {
        auth,
        headers,
        store: { trailsForUser },
    },
}: AuthenticatedLoaderArgs & StoreLoaderArgs) {
    const userResponse = await getUser({ ...headers, ...getAuthHeader(auth) });
    const user = await userResponse.json();
    const trails = (Object.values(await trailsForUser(user.sub)) as UserTrail[]).sort(
        (trail1: UserTrail, trail2: UserTrail) =>
            new Date(trail2.meeting.dateTime).getTime() - new Date(trail1.meeting.dateTime).getTime(),
    );

    return json({ user, trails });
}

export const loader = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(dashboardLoader));

export default function Dashboard() {
    const { user, trails } = useLoaderData();
    return (
        <>
            <Header userProfile={user} />
            <UserTrails trails={trails} />
            <Link to="/trail/create" className="bottom-right-button">
                <Button variant="contained" color="success" startIcon={<AddIcon />}>
                    Create new trail
                </Button>
            </Link>
        </>
    );
}
