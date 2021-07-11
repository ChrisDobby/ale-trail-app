import { Typography, Link, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
    main: {
        textAlign: "center",
        padding: "2rem",
    },
}));

export default function ComingSoon() {
    const classes = useStyles();
    return (
        <main className={classes.main}>
            <Typography variant="h4" component="h1">
                The ale trail planner
            </Typography>
            <Typography variant="h5" component="h2">
                Coming soon...
            </Typography>
            <Link href="https://github.com/chrisdobby/ale-trail-app">ale-trail-app repo</Link>
        </main>
    );
}
