import { ChangeEvent, useState } from "react";
import { Link } from "remix";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";

export enum VerificationError {
    IncorrectCode = "code-error",
    CodeExpired = "expired-error",
}

function getErrorText(error?: VerificationError) {
    switch (error) {
        case VerificationError.IncorrectCode:
            return "Incorrect code";
        case VerificationError.CodeExpired:
            return "This code has expired";
        default:
            return "";
    }
}

type VerificationFormProps = {
    phoneNumber: string;
    error?: VerificationError;
    newCodeUrl: string;
    onCancel: () => void;
};

export default function VerificationForm({ phoneNumber, error, newCodeUrl, onCancel }: VerificationFormProps) {
    const [canSubmit, setCanSubmit] = useState(false);

    const theme = useTheme();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCanSubmit(Boolean(e.currentTarget.value));
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
                Code verification
            </Typography>
            <Typography sx={{ padding: "0.5rem", textAlign: "center", width: "100%" }} variant="body1">
                {`A code was sent to mobile number: ${phoneNumber}. To verify this is your number please enter the code below`}
            </Typography>
            <TextField
                sx={{ width: "20rem" }}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                label="Verification code"
                name="verificationCode"
                error={Boolean(error)}
                helperText={getErrorText(error)}
                onChange={handleChange}
            />
            <ButtonGroup variant="contained">
                <Button color="success" type="submit" disabled={!canSubmit}>
                    OK
                </Button>
                <Button color="error" onClick={onCancel}>
                    {"Don't bother"}
                </Button>
            </ButtonGroup>
            <Link to={newCodeUrl}>Get a new code</Link>
        </Stack>
    );
}
