"use server"
import {getSuiClient} from "@/api/sui-client";
import {RegistryModel} from "@/api/models/openplay-core";

export const fetchRegistry = async (): Promise<RegistryModel | undefined> => {
    const client = getSuiClient();
    const registryId = process.env.NEXT_PUBLIC_REGISTRY_ID ?? "";
    
    try {
        const response = await client.getObject({
            id: registryId,
            options: {
                showContent: true
            }
        });
        if (response.data?.content?.dataType === "moveObject") {
            return response.data.content.fields as unknown as RegistryModel;
        }
    }
    catch (error) {
        console.error("Error fetching registry", error);
    }
    return undefined;
};
