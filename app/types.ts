import type { AppLoadContext } from "remix";

export type Station = { id: number; name: string };

export type TrainTimes = { depart: string; arrive: string };

export type Stop = { from: Station; to: Station; times: TrainTimes };

export type Meeting = { dateTime: string; station: Station };

export type ProgressUpdate = { stop: string; time: string; action: "next" | "missed"; stopTimes: string[] };
export type Trail = {
    id: string;
    meeting: Meeting;
    stops: Stop[];
    createdBy: string;
    currentStop?: string;
    progressUpdates?: ProgressUpdate[];
};

export type UserTrail = {
    id: string;
    meeting: Meeting;
};

export type UserDetails = {
    phoneNumber: string;
};

export type PhoneNumberVerification = {
    phoneNumber: string;
    verificationCode: string;
    expires: string;
    trailId: string;
};

export type Auth = { access_token: string; refresh_token: string; id_token: string; expires_at: number };

export type AuthenticatedContext = AppLoadContext & { auth: Auth; headers: HeadersInit };

export type Store = {
    setTrail: (id: string, trail: Trail) => Promise<any>;
    updateProgress: (id: string, getUpdatedTrail: (trail: Trail) => Promise<[boolean, Trail]>) => Promise<boolean>;
    addTrailToUser: (userId: string, trailId: string, trail: UserTrail) => Promise<any>;
    getTrail: (id: string) => Promise<Trail | null>;
    trailsForUser: (userId: string) => Promise<UserTrail[]>;
    getUserDetails: (userId: string) => Promise<UserDetails | null>;
    setUserDetails: (userId: string, details: UserDetails) => Promise<any>;
    getPhoneNumberVerification: (userId: string) => Promise<PhoneNumberVerification | null>;
    setPhoneNumberVerification: (userId: string, verification: PhoneNumberVerification) => Promise<any>;
    removePhoneNumberVerification: (userId: string) => Promise<any>;
    addPhoneNumberToTrail: (trailId: string, phoneNumber: string) => Promise<any>;
    getPhoneNumbersForTrail: (trailId: string) => Promise<string[]>;
};

export type StoreContext = AppLoadContext & { store: Store };

export type AuthenticatedStoreContext = AuthenticatedContext & StoreContext;

export type Train = { index: number; depart: string; arrive: string; station: string; due: boolean };

export type StationId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
