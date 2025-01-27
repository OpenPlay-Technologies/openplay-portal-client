import {fetchRegistry} from "@/api/queries/registry";
import {getGraphQLClient} from "@/api/graphql-client";
import {GET_MOVE_OBJECT_CONTENTS, GET_OBJECT_OWNER} from "@/api/queries/sui-graphql-queries";
import {HouseModel} from "@/api/models/openplay-core";


export const fetchHouse = async (houseId: string): Promise<HouseModel | undefined> => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_MOVE_OBJECT_CONTENTS,
        variables: {
            address: houseId,
        },
    });

    const rawData = result?.data?.object?.asMoveObject?.contents?.json;
    console.log(rawData);
    return rawData as HouseModel;
}

export const fetchAllHouses = async (): Promise<HouseModel[]> => {
    const registry = await fetchRegistry();
    if (!registry?.houses || registry.houses.length === 0) {
        return []; // Return early if games is undefined or empty
    }
    const data = await Promise.all(registry.houses.map(fetchHouse));
    return data.filter((house) => house !== undefined) as HouseModel[];
};

export const fetchHousesByIds = async (gameIds: string[]): Promise<Record<string, HouseModel>> => {

    const results = await Promise.allSettled(gameIds.map(fetchHouse));

    return results.reduce((acc, result, index) => {
        if (result.status === 'fulfilled' && result.value !== undefined) {
            acc[gameIds[index]] = result.value;
        }
        return acc;
    }, {} as Record<string, HouseModel>);
}

export const fetchTxCapOwner = async (txCapId: string): Promise<string | undefined> => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_OBJECT_OWNER,
        variables: {
            objectId: txCapId,
        },
    });
    
    // Extract the owner data from the query result
    const ownerData = result?.data?.object?.owner;

    if (!ownerData) {
        return undefined;
    }

    // Handle different owner types
    switch (ownerData.__typename) {
        case "AddressOwner":
            return ownerData.owner?.address; // AddressOwner has an `owner` field with `address`
        case "Parent":
            return ownerData.parent?.address; // Parent has a `parent` field with `address`
        default:
            console.warn(`Unsupported owner type: ${ownerData.__typename}`);
            return undefined; // Return undefined for unsupported types
    }
}