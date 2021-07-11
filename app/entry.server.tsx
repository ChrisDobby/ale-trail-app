import ReactDOMServer from "react-dom/server";
import type { EntryContext } from "remix";
import { RemixServer } from "remix";
import { config } from "dotenv";

config();

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext,
) {
    let markup = ReactDOMServer.renderToString(<RemixServer context={remixContext} url={request.url} />);

    return new Response("<!DOCTYPE html>" + markup, {
        status: responseStatusCode,
        headers: {
            ...Object.fromEntries(responseHeaders),
            "Content-Type": "text/html",
        },
    });
}
