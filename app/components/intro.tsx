import { Link as RemixLink } from "remix";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";

export default function Intro() {
    return (
        <Stack sx={{ padding: "2rem", textAlign: "center" }} spacing={2}>
            <Typography variant="h4" component="h1">
                The ale trail planner
            </Typography>
            <RemixLink to="/dashboard" style={{ textDecoration: "none" }}>
                <Button variant="contained" color="success">
                    Login
                </Button>
            </RemixLink>
            <Link href="https://github.com/chrisdobby/ale-trail-app">ale-trail-app repo</Link>
        </Stack>
    );
}
