import { DynamicData } from "../types/domain";

export async function emitGraphFeed(data: DynamicData) {
    console.log("[Graph Feed] Emitting data...");
    return { id: 'graph_simulated_id', data };
}
