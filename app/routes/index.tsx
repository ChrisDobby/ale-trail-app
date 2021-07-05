import type { MetaFunction } from "remix";
import { Typography } from "@material-ui/core";

export let meta: MetaFunction = () => {
    return {
        title: "Ale trail planner",
        description: "Welcome to the ale trail planner",
    };
};

export default function Index() {
    return (
        <main style={{ textAlign: "center", padding: "2rem" }}>
            <Typography variant="h4" component="h1">
                The ale trail planner
            </Typography>
            <Typography variant="h5" component="h2">
                Coming soon...
            </Typography>
            <p>
                <a href="https://github.com/chrisdobby/ale-trail-app">ale-trail-app repo</a>
            </p>
        </main>
    );
}
