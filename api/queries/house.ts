"use server"
import {fetchRegistry} from "@/api/queries/registry";
import {getSuiClient} from "@/api/sui-client";
import {HouseModel} from "@/api/models/openplay-core";


export const fetchHouse = async (houseId: string): Promise<HouseModel | undefined> => {
    const client = getSuiClient();

    try {
        const response = await client.getObject({
            id: houseId,
            options: {
                showContent: true
            }
        });
        if (response.data?.content?.dataType === "moveObject") {
            return response.data.content.fields as unknown as HouseModel;
        }
    }
    catch (error) {
        console.error("Error fetching registry", error);
    }
    return undefined;
}

export const fetchAllHouses = async (): Promise<HouseModel[]> => {
    const registry = await fetchRegistry();
    if (!registry?.houses || registry.houses.length === 0) {
        return []; // Return early if games is undefined or empty
    }
    const data = await fetchHousesByIds(registry.houses);
    return data.filter((house) => house !== undefined) as HouseModel[];
};

export const fetchHousesByIds = async (houseIds: string[]): Promise<HouseModel[]> => {
    const client = getSuiClient();
    const response = await client.multiGetObjects({
        ids: houseIds,
        options: {
            showContent: true
        }
    });

    const houses = response.map(x => {
        if (x.data?.content?.dataType === "moveObject") {
            return x.data.content.fields as unknown as HouseModel;
        }
        return undefined;
    })
        .filter((house): house is HouseModel => house !== undefined);

    console.log(houses);
    return houses;
}