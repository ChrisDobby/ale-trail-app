import { Station, Stop, Meeting } from "../types";
import SelectStop from "./selectStop";
import StopList from "./stopList";

type SelectStopsProps = {
    visible: boolean;
    stations: Station[];
    selectedStops: Stop[];
    meeting: Meeting;
    setSelectedStops: (stations: Stop[]) => void;
};

export default function SelectStops({ visible, stations, selectedStops, meeting, setSelectedStops }: SelectStopsProps) {
    const handleStopSelect = (stop: Stop) => {
        setSelectedStops([...selectedStops, stop]);
    };

    return (
        <div className="entry-container" style={{ display: visible ? "flex" : "none", flexDirection: "column" }}>
            <SelectStop
                stations={stations}
                previousStop={selectedStops[selectedStops.length - 1]}
                meeting={meeting}
                onSelect={handleStopSelect}
            />
            <StopList stops={selectedStops} meeting={meeting} setSelectedStops={setSelectedStops} />
        </div>
    );
}
