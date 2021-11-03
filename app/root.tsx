import type { LinksFunction } from "remix";
import { Meta, Links, Scripts, LiveReload, useCatch } from "remix";
import { Outlet } from "react-router-dom";
import { AppThemeProvider } from "./context/appThemeContext";
import DateAdapter from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

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
                <LocalizationProvider dateAdapter={DateAdapter}>
                    <Outlet />
                </LocalizationProvider>
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
            <div style={{ width: "100%", textAlign: "center" }}>
                <h1>Application Error</h1>
                <h2>Something went a bit wrong</h2>
                <h3>Probably best to hit refresh and try again</h3>
                <h3>If you still have a problem then just relax and have a 🍻🍻🍻</h3>
            </div>
        </Document>
    );
}
