import { GET_REGISTRY } from '@/api/queries/sui-graphql-queries';
import { RegistryData } from '@/api/models/models';
import {getGraphQLClient} from "@/api/graphql-client";

export const fetchRegistry = async (): Promise<RegistryData | undefined> => {
    const gqlClient = getGraphQLClient();
    
    try {
        const result = await gqlClient.query({
            query: GET_REGISTRY,
        });

        return result?.data?.objects?.nodes[0]?.asMoveObject?.contents?.json as RegistryData;
    }
    catch (error) {
        console.error("Error fetching registry", error);
    }
};
