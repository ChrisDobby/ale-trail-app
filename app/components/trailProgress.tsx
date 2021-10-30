import { Link } from "remix";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";

type TrailProgressProps = {
    station: string;
    nextTrain: { dateTime: string; station: string; due: boolean };
    trailNotStarted: boolean;
};
export default function TrailProgress({ station, nextTrain, trailNotStarted }: TrailProgressProps) {
    const theme = useTheme();

    return (
        <Stack sx={{ flexGrow: 1, bgcolor: theme.palette.action.disabledBackground }} spacing={2}>
            {trailNotStarted && (
                <Typography sx={{ bgcolor: "background.paper", padding: "0.5rem", textAlign: "center" }} variant="h6">
                    This trail has not started
                </Typography>
            )}

            {(trailNotStarted || !nextTrain.due) && (
                <Link to="/dashboard">
                    <Button variant="contained" color="success" startIcon={<KeyboardArrowLeftIcon />}>
                        Go to your trails
                    </Button>
                </Link>
            )}
        </Stack>
    );
}
