import { Database, ref, set, child, get, remove } from "firebase/database";
import { v4 as uuid } from "uuid";
import { Trail, UserTrail, Store, StoreContext, UserDetails, PhoneNumberVerification } from "./types";
import { storedTrailToTrail } from "./utils";

export type StoreLoaderArgs = { request: Request; context: StoreContext; params: any };

const EXPIRED_LOCK_MS = 120000;
type TrailLock = { [id: string]: { dateTime: string } };
export function create(db: Database): Store {
    const getTrail = async (id: string) => (await get(child(ref(db), `trails/${id}`))).toJSON() as Trail | null;
    const setTrail = (id: string, trail: Trail) => set(ref(db, `trails/${id}`), trail);

    const getExistingLock = async (id: string, currentDate: Date) => {
        const existingLocks = (await get(child(ref(db), `/locks/${id}`))).toJSON() as TrailLock | null;
        if (!existingLocks) {
            return null;
        }

        const expiredLockIds = Object.entries(existingLocks)
            .filter(([, lock]) => currentDate.getTime() - new Date(lock.dateTime).getTime() > EXPIRED_LOCK_MS)
            .map(([lockId]) => lockId);

        if (expiredLockIds.length === 0) {
            return existingLocks;
        }

        for (const expiredLockId of expiredLockIds) {
            remove(ref(db, `/locks/${id}/${expiredLockId}`));
        }

        const unexpiredLocks: TrailLock = {};
        for (const lockEntry of Object.entries(existingLocks)) {
            const [lockId, lock] = lockEntry;
            if (!expiredLockIds.includes(lockId)) {
                unexpiredLocks[lockId] = lock;
            }
        }

        return unexpiredLocks === {} ? null : unexpiredLocks;
    };

    const updateProgress = async (id: string, getUpdatedTrail: (trail: Trail) => Promise<[boolean, Trail]>) => {
        const existingLock = await getExistingLock(id, new Date());
        if (existingLock) {
            return true;
        }

        const lockId = uuid();
        await set(ref(db, `locks/${id}/${lockId}`), { dateTime: new Date().toISOString() });

        try {
            const trail = storedTrailToTrail(await getTrail(id));
            if (!trail) {
                return true;
            }

            const [updateRequired, updatedTrail] = await getUpdatedTrail(trail);
            if (!updateRequired) {
                return true;
            }

            const recheckLocks = (await get(child(ref(db), `/locks/${id}`))).toJSON();
            if (
                !recheckLocks ||
                Object.keys(recheckLocks).length !== 1 ||
                !Object.keys(recheckLocks).includes(lockId)
            ) {
                return false;
            }

            await setTrail(id, updatedTrail);
        } finally {
            remove(ref(db, `/locks/${id}/${lockId}`));
        }

        return true;
    };

    return {
        setTrail,
        addTrailToUser: (userId: string, trailId: string, trail: UserTrail) =>
            set(ref(db, `users/${userId}/trails/${trailId}`), trail),
        getTrail,
        trailsForUser: async (userId: string) =>
            ((await get(child(ref(db), `users/${userId}/trails`))).toJSON() || []) as Trail[],
        updateProgress,
        getUserDetails: async (userId: string) =>
            ((await get(child(ref(db), `users/${userId}/details`))).toJSON() as UserDetails) || null,
        setUserDetails: (userId: string, details: UserDetails) => set(ref(db, `users/${userId}/details`), details),
        getPhoneNumberVerification: async (userId: string) =>
            ((await get(child(ref(db), `users/${userId}/numberVerification`))).toJSON() as PhoneNumberVerification) ||
            null,
        setPhoneNumberVerification: (userId: string, verification: PhoneNumberVerification) =>
            set(ref(db, `users/${userId}/numberVerification`), verification),
        addPhoneNumberToTrail: (trailId: string, phoneNumber: string) => Promise.resolve(),
    };
}
