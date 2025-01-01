import {getGraphQLClient} from "@/api/graphql-client";
import {GET_EPOCH_ID} from "@/api/queries/sui-graphql-queries";


export const getCurrentEpoch = async (): Promise<number> => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_EPOCH_ID,
    });

    const rawData = result?.data?.epoch;
    if (!rawData) {
        throw new Error(`Data not found for current epoch`);
    }
    return rawData.epochId;
}