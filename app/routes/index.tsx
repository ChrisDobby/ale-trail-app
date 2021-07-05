import type { MetaFunction } from "remix";
import { Typography, Link, makeStyles } from "@material-ui/core";
import { Header } from "../components/header";

export let meta: MetaFunction = () => {
    return {
        title: "Ale trail planner",
        description: "Welcome to the ale trail planner",
    };
};

const useStyles = makeStyles(() => ({
    app: {},
    main: {
        textAlign: "center",
        padding: "2rem",
    },
}));

export default function Index() {
    const classes = useStyles();

    return (
        <div className={classes.app}>
            <Header />
            <main className={classes.main}>
                <Typography variant="h4" component="h1">
                    The ale trail planner
                </Typography>
                <Typography variant="h5" component="h2">
                    Coming soon...
                </Typography>
                <Link href="https://github.com/chrisdobby/ale-trail-app">ale-trail-app repo</Link>
            </main>
        </div>
    );
}
