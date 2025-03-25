"use server"
import {getSuiClient} from "@/api/sui-client";
import {BalanceManagerCapModel, BalanceManagerModel, PlayCapModel} from "@/api/models/openplay-core";
import {BALANCE_MANAGER_CAP_TYPE, PLAY_CAP_TYPE} from "@/api/core-constants";

export const fetchBalanceManager = async (balanceManagerId: string): Promise<BalanceManagerModel | undefined> => {
    const client = getSuiClient();

    try {
        const response = await client.getObject({
            id: balanceManagerId,
            options: {
                showContent: true
            }
        });
        if (response.data?.content?.dataType === "moveObject") {
            return response.data.content.fields as unknown as BalanceManagerModel;
        }
    } catch (error) {
        console.error("Error fetching balance manager", error);
    }
    return undefined;
}

export const fetchAllBalanceManagerCaps = async (owner: string) => {
    const client = getSuiClient();

    // Collect all
    let allCaps: BalanceManagerCapModel[] = []

    // Run over all pages
    let hasNextPage = true;
    let currentCursor = undefined;

    while (hasNextPage) {
        const response = await client.getOwnedObjects({
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
                return x.data.content.fields as unknown as BalanceManagerCapModel;
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

export const fetchAllPlayCaps = async (owner: string) => {
    const client = getSuiClient();

    // Collect all
    let allCaps: PlayCapModel[] = []

    // Run over all pages
    let hasNextPage = true;
    let currentCursor = undefined;

    while (hasNextPage) {
        const response = await client.getOwnedObjects({
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
                return x.data.content.fields as unknown as PlayCapModel;
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
            return x.data.content.fields as unknown as BalanceManagerModel;
        }
        return undefined;
    })
    .filter((bm): bm is BalanceManagerModel => bm !== undefined);
    
    console.log(managers);
    return managers;
}