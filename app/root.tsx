import type { LinksFunction, LoaderFunction } from "remix";
import { Meta, Links, Scripts, LiveReload } from "remix";
import { Outlet } from "react-router-dom";
import { AppThemeProvider } from "./context/appThemeContext";

import stylesUrl from "./styles/global.css";

export let links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: stylesUrl }];
};

export let loader: LoaderFunction = async () => {
    return { date: new Date() };
};

function Document({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.png" type="image/png" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
                />
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

export function ErrorBoundary({ error }: { error: Error }) {
    return (
        <Document>
            <h1>App Error</h1>
            <pre>{error.message}</pre>
            <p>Replace this UI with what you want users to see when your app throws uncaught errors.</p>
        </Document>
    );
}
