import { redirect } from "remix";
import type { Cookie, Session, LoaderFunction, AppLoadContext } from "remix";
import { v4 as uuidv4 } from "uuid";
import jwtDecode from "jwt-decode";
import { tokenCookie } from "./cookies";
import { Auth, AuthenticatedContext } from "./types";

const AUTH_CLIENT_ID = process.env.AUTH_CLIENT_ID || "";
const AUTH_CLIENT_SECRET = process.env.AUTH_CLIENT_SECRET || "";
const AUTH_URL = process.env.AUTH_URL || "";

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

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { access_token, refresh_token, id_token, expires_in } = await authResponse.json();
    return { access_token, refresh_token, id_token, expires_at: getSecondsSinceEpoch(new Date()) + expires_in };
}

type SecureOptions = {
    cookie: Cookie;
    getSession: (cookieHeader: string | null) => Promise<Session>;
    commitSession: (session: Session) => Promise<string>;
    args: {
        request: Request;
        context: AppLoadContext;
        params: any;
    };
};

export function getUser(auth: Auth) {
    return jwtDecode(auth.id_token) as any;
}

export async function logout(request: Request) {
    return redirect(`${AUTH_URL}/v2/logout?client_id=${AUTH_CLIENT_ID}&returnTo=${getHostUrl(request)}`, {
        headers: { "Set-Cookie": await tokenCookie.serialize("", { expires: new Date() }) },
    });
}

export async function getAuth(cookie: Cookie, request: Request): Promise<Auth | null> {
    const token = await cookie.parse(request.headers.get("Cookie"));
    return token || null;
}

export async function secure({ cookie, getSession, commitSession, args }: SecureOptions, loader: LoaderFunction) {
    const { request } = args;
    let auth = await getAuth(cookie, request);
    if (!auth) {
        const { pathname } = new URL(request.url);
        const session = await getSession(request.headers.get("Cookie"));
        const state = uuidv4();
        session.set("lastRequestPath", `${pathname}/` ?? "/");
        session.set("authState", state);

        const authUrl = `${AUTH_URL}/authorize?scope=offline_access openid profile&response_type=code&client_id=${AUTH_CLIENT_ID}&redirect_uri=${getRedirectUri(
            request,
        )}&state=${state}`;

        return redirect(authUrl, { headers: { "Set-Cookie": await commitSession(session) } });
    }

    let headers = {};
    if (hasTokenExpired(auth.expires_at)) {
        auth = await retrieveToken({ refreshToken: auth.refresh_token });
        headers = { "Set-Cookie": await cookie.serialize(auth) };
    }

    const authContext = auth
        ? {
              auth,
              headers,
          }
        : {};

    return loader({ ...args, context: { ...args.context, ...authContext } });
}
