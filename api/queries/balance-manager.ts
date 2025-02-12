"use server"
import {getSuiClient} from "@/api/sui-client";
import {BalanceManagerCapModel, BalanceManagerModel, PlayCapModel} from "@/api/models/openplay-core";
import {BALANCE_MANAGER_CAP_TYPE, PLAY_CAP_TYPE} from "@/api/core-constants";
// export const fetchBalanceManager = async (balanceManagerId: string): Promise<BalanceManagerModel | undefined> => {
//     const graphqlClient = getGraphQLClient();
//     const result = await graphqlClient.query({
//         query: GET_MOVE_OBJECT_CONTENTS,
//         variables: {
//             address: balanceManagerId,
//         },
//     });
//
//     const rawData = result?.data?.object?.asMoveObject?.contents?.json;
//     if (!rawData) {
//         throw new Error(`Data not found for balanceManagerId: ${balanceManagerId}`);
//     }
//     return rawData as BalanceManagerModel;
// }

export const fetchBalanceManager = async (balanceManagerId: string): Promise<BalanceManagerModel | undefined> => {
    const client = getSuiClient();

    try {
        let response = await client.getObject({
            id: balanceManagerId,
            options: {
                showContent: true
            }
        });
        if (response.data?.content?.dataType === "moveObject") {
            // @ts-ignore
            return response.data.content.fields as BalanceManagerModel;
        }
    } catch (error) {
        console.error("Error fetching balance manager", error);
    }
    return undefined;
}


// export const fetchAllBalanceManagerCaps = async (owner: string) => {
//     const graphqlClient = getGraphQLClient();
//     const result = await graphqlClient.query({
//         query: GET_BALANCE_MANAGER_CAPS,
//         variables: {
//             owner: owner
//         }
//     });
//
//     const rawData = result?.data?.address?.objects?.nodes;
//     if (!rawData) {
//         throw new Error(`Data not found for balance managers`);
//     }
//     const balanceManagerCaps = rawData?.map((node) => {
//         return node.contents?.json as BalanceManagerCapModel
//     });
//     return balanceManagerCaps as BalanceManagerCapModel[];
// }

export const fetchAllBalanceManagerCaps = async (owner: string) => {
    const client = getSuiClient();

    // Collect all
    var allCaps: BalanceManagerCapModel[] = []

    // Run over all pages
    var hasNextPage = true;
    var currentCursor = undefined;

    while (hasNextPage) {
        let response = await client.getOwnedObjects({
            owner: owner,
            cursor: currentCursor,
            filter: {
                MatchAny: [
                    {
                        StructType: BALANCE_MANAGER_CAP_TYPE
                    }
                ],
            },
            options: {
                showContent: true
            }
        });
        const caps = response.data.map(x => {
            if (x.data?.content?.dataType === "moveObject") {
                // @ts-ignore
                return x.data.content.fields as BalanceManagerCapModel;
            }
            return undefined;
        })
            .filter((cap): cap is BalanceManagerCapModel => cap !== undefined);

        // Update pagination info
        hasNextPage = response.hasNextPage;
        currentCursor = response.nextCursor;
        // Append items
        allCaps = allCaps.concat(caps);
    }

    return allCaps;
}

// export const fetchAllPlayCaps = async (owner: string) => {
//     const graphqlClient = getGraphQLClient();
//     const result = await graphqlClient.query({
//         query: GET_PLAY_CAPS,
//         variables: {
//             owner: owner
//         }
//     });
//
//     const rawData = result?.data?.address?.objects?.nodes;
//     if (!rawData) {
//         throw new Error(`Data not found for balance managers`);
//     }
//     const balanceManagerCaps = rawData?.map((node) => {
//         return node.contents?.json as PlayCapModel
//     });
//     return balanceManagerCaps as PlayCapModel[];
// }

export const fetchAllPlayCaps = async (owner: string) => {
    const client = getSuiClient();

    // Collect all
    var allCaps: PlayCapModel[] = []

    // Run over all pages
    var hasNextPage = true;
    var currentCursor = undefined;

    while (hasNextPage) {
        let response = await client.getOwnedObjects({
            owner: owner,
            cursor: currentCursor,
            filter: {
                MatchAny: [
                    {
                        StructType: PLAY_CAP_TYPE
                    }
                ],
            },
            options: {
                showContent: true
            }
        });
        const caps = response.data.map(x => {
            if (x.data?.content?.dataType === "moveObject") {
                // @ts-ignore
                return x.data.content.fields as PlayCapModel;
            }
            return undefined;
        })
            .filter((cap): cap is PlayCapModel => cap !== undefined);

        // Update pagination info
        hasNextPage = response.hasNextPage;
        currentCursor = response.nextCursor;
        // Append items
        allCaps = allCaps.concat(caps);
    }

    return allCaps;
}

// export const fetchBalanceManagersByIds = async (balanceManagerIds: string[]): Promise<Record<string, BalanceManagerModel>> => {
//
//     const results = await Promise.allSettled(balanceManagerIds.map(fetchBalanceManager));
//
//     return results.reduce((acc, result, index) => {
//         if (result.status === 'fulfilled' && result.value !== undefined) {
//             acc[balanceManagerIds[index]] = result.value;
//         }
//         return acc;
//     }, {} as Record<string, BalanceManagerModel>);
// }

export const fetchBalanceManagersByIds = async (balanceManagerIds: string[]): Promise<BalanceManagerModel[]> => {
    const client = getSuiClient();
    const response = await client.multiGetObjects({
        ids: balanceManagerIds,
        options: {
            showContent: true
        }
    });
    
    const managers = response.map(x => {
        if (x.data?.content?.dataType === "moveObject") {
            // @ts-ignore
            return x.data.content.fields as BalanceManagerModel;
        }
        return undefined;
    })
    .filter((bm): bm is BalanceManagerModel => bm !== undefined);
    
    console.log(managers);
    return managers;
}

// export const fetchBalanceManagerCapByTxDigest = async (owner: string, txDigest: string): Promise<BalanceManagerCapModel | null> => {
//     const graphqlClient = getGraphQLClient();
//     const result = await graphqlClient.query({
//         query: GET_BALANCE_MANAGER_CAPS,
//         variables: {
//             owner: owner
//         }
//     });
//     // console.log('result', result);
//
//     const rawData = result?.data?.address?.objects?.nodes.find((node) => {
//         return node.digest === txDigest;
//     });
//
//     // console.log('rawData', rawData);
//
//     return rawData?.contents?.json as BalanceManagerCapModel ?? null;
// }