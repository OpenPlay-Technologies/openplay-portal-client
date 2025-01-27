import {getGraphQLClient} from "@/api/graphql-client";
import {GET_BALANCE_MANAGERS} from "@/api/queries/sui-graphql-queries";
import {BalanceManagerModel} from "@/api/models/openplay-core";


export const fetchAllBalanceManagers = async (owner: string) => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_BALANCE_MANAGERS,
        variables: {
            address: owner
        }
    });

    const rawData = result?.data?.address?.objects?.nodes;
    if (!rawData) {
        throw new Error(`Data not found for balance managers`);
    }
    const balanceManagers = rawData?.map((node: any) => {
        return node.contents.json as BalanceManagerModel
    });
    return balanceManagers as BalanceManagerModel[];
}