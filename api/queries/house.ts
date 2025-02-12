"use server"
import {fetchRegistry} from "@/api/queries/registry";
import {getSuiClient} from "@/api/sui-client";
import {HouseModel} from "@/api/models/openplay-core";


// export const fetchHouse = async (houseId: string): Promise<HouseModel | undefined> => {
//     const graphqlClient = getGraphQLClient();
//     const result = await graphqlClient.query({
//         query: GET_MOVE_OBJECT_CONTENTS,
//         variables: {
//             address: houseId,
//         },
//     });
//
//     const rawData = result?.data?.object?.asMoveObject?.contents?.json;
//     return rawData as HouseModel;
// }

export const fetchHouse = async (houseId: string): Promise<HouseModel | undefined> => {
    const client = getSuiClient();

    try {
        let response = await client.getObject({
            id: houseId,
            options: {
                showContent: true
            }
        });
        if (response.data?.content?.dataType === "moveObject") {
            console.log(response.data.content.fields);
            // @ts-ignore
            return response.data.content.fields as HouseModel;
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
    const data = await Promise.all(registry.houses.map(fetchHouse));
    return data.filter((house) => house !== undefined) as HouseModel[];
};

// export const fetchHousesByIds = async (gameIds: string[]): Promise<Record<string, HouseModel>> => {
//
//     const results = await Promise.allSettled(gameIds.map(fetchHouse));
//
//     return results.reduce((acc, result, index) => {
//         if (result.status === 'fulfilled' && result.value !== undefined) {
//             acc[gameIds[index]] = result.value;
//         }
//         return acc;
//     }, {} as Record<string, HouseModel>);
// }

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
            // @ts-ignore
            return x.data.content.fields as HouseModel;
        }
        return undefined;
    })
        .filter((house): house is HouseModel => house !== undefined);

    console.log(houses);
    return houses;
}