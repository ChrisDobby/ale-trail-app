import { Link } from "remix";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import format from "date-fns/format";
import { Train } from "../types";

type TrailProgressProps = {
    station: string;
    nextTrain?: Train;
    trailNotStarted: boolean;
    onMoveToNextStation: () => void;
    onGetNextTrain: () => void;
};
export default function TrailProgress({
    station,
    nextTrain = { index: 0, station: "", dateTime: "", due: false },
    trailNotStarted,
    onMoveToNextStation,
    onGetNextTrain,
}: TrailProgressProps) {
    const theme = useTheme();

    return (
        <Stack sx={{ flexGrow: 1, bgcolor: theme.palette.action.disabledBackground }} spacing={4}>
            {trailNotStarted && (
                <Typography sx={{ bgcolor: "background.paper", padding: "0.5rem", textAlign: "center" }} variant="h6">
                    This trail has not started
                </Typography>
            )}

            {station && (
                <Typography sx={{ bgcolor: "background.paper", padding: "0.5rem", textAlign: "center" }} variant="h6">
                    {`At ${station} station`}
                </Typography>
            )}

            {nextTrain.dateTime && (
                <Typography sx={{ bgcolor: "background.paper", padding: "0.5rem", textAlign: "center" }} variant="h6">
                    {`${nextTrain.due ? " Did you catch" : "Next train is"} the ${format(
                        new Date(nextTrain.dateTime),
                        "HH:mm",
                    )} to ${nextTrain.station}${nextTrain.due ? "?" : ""}`}
                </Typography>
            )}

            {!trailNotStarted && !nextTrain.dateTime && (
                <Typography sx={{ bgcolor: "background.paper", padding: "0.5rem", textAlign: "center" }} variant="h6">
                    This trail has finished
                </Typography>
            )}

            {(trailNotStarted || !nextTrain.due) && (
                <Link to="/dashboard" prefetch="intent" style={{ textDecoration: "none" }}>
                    <Button
                        sx={{ width: "100%" }}
                        variant="contained"
                        color="success"
                        startIcon={<KeyboardArrowLeftIcon />}
                    >
                        Go to your trails
                    </Button>
                </Link>
            )}

            {nextTrain.due && (
                <>
                    <Button variant="contained" color="success" onClick={onMoveToNextStation}>
                        Yes we caught it
                    </Button>
                    <Button variant="contained" color="error" onClick={onGetNextTrain}>
                        {"Fuck it, we'll get the next one"}
                    </Button>
                </>
            )}
        </Stack>
    );
}
