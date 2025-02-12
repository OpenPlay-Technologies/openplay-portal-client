"use server"
import {getSuiClient} from "@/api/sui-client";


// export const getCurrentEpoch = async (): Promise<number> => {
//     const graphqlClient = getGraphQLClient();
//     const result = await graphqlClient.query({
//         query: GET_EPOCH_ID,
//     });
//
//     const rawData = result?.data?.epoch;
//     if (!rawData) {
//         throw new Error(`Data not found for current epoch`);
//     }
//     return rawData.epochId;
// }

export const getCurrentEpoch = async (): Promise<number> => {
    const client = getSuiClient();

    let response = await client.getLatestSuiSystemState();
    return Number(response.epoch);
}