import format from "date-fns/format";
import FormData from "form-data";
import { PhoneNumberVerification, Stop, Store, Trail } from "./types";
import { getCurrentStation } from "./utils";

const TXT_LOCAL_API_KEY = process.env.TXT_LOCAL_API_KEY;

async function sendSMS(phoneNumbers: string[], message: string, scheduledTime?: string): Promise<void> {
    if (scheduledTime && new Date(scheduledTime) < new Date()) {
        console.log("Scheduled time is in the past, not sending SMS");
        return;
    }

    console.log(`Sending SMS to ${phoneNumbers} with message ${message}`);
    if (scheduledTime) {
        console.log(`Scheduled time: ${scheduledTime}`);
    }

    const form = new FormData();
    form.append("apikey", TXT_LOCAL_API_KEY);
    form.append("message", message);
    form.append(
        "numbers",
        phoneNumbers
            .map(num => Number(num))
            .filter(num => !isNaN(num))
            .join(","),
    );
    form.append("sender", "Ale trail");
    if (scheduledTime) {
        form.append("schedule_time", Math.floor(new Date(scheduledTime).getTime() / 1000));
    }

    const response = await fetch("https://api.txtlocal.com/send", {
        method: "POST",
        body: form as any,
    });

    if (response.ok) {
        console.log("SMS sent successfully");
    }
}

async function removeScheduledSMS() {
    const form = new FormData();
    form.append("apikey", TXT_LOCAL_API_KEY);
    const response = await fetch("https://api.txtlocal.com/get_scheduled", {
        method: "POST",
        body: form as any,
    });

    if (!response.ok) {
        return;
    }

    const result = await response.json();
    if (!result.scheduled) {
        return;
    }

    await Promise.all(
        result.scheduled.map(async (scheduled: any) => {
            const cancelForm = new FormData();
            cancelForm.append("apikey", TXT_LOCAL_API_KEY);
            cancelForm.append("sent_id", scheduled.id);
            await fetch("https://api.txtlocal.com/cancel_scheduled", {
                method: "POST",
                body: cancelForm as any,
            });
        }),
    );
}

export function sendVerificationMessage({ phoneNumber, verificationCode }: PhoneNumberVerification) {
    const message = `Your Ale Trail verification code is ${verificationCode}`;
    sendSMS([phoneNumber], message);
}

async function sendTrainDueMessage(stop: Stop, phoneNumbers: string[]): Promise<void> {
    const message = `🚉 10 minutes until the ${format(new Date(stop.times.depart), "HH:mm")} from ${
        stop.from.name
    } to ${stop.to.name}. Drink up 🍻🍻`;

    const scheduledDateTime = new Date(stop.times.depart);
    scheduledDateTime.setMinutes(scheduledDateTime.getMinutes() - 10);
    const scheduledTime = format(scheduledDateTime, "yyyy-MM-dd HH:mm:ss");

    return sendSMS(phoneNumbers, message, scheduledTime);
}

async function sendCaughtTrainMessage(stop: Stop, trailId: string, phoneNumbers: string[]): Promise<void> {
    const message = `🚉 Did you get the ${format(new Date(stop.times.depart), "HH:mm")} from ${stop.from.name} to ${
        stop.to.name
    }? https://ale-trail.chrisdobby.dev/trail/${trailId}/progress`;

    return sendSMS(phoneNumbers, message, stop.times.arrive);
}

export async function clearTrailMessages(): Promise<void> {
    return removeScheduledSMS();
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
    await Promise.all([sendTrainDueMessage(stop, phoneNumbers), sendCaughtTrainMessage(stop, trail.id, phoneNumbers)]);
}
