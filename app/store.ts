import { Database, ref, set, child, get, remove } from "firebase/database";
import { v4 as uuid } from "uuid";
import { Trail, UserTrail, Store, StoreContext } from "./types";
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

    const updateProgress = async (
        id: string,
        updateForStop: string,
        updateForTime: string,
        getUpdatedTrail: () => Promise<Trail>,
    ) => {
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
            if (trail.progressUpdates?.find(update => update.stop === updateForStop && update.time === updateForTime)) {
                return true;
            }

            const updatedTrail = await getUpdatedTrail();
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
    };
}
