import { Typography, Link } from "@mui/material";

export default function ComingSoon() {
    return (
        <main style={{ textAlign: "center", padding: "2rem" }}>
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
