import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import format from "date-fns/format";
import QrCode from "qrcode.react";
import { Trail } from "../types";
import StopList from "./stopList";

type InviteProps = { id: string };
function Invite({ id }: InviteProps) {
    const joinUrl = `https://ale-trail.chrisdobby.dev/trail/join/${id}`;
    return (
        <Stack alignItems="center">
            <Typography sx={{ padding: "0.5rem", textAlign: "center" }} variant="body1">
                To join the trail use this link
            </Typography>
            <a href={joinUrl}>{joinUrl}</a>
            <Typography sx={{ padding: "0.5rem", textAlign: "center" }} variant="body1">
                or scan the code
            </Typography>
            <QrCode value={joinUrl} />
        </Stack>
    );
}

type ViewTrailProps = { trail: Trail; canStart: boolean; onStart: () => void };
export default function ViewTrail({ trail, canStart, onStart }: ViewTrailProps) {
    const theme = useTheme();

    return (
        <Stack sx={{ flexGrow: 1, bgcolor: theme.palette.action.disabledBackground }} spacing={2}>
            <Typography sx={{ bgcolor: "background.paper", padding: "0.5rem", textAlign: "center" }} variant="h6">
                {format(new Date(trail.meeting.dateTime), "dd-MMM-yyyy HH:mm")}
            </Typography>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <StopList meeting={trail.meeting} stops={trail.stops} readOnly />
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Invite</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Invite id={trail.id} />
                </AccordionDetails>
            </Accordion>
            {canStart && (
                <Button variant="contained" color="success" onClick={onStart} endIcon={<KeyboardArrowRightIcon />}>
                    Start the trail
                </Button>
            )}
        </Stack>
    );
}
