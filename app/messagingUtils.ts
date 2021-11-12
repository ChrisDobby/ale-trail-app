import format from "date-fns/format";
import { v4 as uuid } from "uuid";
import { PhoneNumberVerification, Stop, Store, Trail } from "./types";
import { getCurrentStation } from "./utils";

async function sendSMS(phoneNumbers: string[], message: string, scheduledTime?: string): Promise<string[]> {
    console.log(`Sending SMS to ${phoneNumbers} with message ${message}`);
    if (scheduledTime) {
        console.log(`Scheduled time: ${scheduledTime}`);
    }

    return phoneNumbers.map(() => uuid());
}

async function removeSMS(smsId: string) {
    console.log(`Removing SMS ${smsId}`);
}

export function sendVerificationMessage({ phoneNumber, verificationCode }: PhoneNumberVerification) {
    const message = `Your Ale Trail verification code is ${verificationCode}`;
    sendSMS([phoneNumber], message);
}

async function sendTrainDueMessage(stop: Stop, phoneNumbers: string[]): Promise<string[]> {
    const message = `🚉 10 minutes until the ${format(new Date(stop.times.depart), "HH:mm")} from ${
        stop.from.name
    } to ${stop.to.name}. Drink up 🍻🍻`;

    const scheduledDateTime = new Date(stop.times.depart);
    scheduledDateTime.setMinutes(scheduledDateTime.getMinutes() - 10);
    const scheduledTime = format(scheduledDateTime, "yyyy-MM-dd HH:mm:ss");

    return sendSMS(phoneNumbers, message, scheduledTime);
}

async function sendCaughtTrainMessage(stop: Stop, trailId: string, phoneNumbers: string[]): Promise<string[]> {
    const message = `🚉 Did you get the ${format(new Date(stop.times.depart), "HH:mm")} from ${stop.from.name} to ${
        stop.to.name
    }? https://ale-trail.chrisdobby.dev/trail/${trailId}/progress`;

    return sendSMS(phoneNumbers, message, stop.times.arrive);
}

export async function clearTrailMessages(trail: Trail, store: Store): Promise<void> {
    const messageIds = await store.getTrailMessageIds(trail.id);
    await Promise.all(messageIds.map(messageId => removeSMS(messageId)));
}

export async function sendTrainMessages(trail: Trail, store: Store): Promise<void> {
    const currentStation = getCurrentStation(trail);
    if (!currentStation) {
        return;
    }

    const stop = trail.stops[(currentStation.stopIndex === null ? -1 : currentStation.stopIndex) + 1];
    if (!stop) {
        return;
    }

    const phoneNumbers = await store.getPhoneNumbersForTrail(trail.id);
    const messageIds = (
        await Promise.all([
            sendTrainDueMessage(stop, phoneNumbers),
            sendCaughtTrainMessage(stop, trail.id, phoneNumbers),
        ])
    ).flat();

    await store.setTrailMessageIds(trail.id, messageIds);
}
