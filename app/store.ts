import { Database, ref, set, child, get, remove } from "firebase/database";
import { v4 as uuid } from "uuid";
import { Trail, UserTrail, Store, StoreContext } from "./types";

export type StoreLoaderArgs = { request: Request; context: StoreContext; params: any };

export function create(db: Database): Store {
    const getTrail = async (id: string) => (await get(child(ref(db), `trails/${id}`))).toJSON() as Trail | null;
    const setTrail = (id: string, trail: Trail) => set(ref(db, `trails/${id}`), trail);

    const updateProgress = async (
        id: string,
        updateForStop: string,
        updateForTime: string,
        getUpdatedTrail: () => Promise<Trail>,
    ) => {
        const existingLock = (await get(child(ref(db), `/locks/${id}`))).toJSON();
        if (existingLock) {
            return true;
        }

        const lockId = uuid();
        await set(ref(db, `locks/${id}/${lockId}`), { dateTime: new Date().toISOString() });

        try {
            const trail = await getTrail(id);
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
            (await get(child(ref(db), `users/${userId}/trails`))).toJSON() as Trail[],
        updateProgress,
    };
}
