import { createCookie } from "remix";

const TOKEN_COOKIE_NAME = "aletrail.token";

export const tokenCookie = createCookie(TOKEN_COOKIE_NAME, {
    httpOnly: true,
});
