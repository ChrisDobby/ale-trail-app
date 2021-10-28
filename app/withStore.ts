import { LoaderFunction, ActionFunction, AppLoadContext } from "remix";
import { initializeApp, FirebaseApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { create } from "./store";

let app: FirebaseApp | null = null;

const withStore =
    (handler: LoaderFunction | ActionFunction): LoaderFunction | ActionFunction =>
    (args: { request: Request; context: AppLoadContext; params: any }) => {
        if (!app) {
            app = initializeApp({
                apiKey: process.env.FIREBASE_API_KEY,
                authDomain: process.env.FIREBASE_AUTH_DOMAIN,
                databaseURL: process.env.FIREBASE_DATABASE_URL,
                projectId: process.env.FIREBASE_PROJECT_ID,
                appId: process.env.FIREBASE_APP_ID,
            });
        }

        const db = getDatabase(app);
        const { context, ...allArgs } = args;
        const contextWithStore = { ...context, store: create(db) };
        return handler({ ...allArgs, context: contextWithStore });
    };

export default withStore;
