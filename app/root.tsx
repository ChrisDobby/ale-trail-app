import type { LinksFunction } from "remix";
import { Meta, Links, Scripts, LiveReload, useCatch } from "remix";
import { Outlet } from "react-router-dom";
import { AppThemeProvider } from "./context/appThemeContext";

import stylesUrl from "./styles/global.css";
import "@emotion/styled";

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: stylesUrl }];
};

function Document({ children, title }: { children: React.ReactNode; title?: string }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.png" type="image/png" />
                {title ? <title>{title}</title> : null}
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <Scripts />
                {process.env.NODE_ENV === "development" && <LiveReload />}
            </body>
        </html>
    );
}

export default function App() {
    return (
        <Document>
            <AppThemeProvider>
                <Outlet />
            </AppThemeProvider>
        </Document>
    );
}

export function CatchBoundary() {
    const caught = useCatch();

    switch (caught.status) {
        case 401:
        case 404:
            return (
                <Document title={`${caught.status} ${caught.statusText}`}>
                    <h1>
                        {caught.status} {caught.statusText}
                    </h1>
                </Document>
            );

        default:
            throw new Error(`Unexpected caught response with status: ${caught.status}`);
    }
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);

    return (
        <Document title="Uh-oh!">
            <h1>App Error</h1>
            <pre>{error.message}</pre>
            <p>Replace this UI with what you want users to see when your app throws uncaught errors.</p>
        </Document>
    );
}
