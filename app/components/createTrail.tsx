import { useState, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import { MobileStepper, Button, Box, Paper, Typography } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import MeetingDateTime from "./meetingDateTime";
import SelectStops from "./selectStops";
import { Station } from "../types";

const STEP_LABELS = ["Select date and time", "Select stops", "Select times"];

type CreateTrailProps = { stations: Station[] };
export default function CreateTrail({ stations }: CreateTrailProps) {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [selectedStations, setSelectedStations] = useState<Station[]>([]);

    const handleNext = useCallback(() => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    }, [setActiveStep]);

    const handleBack = useCallback(() => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    }, [setActiveStep]);

    return (
        <Box sx={{ flexGrow: 1, bgcolor: theme.palette.action.disabledBackground }}>
            <Paper
                square
                elevation={0}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    height: 50,
                    pl: 2,
                    bgcolor: "background.default",
                }}
            >
                <Typography>{STEP_LABELS[activeStep]}</Typography>
            </Paper>
            <Box>
                <MeetingDateTime visible={activeStep === 0} />
                <SelectStops
                    visible={activeStep === 1}
                    stations={stations}
                    selectedStations={selectedStations}
                    setSelectedStations={setSelectedStations}
                />
            </Box>
            <MobileStepper
                variant="progress"
                steps={3}
                position="bottom"
                activeStep={activeStep}
                sx={{ flexGrow: 1 }}
                nextButton={
                    <Button size="small" onClick={handleNext}>
                        {activeStep === 2 ? "Create" : "Next"}
                        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                    </Button>
                }
                backButton={
                    <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                        Back
                    </Button>
                }
            />
        </Box>
    );
}
