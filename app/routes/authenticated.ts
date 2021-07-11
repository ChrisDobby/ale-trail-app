import type { LoaderFunction } from "remix";
import { redirect } from "remix";
import { retrieveToken } from "../authentication";
import { getSession } from "../session";
import { tokenCookie } from "../cookies";

export const loader: LoaderFunction = async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (!code || !state) {
        return redirect("/");
    }

    const session = await getSession(request.headers.get("Cookie"));
    if (session.get("authState") === state) {
        return redirect(session.get("lastRequestPath") || "/", {
            headers: { "Set-Cookie": tokenCookie.serialize(await retrieveToken({ request, code })) },
        });
    }

    return redirect("/");
};

export default function Authenticated() {
    return null;
}
