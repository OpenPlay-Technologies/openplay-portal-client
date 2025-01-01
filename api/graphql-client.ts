import { SuiGraphQLClient } from '@mysten/sui/graphql';

let gqlClient: SuiGraphQLClient | null = null;

export const getGraphQLClient = (): SuiGraphQLClient => {
    if (!gqlClient) {
        gqlClient = new SuiGraphQLClient({
            url: 'http://127.0.0.1:9125', // Replace with your actual endpoint
        });
    }
    return gqlClient;
};
