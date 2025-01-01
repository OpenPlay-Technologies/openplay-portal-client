import {getGraphQLClient} from "@/api/graphql-client";
import {GET_ACCOUNT_BALANCE} from "@/api/queries/sui-graphql-queries";

export const fetchBalance = async (address: string) => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_ACCOUNT_BALANCE,
        variables: {
            address: address,
        },
    });

    const rawData = result?.data?.address?.balance?.totalBalance;
    if (!rawData) {
        return 0;
    }
    return Number(rawData);
}