import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import TrainIcon from "@mui/icons-material/Train";
import DeleteIcon from "@mui/icons-material/Delete";
import { Station } from "../types";

type StationItemProps = { station: Station; onDelete: () => void };
function StationItem({ station, onDelete }: StationItemProps) {
    return (
        <ListItem
            sx={{ bgcolor: "background.paper" }}
            secondaryAction={
                <IconButton edge="end" onClick={onDelete}>
                    <DeleteIcon />
                </IconButton>
            }
        >
            <ListItemAvatar>
                <Avatar>
                    <TrainIcon />
                </Avatar>
            </ListItemAvatar>
            <ListItemText primary={station.name} />
        </ListItem>
    );
}

type StationListProps = { stations: Station[]; setSelectedStations: (stations: Station[]) => void };
export default function StationList({ stations, setSelectedStations }: StationListProps) {
    const handleDelete = (index: number) => () => {
        setSelectedStations(stations.filter((_, stationIndex) => index !== stationIndex));
    };

    return (
        <List>
            {stations.map((station, index) => (
                <StationItem key={station.id} station={station} onDelete={handleDelete(index)} />
            ))}
        </List>
    );
}
