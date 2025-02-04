import {getGraphQLClient} from "@/api/graphql-client";
import {GET_BALANCE_MANAGER_CAPS, GET_MOVE_OBJECT_CONTENTS, GET_PLAY_CAPS} from "@/api/queries/sui-graphql-queries";
import {BalanceManagerCapModel, BalanceManagerModel, PlayCapModel} from "@/api/models/openplay-core";
export const fetchBalanceManager = async (balanceManagerId: string): Promise<BalanceManagerModel | undefined> => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_MOVE_OBJECT_CONTENTS,
        variables: {
            address: balanceManagerId,
        },
    });

    const rawData = result?.data?.object?.asMoveObject?.contents?.json;
    if (!rawData) {
        throw new Error(`Data not found for balanceManagerId: ${balanceManagerId}`);
    }
    return rawData as BalanceManagerModel;
}


export const fetchAllBalanceManagerCaps = async (owner: string) => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_BALANCE_MANAGER_CAPS,
        variables: {
            owner: owner
        }
    });

    const rawData = result?.data?.address?.objects?.nodes;
    if (!rawData) {
        throw new Error(`Data not found for balance managers`);
    }
    const balanceManagerCaps = rawData?.map((node) => {
        return node.contents?.json as BalanceManagerCapModel
    });
    return balanceManagerCaps as BalanceManagerCapModel[];
}

export const fetchAllPlayCaps = async (owner: string) => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_PLAY_CAPS,
        variables: {
            owner: owner
        }
    });

    const rawData = result?.data?.address?.objects?.nodes;
    if (!rawData) {
        throw new Error(`Data not found for balance managers`);
    }
    const balanceManagerCaps = rawData?.map((node) => {
        return node.contents?.json as PlayCapModel
    });
    return balanceManagerCaps as PlayCapModel[];
}

    export const fetchBalanceManagersByIds = async (balanceManagerIds: string[]): Promise<Record<string, BalanceManagerModel>> => {

    const results = await Promise.allSettled(balanceManagerIds.map(fetchBalanceManager));

    return results.reduce((acc, result, index) => {
        if (result.status === 'fulfilled' && result.value !== undefined) {
            acc[balanceManagerIds[index]] = result.value;
        }
        return acc;
    }, {} as Record<string, BalanceManagerModel>);
}

export const fetchBalanceManagerCapByTxDigest = async (owner: string, txDigest: string): Promise<BalanceManagerCapModel | null> => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_BALANCE_MANAGER_CAPS,
        variables: {
            owner: owner
        }
    });
    console.log('result', result);

    const rawData = result?.data?.address?.objects?.nodes.find((node) => {
        return node.digest === txDigest;
    });

    console.log('rawData', rawData);

    return rawData?.contents?.json as BalanceManagerCapModel ?? null;
}