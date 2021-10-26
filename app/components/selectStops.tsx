import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { SelectChangeEvent } from "@mui/material";
import { Station } from "../types";
import StationList from "./stationList";

type SelectStopsProps = {
    visible: boolean;
    stations: Station[];
    selectedStations: Station[];
    setSelectedStations: (stations: Station[]) => void;
};

export default function SelectStops({ visible, stations, selectedStations, setSelectedStations }: SelectStopsProps) {
    const handleAddClick = (event: SelectChangeEvent<string>) => {
        const selectedStation = stations.find(({ id }) => id === event.target.value) || null;
        if (selectedStation) {
            setSelectedStations([...selectedStations, selectedStation]);
        }
    };

    return (
        <div className="entry-container" style={{ display: visible ? "flex" : "none", flexDirection: "column" }}>
            <FormControl fullWidth sx={{ flexGrow: 1 }}>
                <InputLabel id="select-station-label">Add a station</InputLabel>
                <Select
                    sx={{ flexGrow: 1 }}
                    labelId="select-station-label"
                    label="Pick a station"
                    value={"__blank__"}
                    onChange={handleAddClick}
                >
                    <MenuItem value="__blank__" />
                    {stations.map(station => (
                        <MenuItem key={station.id} value={station.id}>
                            {station.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <StationList stations={selectedStations} setSelectedStations={setSelectedStations} />
        </div>
    );
}
