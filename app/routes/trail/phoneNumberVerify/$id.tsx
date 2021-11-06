import { json, Form, ActionFunction, redirect, useLoaderData, useActionData } from "remix";
import { useNavigate } from "react-router-dom";
import { getMaskedPhoneNumber, hasVerificationExpired } from "../../../utils";
import { AuthenticatedLoaderArgs, getUser, secure } from "../../../authentication";
import { tokenCookie } from "../../../cookies";
import { getSession, commitSession } from "../../../session";
import { StoreLoaderArgs } from "../../../store";
import withStore from "../../../withStore";
import VerificationForm, { VerificationError } from "../../../components/verificationForm";

const phoneNumberVerifyAction: ActionFunction = async ({
    request,
    context: {
        auth,
        store: {
            getPhoneNumberVerification,
            addPhoneNumberToTrail,
            removePhoneNumberVerification,
            getUserDetails,
            setUserDetails,
        },
    },
    params,
}: AuthenticatedLoaderArgs & StoreLoaderArgs) => {
    const { id } = params;
    const { sub } = getUser(auth);
    const body = new URLSearchParams(await request.text());
    const code = body.get("verificationCode");

    if (!code) {
        return null;
    }

    const verification = await getPhoneNumberVerification(sub);
    if (verification.verificationCode !== code) {
        return json({ error: VerificationError.IncorrectCode });
    }

    if (hasVerificationExpired(verification.expires, new Date())) {
        return json({ error: VerificationError.CodeExpired });
    }

    const userDetails = await getUserDetails(sub);

    await Promise.all([
        removePhoneNumberVerification(sub),
        addPhoneNumberToTrail(id, verification.phoneNumber),
        setUserDetails(sub, { ...userDetails, phoneNumber: verification.phoneNumber }),
    ]);

    return redirect(`/trail/${id}`);
};

export const action = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(phoneNumberVerifyAction));

async function phoneNumberVerifyLoader({
    context: {
        auth,
        store: { getPhoneNumberVerification },
    },
    params,
}: AuthenticatedLoaderArgs & StoreLoaderArgs) {
    const { id } = params;
    const { sub } = getUser(auth);
    const verification = await getPhoneNumberVerification(sub);
    const codeAvailable = verification && !hasVerificationExpired(verification.expires, new Date());

    if (!codeAvailable) {
        redirect(`/trail/phoneNumberEntry/${id}`);
    }

    return json({ phoneNumber: getMaskedPhoneNumber(verification.phoneNumber), id });
}

export const loader = (args: any) =>
    secure({ cookie: tokenCookie, getSession, commitSession, args }, withStore(phoneNumberVerifyLoader));

export default function PhoneNumberVerify() {
    const { phoneNumber, id } = useLoaderData();

    const actionData = useActionData();

    const navigate = useNavigate();

    return (
        <Form method="post" style={{ height: "100%" }}>
            <VerificationForm
                phoneNumber={phoneNumber}
                error={actionData?.error}
                newCodeUrl={`/trail/phoneNumberEntry/${id}`}
                onCancel={() => navigate(`/trail/${id}`)}
            />
        </Form>
    );
}
