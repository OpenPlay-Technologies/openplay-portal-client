import { GET_REGISTRY } from '@/api/queries/sui-graphql-queries';
import {getGraphQLClient} from "@/api/graphql-client";
import {RegistryModel} from "@/api/models/openplay-core";

export const fetchRegistry = async (): Promise<RegistryModel | undefined> => {
    const gqlClient = getGraphQLClient();
    
    try {
        const result = await gqlClient.query({
            query: GET_REGISTRY,
        });

        return result?.data?.objects?.nodes[0]?.asMoveObject?.contents?.json as RegistryModel;
    }
    catch (error) {
        console.error("Error fetching registry", error);
    }
};
