import { useState } from "react";
import { MetaFunction, useLoaderData, ActionFunction, redirect, json, useSubmit, useTransition } from "remix";
import format from "date-fns/format";
import { UserTrail } from "../../../types";
import { secure, AuthenticatedLoaderArgs, getUser } from "../../../authentication";
import { tokenCookie } from "../../../cookies";
import { getSession, commitSession } from "../../../session";
import { StoreLoaderArgs } from "../../../store";
import withStore from "../../../withStore";
import JoinTrail from "../../../components/joinTrail";
import { storedTrailToTrail, createPhoneNumberVerification } from "../../../utils";
import { sendVerificationMessage } from "../../../messagingUtils";

function canJoinTrail(id: string, userTrails: UserTrail[]) {
    return !userTrails.map(trail => trail.id).includes(id);
}

export const meta: MetaFunction = ({ data: { trail } }) => {
    return {
        title: "Ale trail planner",
        description: `join trail on ${format(new Date(trail?.meeting?.dateTime), "dd-MMM-yyyy HH:mm")}`,
    };
};

async function joinLoader({
    context: {
        auth,
        store: { getTrail, trailsForUser, getUserDetails },
    },
    params: { id },
}: AuthenticatedLoaderArgs & StoreLoaderArgs) {
    const user = getUser(auth);
    const [storedTrail, storedUserTrails, userDetails] = await Promise.all([
        getTrail(id),
        trailsForUser(user.sub),
        getUserDetails(user.sub),
    ]);

    const userTrails = Object.values(storedUserTrails) as UserTrail[];
    const trail = storedTrailToTrail(storedTrail);

    return { trail, canJoin: canJoinTrail(id, userTrails), userDetails };
}

export const loader = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(joinLoader));

const joinTrailAction: ActionFunction = async ({
    request,
    context: {
        auth,
        store: {
            trailsForUser,
            addTrailToUser,
            getTrail,
            getUserDetails,
            addPhoneNumberToTrail,
            setPhoneNumberVerification,
        },
    },
    params,
}: AuthenticatedLoaderArgs & StoreLoaderArgs) => {
    const { id } = params;
    const { sub } = getUser(auth);
    const userTrails = Object.values(await trailsForUser(sub)) as UserTrail[];

    if (!canJoinTrail(id, userTrails)) {
        return json(null, { status: 400 });
    }

    const trail = await getTrail(id);
    await addTrailToUser(sub, id, { id, meeting: trail.meeting });

    const body = new URLSearchParams(await request.text());
    const phoneNumber = body.get("phoneNumber");
    if (!phoneNumber) {
        return redirect("/dashboard");
    }

    const userDetails = await getUserDetails(sub);
    if (userDetails?.phoneNumber === phoneNumber) {
        await addPhoneNumberToTrail(id, phoneNumber);
        return redirect("/dashboard");
    }

    const verification = createPhoneNumberVerification(phoneNumber, id);
    sendVerificationMessage(verification);
    await setPhoneNumberVerification(sub, verification);

    return redirect(`/trail/phoneNumberVerify/${id}`);
};

export const action = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(joinTrailAction));

export default function Join() {
    const { trail, canJoin, userDetails } = useLoaderData();

    const submit = useSubmit();

    const { state } = useTransition();

    const [phoneNumber, setPhoneNumber] = useState(userDetails?.phoneNumber);

    const handleJoin = () => {
        submit({ phoneNumber }, { method: "post" });
    };

    return (
        <JoinTrail
            trail={trail}
            canJoin={canJoin}
            disabled={state === "submitting" || state === "loading"}
            phoneNumber={phoneNumber}
            onJoin={handleJoin}
            onPhoneNumberChanged={setPhoneNumber}
        />
    );
}
