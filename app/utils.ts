import { Stop, Trail } from "./types";

export function getCurrentStation(trail: Trail) {
    switch (true) {
        case !trail.currentStop:
            return "";
        case trail.currentStop === "meeting":
            return trail.meeting.station.name;
        case trail.currentStop?.startsWith("stop:"): {
            const [, stopNo] = (trail.currentStop as string).split(":");
            return trail.stops[Number(stopNo)].to.name;
        }
    }
}

function nextTrainFromStop(stop: Stop, currentDateTime: Date) {
    if (!stop) {
        return { dateTime: "", station: "", due: false };
    }

    return { dateTime: stop.dateTime, station: stop.to.name, due: currentDateTime > new Date(stop.dateTime) };
}

export function getNextTrain(trail: Trail, currentDateTime: Date) {
    switch (true) {
        case !trail.currentStop:
            return { dateTime: "", station: "", due: false };
        case trail.currentStop === "meeting":
            return nextTrainFromStop(trail.stops[0], currentDateTime);
        case trail.currentStop?.startsWith("stop:"): {
            const [, stopNo] = (trail.currentStop as string).split(":");
            return nextTrainFromStop(trail.stops[Number(stopNo)], currentDateTime);
        }
    }
}
