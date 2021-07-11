import { redirect, Request } from "remix";
import type { Cookie, Session, LoaderFunction, AppLoadContext } from "remix";
import { v4 as uuidv4 } from "uuid";
import { tokenCookie } from "./cookies";

// const AUTH_CLIENT_ID = "uxfXvUb0ODasu9TCb1F7Qn138pBl2lHb";
// const AUTH_CLIENT_SECRET = "DcG3DlUsJ0v46tn9Cn2FtxuUDy49sWmJFLQSBMZNphPvHEBjmwBS1sfRyI-pyntW";
// const AUTH_URL = "https://dev-chrisdobby.eu.auth0.com";
const AUTH_CLIENT_ID = process.env.AUTH_CLIENT_ID || "";
const AUTH_CLIENT_SECRET = process.env.AUTH_CLIENT_SECRET || "";
const AUTH_URL = process.env.AUTH_URL || "";

type Auth = { access_token: string; refresh_token: string; expires_at: number };

type AuthenticatedContext = AppLoadContext & { auth: Auth; headers: HeadersInit };
export type AuthenticatedLoaderArgs = { request: Request; context: AuthenticatedContext; params: any };

function getSecondsSinceEpoch(now: Date) {
    const millisecondsSinceEpoch = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
    return Math.round(millisecondsSinceEpoch / 1000);
}

function hasTokenExpired(expiry: number) {
    return getSecondsSinceEpoch(new Date()) > expiry;
}

function getHostUrl(request: Request) {
    const { protocol } = new URL(request.url);
    const host = request.headers.get("host");
    return `${protocol}//${host}`;
}

function getRedirectUri(request: Request) {
    return `${getHostUrl(request)}/authenticated`;
}

type RetrieveTokenArgs = {
    request?: Request;
    code?: string;
    refreshToken?: string;
};

export async function retrieveToken({ code, refreshToken, request }: RetrieveTokenArgs) {
    const tokenData =
        typeof refreshToken !== "undefined"
            ? `grant_type=refresh_token&refresh_token=${refreshToken}`
            : `grant_type=authorization_code&code=${code}&redirect_uri=${getRedirectUri(request as Request)}`;

    const authResponse = await fetch(`${AUTH_URL}/oauth/token`, {
        method: "POST",
        body: `${tokenData}&client_id=${AUTH_CLIENT_ID}&client_secret=${AUTH_CLIENT_SECRET}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const { access_token, refresh_token, expires_in } = await authResponse.json();
    return { access_token, refresh_token, expires_at: getSecondsSinceEpoch(new Date()) + expires_in };
}

type SecureOptions = {
    tokenCookie: Cookie;
    getSession: (cookieHeader: string | null) => Promise<Session>;
    commitSession: (session: Session) => Promise<string>;
    args: {
        request: Request;
        context: AppLoadContext;
        params: any;
    };
};

export function getAuthHeader(auth: Auth) {
    return { Authorization: `Bearer ${auth.access_token}` };
}

export function getUser(headers: HeadersInit) {
    return fetch(`${AUTH_URL}/userinfo`, { headers });
}

export function logout(request: Request) {
    return redirect(`${AUTH_URL}/v2/logout?client_id=${AUTH_CLIENT_ID}&returnTo=${getHostUrl(request)}`, {
        headers: { "Set-Cookie": tokenCookie.serialize("", { expires: new Date() }) },
    });
}

export function getAuth(tokenCookie: Cookie, request: Request): Auth | null {
    const token = tokenCookie.parse(request.headers.get("Cookie"));
    return token || null;
}

export async function secure({ tokenCookie, getSession, commitSession, args }: SecureOptions, loader: LoaderFunction) {
    const { request } = args;
    let auth = getAuth(tokenCookie, request);
    if (!auth) {
        const { pathname } = new URL(request.url);
        const session = await getSession(request.headers.get("Cookie"));
        const state = uuidv4();
        session.set("lastRequestPath", pathname ?? "/");
        session.set("authState", state);

        const authUrl = `${AUTH_URL}/authorize?scope=offline_access openid profile&response_type=code&client_id=${AUTH_CLIENT_ID}&redirect_uri=${getRedirectUri(
            request,
        )}&state=${state}`;

        return redirect(authUrl, { headers: { "Set-Cookie": await commitSession(session) } });
    }

    let headers = {};
    if (hasTokenExpired(auth.expires_at)) {
        auth = await retrieveToken({ refreshToken: auth.refresh_token });
        headers = { "Set-Cookie": tokenCookie.serialize(auth) };
    }

    const authContext = auth
        ? {
              auth,
              headers,
          }
        : {};

    return loader({ ...args, context: { ...args.context, ...authContext } });
}
