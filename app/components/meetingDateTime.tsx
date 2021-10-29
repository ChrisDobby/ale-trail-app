import { useState } from "react";
import DateTimePicker from "@mui/lab/DateTimePicker";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import SelectStation from "./selectStation";
import { Station, Meeting } from "../types";

type MeetingDateTimeProps = {
    stations: Station[];
    onMeetingSelect: (meeting: Meeting | null) => void;
};
export default function MeetingDateTime({ stations, onMeetingSelect }: MeetingDateTimeProps) {
    const [dateTime, setDateTime] = useState(new Date().toISOString());
    const [station, setStation] = useState<Station>();

    const handleDateChange = (newDateTime: any) => {
        setDateTime(newDateTime.toISOString());
        onMeetingSelect(newDateTime && station ? { station, dateTime: newDateTime } : null);
    };

    const handleStationSelect = (newStation?: Station) => {
        setStation(newStation);
        onMeetingSelect(newStation && dateTime ? { station: newStation, dateTime } : null);
    };
    return (
        <Stack spacing={2} className="entry-container">
            <DateTimePicker
                label="Meeting date and time"
                value={dateTime}
                onChange={handleDateChange}
                renderInput={params => <TextField {...params} />}
            />
            <SelectStation
                stations={stations}
                station={station}
                label="Meeting station"
                onSelect={handleStationSelect}
            />
        </Stack>
    );
}
