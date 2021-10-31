import type { AppLoadContext } from "remix";

export type Station = { id: number; name: string };

export type Stop = { from: Station; to: Station; dateTime: string };

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

export type Auth = { access_token: string; refresh_token: string; expires_at: number };

export type AuthenticatedContext = AppLoadContext & { auth: Auth; headers: HeadersInit };

export type Store = {
    setTrail: (id: string, trail: Trail) => Promise<any>;
    updateProgress: (id: string, getUpdatedTrail: (trail: Trail) => Promise<[boolean, Trail]>) => Promise<boolean>;
    addTrailToUser: (userId: string, trailId: string, trail: UserTrail) => Promise<any>;
    getTrail: (id: string) => Promise<Trail | null>;
    trailsForUser: (userId: string) => Promise<UserTrail[]>;
};

export type StoreContext = AppLoadContext & { store: Store };

export type AuthenticatedStoreContext = AuthenticatedContext & StoreContext;

export type Train = { index: number; dateTime: string; station: string; due: boolean };
