/* eslint-disable react/jsx-key */
import { Children } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import TrainIcon from "@mui/icons-material/Train";
import PeopleIcon from "@mui/icons-material/People";
import DeleteIcon from "@mui/icons-material/Delete";
import format from "date-fns/format";
import { Stop, Meeting } from "../types";

type StopItemProps = { stop: Stop; readOnly: boolean; onDelete: () => void };
function StopItem({ stop, readOnly, onDelete }: StopItemProps) {
    return (
        <ListItem
            sx={{ bgcolor: "background.paper" }}
            secondaryAction={
                !readOnly ? (
                    <IconButton edge="end" onClick={onDelete}>
                        <DeleteIcon />
                    </IconButton>
                ) : null
            }
        >
            <ListItemAvatar>
                <Avatar>
                    <TrainIcon />
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={`${stop.from.name} to ${stop.to.name}`}
                secondary={format(new Date(stop.dateTime), "HH:mm")}
            />
        </ListItem>
    );
}

type StopListProps = {
    stops: Stop[];
    meeting: Meeting;
    readOnly?: boolean;
    setSelectedStops?: (stops: Stop[]) => void;
};
export default function StopList({ stops, meeting, readOnly = false, setSelectedStops = () => {} }: StopListProps) {
    const handleDelete = (index: number) => () => {
        setSelectedStops(stops.filter((_, stopIndex) => index !== stopIndex));
    };

    return (
        <List>
            <ListItem sx={{ bgcolor: "background.paper" }}>
                <ListItemAvatar>
                    <Avatar>
                        <PeopleIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary={meeting.station.name} secondary={format(new Date(meeting.dateTime), "HH:mm")} />
            </ListItem>

            {Children.toArray(
                stops.map((stop, index) => (
                    <StopItem
                        stop={stop}
                        readOnly={readOnly || index !== stops.length - 1}
                        onDelete={handleDelete(index)}
                    />
                )),
            )}
        </List>
    );
}
