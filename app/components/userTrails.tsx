import { Link } from "remix";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import format from "date-fns/format";
import { Meeting } from "../types";

type UserTrailsProps = { trails: { id: string; meeting: Meeting }[] };
export default function UserTrails({ trails }: UserTrailsProps) {
    const theme = useTheme();

    return (
        <Stack sx={{ flexGrow: 1, bgcolor: theme.palette.action.disabledBackground }} spacing={2}>
            {trails.length === 0 && (
                <Typography sx={{ bgcolor: "background.paper", padding: "0.5rem", textAlign: "center" }} variant="h6">
                    You have no trails
                </Typography>
            )}
            {trails.length > 0 && (
                <Typography sx={{ bgcolor: "background.paper", padding: "0.5rem", textAlign: "center" }} variant="h6">
                    Your trails
                </Typography>
            )}
            <List>
                {trails.map(trail => (
                    <ListItem
                        key={trail.id}
                        sx={{ bgcolor: "background.paper" }}
                        secondaryAction={
                            <Link to={`/trail/${trail.id}`} prefetch="intent" style={{ textDecoration: "none" }}>
                                <IconButton>
                                    <KeyboardArrowRightIcon />
                                </IconButton>
                            </Link>
                        }
                    >
                        <ListItemText
                            secondary={trail.meeting.station.name}
                            primary={format(new Date(trail.meeting.dateTime), "dd-MMM-yyyy HH:mm")}
                        />
                    </ListItem>
                ))}
            </List>
        </Stack>
    );
}
