import { useState, useEffect } from "react";
import { useFetcher } from "remix";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AddIcon from "@mui/icons-material/Add";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import format from "date-fns/format";
import { Station, Stop, Meeting } from "../types";
import SelectStation from "./selectStation";

type StopEntryProps = {
    station?: Station;
    previousStation: Station;
    previousTime: string;
    onSelectTime: (time: string) => void;
};
function StopEntry({ station, previousStation, previousTime, onSelectTime }: StopEntryProps) {
    const { type, data, load } = useFetcher();

    const loadUrl = `/trains/times?from=${previousStation.id}&to=${station?.id}&after=${previousTime}`;
    useEffect(() => {
        if (station) {
            load(loadUrl);
        }
    }, [station, previousStation]);

    const handleTimeChange = (diff: number) => () => {
        const trainNumber = (data?.trainNumber || 0) + diff;
        load(`${loadUrl}&trainNumber=${trainNumber}`);
    };

    return (
        <Stack spacing={2} sx={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <Typography variant="body1">{`${previousStation.name || ""} - ${station?.name || ""}`}</Typography>
            <Stack direction="row" spacing={2}>
                <Chip
                    sx={{ minWidth: "5rem" }}
                    label={type === "done" && station ? format(new Date(data.dateTime), "HH:mm") : ""}
                />
                <Button
                    disabled={!station || data?.trainNumber === 1}
                    startIcon={<ArrowLeftIcon />}
                    onClick={handleTimeChange(-1)}
                >
                    Earlier
                </Button>
                <Button disabled={!station} endIcon={<ArrowRightIcon />} onClick={handleTimeChange(1)}>
                    Later
                </Button>
            </Stack>
            <Button
                startIcon={<AddIcon />}
                color="success"
                variant="contained"
                onClick={() => onSelectTime(data.dateTime)}
                disabled={!station || type !== "done"}
            >
                Add stop
            </Button>
        </Stack>
    );
}

type SelectStopProps = { stations: Station[]; meeting: Meeting; previousStop?: Stop; onSelect: (stop: Stop) => void };
export default function SelectStop({ stations, meeting, previousStop, onSelect }: SelectStopProps) {
    const [station, setStation] = useState<Station>();

    const previousStation = previousStop ? previousStop.to : meeting.station;
    const handleSelectTime = (dateTime: string) => {
        if (station) {
            onSelect({ from: previousStation, to: station, dateTime });
            setStation(undefined);
        }
    };

    return (
        <>
            <SelectStation
                stations={stations}
                disabledStations={[previousStation]}
                label="Pick next station"
                station={station}
                onSelect={setStation}
            />
            <StopEntry
                station={station}
                previousStation={previousStation}
                previousTime={previousStop ? previousStop.dateTime : meeting.dateTime}
                onSelectTime={handleSelectTime}
            />
        </>
    );
}
