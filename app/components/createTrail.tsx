import { useState, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import MobileStepper from "@mui/material/MobileStepper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { Link } from "remix";
import MeetingDateTime from "./meetingDateTime";
import SelectStops from "./selectStops";
import { Station, Stop, Meeting } from "../types";

const STEP_LABELS = ["Meeting details", "Select stops"];

export type TrailToCreate = { meeting: Meeting; stops: Stop[] };
type CreateTrailProps = { stations: Station[]; disabled: boolean; onCreate: (trail: TrailToCreate) => void };
export default function CreateTrail({ stations, disabled, onCreate }: CreateTrailProps) {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [selectedStops, setSelectedStops] = useState<Stop[]>([]);

    const handleNext = useCallback(() => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    }, [setActiveStep]);

    const handleCreate = () => {
        if (meeting) {
            onCreate({ meeting, stops: selectedStops });
        }
    };

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
                {activeStep === 0 && <MeetingDateTime stations={stations} onMeetingSelect={setMeeting} />}
                {activeStep === 1 && (
                    <SelectStops
                        visible={activeStep === 1}
                        stations={stations}
                        selectedStops={selectedStops}
                        meeting={meeting as Meeting}
                        setSelectedStops={setSelectedStops}
                    />
                )}
            </Box>
            <MobileStepper
                variant="progress"
                steps={2}
                position="bottom"
                activeStep={activeStep}
                sx={{ flexGrow: 1 }}
                nextButton={
                    <Button
                        size="small"
                        onClick={activeStep === 0 ? handleNext : handleCreate}
                        disabled={disabled || (activeStep === 0 && !meeting)}
                    >
                        {activeStep === 1 ? "Create" : "Next"}
                        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                    </Button>
                }
                backButton={
                    <Link to="/dashboard" prefetch="intent" style={{ textDecoration: "none" }}>
                        <Button size="small" disabled={disabled}>
                            Cancel
                        </Button>
                    </Link>
                }
            />
        </Box>
    );
}
