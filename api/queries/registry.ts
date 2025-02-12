"use server"
import {getSuiClient} from "@/api/sui-client";
import {RegistryModel} from "@/api/models/openplay-core";

// export const fetchRegistry = async (): Promise<RegistryModel | undefined> => {
//     const gqlClient = getGraphQLClient();
//
//     try {
//         const result = await gqlClient.query({
//             query: GET_REGISTRY,
//         });
//
//         return result?.data?.objects?.nodes[0]?.asMoveObject?.contents?.json as RegistryModel;
//     }
//     catch (error) {
//         console.error("Error fetching registry", error);
//     }
// };

export const fetchRegistry = async (): Promise<RegistryModel | undefined> => {
    const client = getSuiClient();
    const registryId = process.env.NEXT_PUBLIC_REGISTRY_ID ?? "";
    
    try {
        let response = await client.getObject({
            id: registryId,
            options: {
                showContent: true
            }
        });
        if (response.data?.content?.dataType === "moveObject") {
            // @ts-ignore
            return response.data.content.fields as RegistryModel;
        }
    }
    catch (error) {
        console.error("Error fetching registry", error);
    }
    return undefined;
};
