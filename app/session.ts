import { createCookieSessionStorage } from "remix";

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
    cookie: {
        name: "__session",
        secrets: ["al3tr@1l"],
        sameSite: "lax",
    },
});

export { getSession, commitSession, destroySession };
