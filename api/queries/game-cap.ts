import {GameCapData} from "@/api/models/models";
import {getGraphQLClient} from "@/api/graphql-client";
import {GET_GAME_CAPS} from "@/api/queries/sui-graphql-queries";


export const fetchAllGameCaps = async (owner: string): Promise<GameCapData[]> => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_GAME_CAPS,
        variables: {
            address: owner
        }
    });

    const rawData = result?.data?.address?.objects?.nodes;
    if (!rawData) {
        throw new Error(`Data not found for balance managers`);
    }
    const gameCaps = rawData?.map((node: any) => {
        return node.contents.json as GameCapData
    });
    return gameCaps as GameCapData[];
}