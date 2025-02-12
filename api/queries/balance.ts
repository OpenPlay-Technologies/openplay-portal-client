"use server"
import {getSuiClient} from "@/api/sui-client";

// export const fetchBalance = async (address: string) => {
//     const graphqlClient = getGraphQLClient();
//     const result = await graphqlClient.query({
//         query: GET_ACCOUNT_BALANCE,
//         variables: {
//             address: address,
//         },
//     });
//
//     const rawData = result?.data?.address?.balance?.totalBalance;
//     if (!rawData) {
//         return 0;
//     }
//     return Number(rawData);
// }

export const fetchBalance = async (address: string) => {
    const client = getSuiClient();
    try {
        let response = await client.getBalance({
            owner: address,
            coinType: "0x2::sui::SUI"
        });
        return Number(response.totalBalance);
    }
    catch (error) {
        console.error("Error fetching balance", error);
    }
    return 0;
}