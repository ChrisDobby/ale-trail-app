import { Stop, Trail, Train, ProgressUpdate, StationId, TrainTimes } from "./types";
import trainTimes from "./trainTimes";

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
        return { index, depart: "", arrive: "", station: "", due: false };
    }

    return { index, ...stop.times, station: stop.to.name, due: currentDateTime > new Date(stop.times.depart) };
}

export function getNextTrain(trail: Trail, currentDateTime: Date, getLastIfNotDue: boolean) {
    switch (true) {
        case !trail.currentStop:
            return { depart: "", arrive: "", station: "", due: false };
        case trail.currentStop === "meeting":
            return nextTrainFromStop(0, trail.stops[0], currentDateTime);
        case trail.currentStop?.startsWith("stop:"): {
            const [, stopNo] = (trail.currentStop as string).split(":");
            const nextStopIndex = Number(stopNo) + 1;
            const nextTrain = nextTrainFromStop(nextStopIndex, trail.stops[nextStopIndex], currentDateTime);
            return getLastIfNotDue && !nextTrain.due && nextStopIndex > 0
                ? nextTrainFromStop(nextStopIndex - 1, trail.stops[nextStopIndex - 1], currentDateTime)
                : nextTrain;
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

export function getTimeOfNextTrain(
    fromStationId: StationId,
    toStationId: StationId,
    afterDateTime: string,
    trainNumber: number | null,
): (TrainTimes & { trainNumber: number }) | null {
    const [datePart] = afterDateTime.split("T");
    const times = trainTimes[fromStationId][toStationId].map(({ depart, arrive }) => ({
        depart: new Date(`${datePart}T${depart}`),
        arrive: new Date(`${datePart}T${arrive}`),
    }));
    const after = new Date(afterDateTime);
    const timesAfter = times.filter(time => time.depart > after);
    if (timesAfter.length === 0) {
        return null;
    }

    if (trainNumber) {
        const timeAtNumber = timesAfter[trainNumber - 1];
        const { depart, arrive } = timeAtNumber || timesAfter[timesAfter.length - 1];
        return {
            depart: depart.toISOString(),
            arrive: arrive.toISOString(),
            trainNumber,
        };
    }

    let result: (TrainTimes & { trainNumber: number }) | null = null;
    for (let i = 0; i < timesAfter.length; i += 1) {
        if (timesAfter[i].depart.getTime() > after.getTime() + 900000) {
            result = {
                depart: timesAfter[i].depart.toISOString(),
                arrive: timesAfter[i].arrive.toISOString(),
                trainNumber: i + 1,
            };
            break;
        }
    }

    const lastTimes = timesAfter[timesAfter.length - 1];
    return (
        result || {
            depart: lastTimes.depart.toISOString(),
            arrive: lastTimes.arrive.toISOString(),
            trainNumber: timesAfter.length,
        }
    );
}

export function moveOnByTrain(trail: Trail): Trail {
    const currentStation = getCurrentStation(trail);
    if (!currentStation) {
        return trail;
    }

    const moveFromStop = currentStation.stopIndex === null ? 0 : currentStation.stopIndex + 1;
    const updatedStops = trail.stops.slice(0, moveFromStop);
    let afterDateTime = trail.stops[moveFromStop].times.arrive;
    for (let i = moveFromStop; i < trail.stops.length; i += 1) {
        const stop = trail.stops[i];
        const timeOfNextTrain = getTimeOfNextTrain(
            stop.from.id as StationId,
            stop.to.id as StationId,
            afterDateTime,
            1,
        );
        if (!timeOfNextTrain) {
            break;
        }

        const newStop =
            new Date(timeOfNextTrain.depart) < new Date(stop.times.depart)
                ? stop
                : { ...stop, times: { arrive: timeOfNextTrain.arrive, depart: timeOfNextTrain.depart } };

        updatedStops.push(newStop);
        afterDateTime = timeOfNextTrain.arrive;
    }

    return { ...trail, stops: updatedStops };
}

function getPreviousCurrentStop(trail: Trail) {
    if (!trail.currentStop || trail.currentStop === "meeting") {
        return trail.currentStop;
    }

    if (trail.currentStop === "stop:0") {
        return "meeting";
    }

    const [, currentStopIndex] = trail.currentStop.split(":");
    return `stop:${Number(currentStopIndex) - 1}`;
}

function removeProgressUpdate(trail: Trail, progressUpdate: ProgressUpdate): Trail {
    return {
        ...trail,
        currentStop: getPreviousCurrentStop(trail),
        stops: trail.stops.map((stop, index) => ({ ...stop, dateTime: progressUpdate.stopTimes[index] })),
        progressUpdates: (trail.progressUpdates || []).filter(
            update => update.stop !== progressUpdate.stop && update.time !== progressUpdate.time,
        ),
    };
}
export function prepareTrailForUpdate(
    trail: Trail,
    updateForStop: string,
    updateForTime: string,
    updateAction: string,
    userId: string,
): [boolean, Trail] {
    const creatorUpdate = trail.createdBy === userId;
    const existingProgressUpdate = trail.progressUpdates?.find(
        update => update.stop === updateForStop && update.time === updateForTime,
    );

    switch (true) {
        case (!creatorUpdate && existingProgressUpdate) ||
            (creatorUpdate && existingProgressUpdate && existingProgressUpdate.action === updateAction):
            return [false, trail];
        case !existingProgressUpdate:
            return [true, trail];
        case creatorUpdate:
            return [true, removeProgressUpdate(trail, existingProgressUpdate as ProgressUpdate)];
        default:
            return [false, trail];
    }
}
