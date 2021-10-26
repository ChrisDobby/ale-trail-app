import { useState } from "react";
import DateTimePicker from "@mui/lab/DateTimePicker";
import TextField from "@mui/material/TextField";

type MeetingDateTimeProps = { visible: boolean };
export default function MeetingDateTime({ visible }: MeetingDateTimeProps) {
    const [value, setValue] = useState();

    const handleDateChange = (newDate: any) => {
        setValue(newDate);
    };
    return (
        <div className="entry-container" style={{ display: visible ? "block" : "none" }}>
            <DateTimePicker
                label="Meeting date and time"
                value={value}
                onChange={handleDateChange}
                renderInput={params => <TextField {...params} />}
            />
        </div>
    );
}
