"use server"
import {getSuiClient} from "@/api/sui-client";
import {HouseAdminCapModel} from "@/api/models/openplay-core";
import {HOUSE_ADMIN_CAP_TYPE} from "@/api/core-constants";


// export const fetchAllHouseAdminCaps = async (owner: string): Promise<HouseAdminCapModel[]> => {
//     const graphqlClient = getGraphQLClient();
//     const result = await graphqlClient.query({
//         query: GET_HOUSE_ADMIN_CAPS,
//         variables: {
//             address: owner
//         }
//     });
//
//     const rawData = result?.data?.address?.objects?.nodes;
//     if (!rawData) {
//         throw new Error(`Data not found for balance managers`);
//     }
//     const gameCaps = rawData?.map((node: any) => {
//         return node.contents.json as HouseAdminCapModel
//     });
//     return gameCaps as HouseAdminCapModel[];
// }

export const fetchAllHouseAdminCaps = async (owner: string): Promise<HouseAdminCapModel[]> => {
    const client = getSuiClient();

    // Collect all
    var allCaps: HouseAdminCapModel[] = []

    // Run over all pages
    var hasNextPage = true;
    var currentCursor = undefined;

    while (hasNextPage) {
        let response = await client.getOwnedObjects({
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
                // @ts-ignore
                return x.data.content.fields as HouseAdminCapModel;
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