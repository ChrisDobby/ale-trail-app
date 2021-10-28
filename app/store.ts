import { Database, ref, set, child, get } from "firebase/database";
import { Trail, UserTrail, Store, StoreContext } from "./types";

export type StoreLoaderArgs = { request: Request; context: StoreContext; params: any };

export function create(db: Database): Store {
    return {
        setTrail: (id: string, trail: Trail) => set(ref(db, `trails/${id}`), trail),
        addTrailToUser: (userId: string, trailId: string, trail: UserTrail) =>
            set(ref(db, `users/${userId}/trails/${trailId}`), trail),
        getTrail: async (id: string) => (await get(child(ref(db), `trails/${id}`))).toJSON() as Trail | null,
        trailsForUser: async (userId: string) =>
            (await get(child(ref(db), `users/${userId}/trails`))).toJSON() as Trail[],
    };
}
