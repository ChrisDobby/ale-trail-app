import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { SelectChangeEvent } from "@mui/material";
import { Station } from "../types";

type SelectStationProps = {
    stations: Station[];
    disabledStations?: Station[];
    station?: Station;
    label: string;
    onSelect: (station?: Station) => void;
};
export default function SelectStation({
    stations,
    disabledStations = [],
    station,
    label,
    onSelect,
}: SelectStationProps) {
    const handleStationSelect = (event: SelectChangeEvent<string>) =>
        onSelect(stations.find(({ id }) => id === event.target.value));
    const disabledStationIds = disabledStations.map(({ id }) => id);
    return (
        <FormControl fullWidth>
            <InputLabel id="select-station-label">{label}</InputLabel>

            <Select
                sx={{ flexGrow: 1 }}
                labelId="select-station-label"
                label={label}
                value={station?.id || "__blank__"}
                onChange={handleStationSelect}
            >
                <MenuItem value="__blank__" />
                {stations.map(({ id, name }) => (
                    <MenuItem key={id} value={id} disabled={disabledStationIds.includes(id)}>
                        {name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
