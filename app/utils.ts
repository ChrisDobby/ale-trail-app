import { Stop, Trail, Train } from "./types";

export function getCurrentStation(trail: Trail) {
    switch (true) {
        case !trail.currentStop:
            return { name: "", stopIndex: null };
        case trail.currentStop === "meeting":
            return { name: trail.meeting.station.name, stopIndex: null };
        case trail.currentStop?.startsWith("stop:"): {
            const [, stopNo] = (trail.currentStop as string).split(":");
            const stopIndex = Number(stopNo);
            return { name: trail.stops[stopIndex].to.name, stopIndex };
        }
    }
}

function nextTrainFromStop(index: number, stop: Stop, currentDateTime: Date): Train {
    if (!stop) {
        return { index, dateTime: "", station: "", due: false };
    }

    return { index, dateTime: stop.dateTime, station: stop.to.name, due: currentDateTime > new Date(stop.dateTime) };
}

export function getNextTrain(trail: Trail, currentDateTime: Date) {
    switch (true) {
        case !trail.currentStop:
            return { dateTime: "", station: "", due: false };
        case trail.currentStop === "meeting":
            return nextTrainFromStop(0, trail.stops[0], currentDateTime);
        case trail.currentStop?.startsWith("stop:"): {
            const [, stopNo] = (trail.currentStop as string).split(":");
            const nextStopIndex = Number(stopNo) + 1;
            return nextTrainFromStop(nextStopIndex, trail.stops[nextStopIndex], currentDateTime);
        }
    }
}

function getNextStop(currentStop?: string) {
    if (!currentStop) {
        return "meeting";
    }

    if (currentStop === "meeting") {
        return "stop:0";
    }

    const [, stopNo] = currentStop.split(":");
    return `stop:${Number(stopNo) + 1}`;
}

export function moveToNextStation(trail: Trail): Trail {
    return { ...trail, currentStop: getNextStop(trail.currentStop) };
}

export function storedTrailToTrail(storedTrail: any): Trail {
    return {
        ...storedTrail,
        stops: Object.values(storedTrail.stops),
        progressUpdates: storedTrail.progressUpdates ? Object.values(storedTrail.progressUpdates) : [],
    };
}
