"use server"
import {getSuiClient} from "@/api/sui-client";
import {HouseAdminCapModel} from "@/api/models/openplay-core";
import {HOUSE_ADMIN_CAP_TYPE} from "@/api/core-constants";


export const fetchAllHouseAdminCaps = async (owner: string): Promise<HouseAdminCapModel[]> => {
    const client = getSuiClient();

    // Collect all
    let allCaps: HouseAdminCapModel[] = []

    // Run over all pages
    let hasNextPage = true;
    let currentCursor = undefined;

    while (hasNextPage) {
        const response = await client.getOwnedObjects({
            owner: owner,
            cursor: currentCursor,
            filter: {
                MatchAny: [
                    {
                        StructType: HOUSE_ADMIN_CAP_TYPE
                    }
                ],
            },
            options: {
                showContent: true
            }
        });
        const caps = response.data.map(x => {
            if (x.data?.content?.dataType === "moveObject") {
                return x.data.content.fields as unknown as HouseAdminCapModel;
            }
            return undefined;
        })
            .filter((cap): cap is HouseAdminCapModel => cap !== undefined);

        // Update pagination info
        hasNextPage = response.hasNextPage;
        currentCursor = response.nextCursor;
        // Append items
        allCaps = allCaps.concat(caps);
    }

    return allCaps;
}