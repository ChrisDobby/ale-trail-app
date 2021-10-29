import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import format from "date-fns/format";
import { Trail } from "../types";
import StopList from "./stopList";

type JoinTrailProps = { trail: Trail; canJoin: boolean; onJoin: () => void };
export default function JoinTrail({ trail, canJoin, onJoin }: JoinTrailProps) {
    const theme = useTheme();

    return (
        <Stack sx={{ flexGrow: 1, bgcolor: theme.palette.action.disabledBackground }} spacing={2}>
            <Typography sx={{ bgcolor: "background.paper", padding: "0.5rem", textAlign: "center" }} variant="h6">
                {format(new Date(trail.meeting.dateTime), "dd-MMM-yyyy HH:mm")}
            </Typography>
            {canJoin && (
                <Button variant="contained" color="success" onClick={onJoin} endIcon={<KeyboardArrowRightIcon />}>
                    Join the trail
                </Button>
            )}
            {!canJoin && (
                <Typography sx={{ padding: "0.5rem", textAlign: "center" }} variant="body1">
                    You have already joined this trail
                </Typography>
            )}
            <StopList stops={trail.stops} meeting={trail.meeting} readOnly />
        </Stack>
    );
}
