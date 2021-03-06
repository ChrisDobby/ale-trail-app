import { useLoaderData, json, Form, ActionFunction, redirect } from "remix";
import { useNavigate } from "react-router-dom";
import { AuthenticatedLoaderArgs, getUser, secure } from "../../../authentication";
import { tokenCookie } from "../../../cookies";
import { getSession, commitSession } from "../../../session";
import { StoreLoaderArgs } from "../../../store";
import withStore from "../../../withStore";
import PhoneNumberForm from "../../../components/phoneNumberForm";
import { createPhoneNumberVerification, internationalPhoneNumber, canMessage } from "../../../utils";
import { sendVerificationMessage } from "../../../messagingUtils";

async function phoneNumberEntryLoader({
    context: {
        auth,
        store: { getUserDetails, getTrail },
    },
    params,
}: AuthenticatedLoaderArgs & StoreLoaderArgs) {
    const { id } = params;
    const { sub } = getUser(auth);
    const trail = await getTrail(id);
    if (!canMessage(trail.createdBy)) {
        return redirect(`/trail/${id}`);
    }
    const userDetails = await getUserDetails(sub);
    return json({ userDetails, id });
}

export const loader = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(phoneNumberEntryLoader));

const phoneNumberEntryAction: ActionFunction = async ({
    request,
    context: {
        auth,
        store: { getUserDetails, setPhoneNumberVerification, addPhoneNumberToTrail, getTrail },
    },
    params,
}: AuthenticatedLoaderArgs & StoreLoaderArgs) => {
    const { id } = params;
    const { sub } = getUser(auth);
    const trail = await getTrail(id);
    if (!canMessage(trail.createdBy)) {
        return redirect(`/trail/${id}`);
    }

    const body = new URLSearchParams(await request.text());
    const phoneNumberParam = body.get("phoneNumber");
    const userDetails = await getUserDetails(sub);

    if (!phoneNumberParam) {
        return null;
    }

    const phoneNumber = internationalPhoneNumber(phoneNumberParam);
    if (userDetails?.phoneNumber === phoneNumber) {
        await addPhoneNumberToTrail(id, phoneNumber);
        return redirect(`/trail/${id}`);
    }

    const verification = createPhoneNumberVerification(phoneNumber, id);
    sendVerificationMessage(verification);
    await setPhoneNumberVerification(sub, verification);

    return redirect(`/trail/${id}/phoneNumberVerify`);
};

export const action = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(phoneNumberEntryAction));

export default function PhoneNumberEntry() {
    const { userDetails, id } = useLoaderData();

    const navigate = useNavigate();

    return (
        <Form method="post" style={{ height: "100%" }}>
            <PhoneNumberForm initialNumber={userDetails?.phoneNumber} onCancel={() => navigate(`/trail/${id}`)} />
        </Form>
    );
}
