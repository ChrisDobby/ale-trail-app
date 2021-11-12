import { ChangeEvent, useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";

type PhoneNumberFormProps = {
    initialNumber?: string;
    onCancel: () => void;
};

export default function PhoneNumberForm({ initialNumber, onCancel }: PhoneNumberFormProps) {
    const [canSubmit, setCanSubmit] = useState(Boolean(initialNumber));

    const theme = useTheme();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCanSubmit(Boolean(e.currentTarget.value) && Number.isInteger(Number(e.currentTarget.value)));
    };

    return (
        <Stack
            sx={{ flexGrow: 1, bgcolor: theme.palette.action.disabledBackground, height: "100%", alignItems: "center" }}
            spacing={2}
        >
            <Typography
                sx={{ bgcolor: "background.paper", padding: "0.5rem", textAlign: "center", width: "100%" }}
                variant="h6"
            >
                SMS notifications
            </Typography>
            <Typography sx={{ padding: "0.5rem", textAlign: "center", width: "100%" }} variant="body1">
                If you would like to receive SMS notifications of due trains please enter your mobile number below
            </Typography>
            <TextField
                sx={{ width: "20rem" }}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                label="Mobile phone number"
                name="phoneNumber"
                defaultValue={initialNumber}
                onChange={handleChange}
            />
            <ButtonGroup variant="contained">
                <Button color="success" type="submit" disabled={!canSubmit}>
                    Set phone number
                </Button>
                <Button color="error" onClick={onCancel}>
                    {"Don't bother"}
                </Button>
            </ButtonGroup>
        </Stack>
    );
}
