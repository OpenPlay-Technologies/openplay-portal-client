"use server"
import {getSuiClient} from "@/api/sui-client";
import {ParticipationModel} from "@/api/models/openplay-core";
import {PARTICIPATION_TYPE} from "@/api/core-constants";


// export const fetchAllParticipations = async (owner: string) => {
//     const graphqlClient = getGraphQLClient();
//     const result = await graphqlClient.query({
//         query: GET_PARTICIPATIONS,
//         variables: {
//             address: owner
//         }
//     });
//
//     const rawData = result?.data?.address?.objects?.nodes;
//     if (!rawData) {
//         throw new Error(`Data not found for participations`);
//     }
//     const participations = rawData?.map((node: any) => {
//         return node.contents.json as ParticipationModel
//     });
//     return participations as ParticipationModel[];
// }

export const fetchAllParticipations = async (owner: string) => {
    const client = getSuiClient();

    // Collect all
    var allParticipations: ParticipationModel[] = []

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
                        StructType: PARTICIPATION_TYPE
                    }
                ],
            },
            options: {
                showContent: true
            }
        });
        const participations = response.data.map(x => {
            if (x.data?.content?.dataType === "moveObject") {
                // @ts-ignore
                return x.data.content.fields as ParticipationModel;
            }
            return undefined;
        })
            .filter((cap): cap is ParticipationModel => cap !== undefined);

        // Update pagination info
        hasNextPage = response.hasNextPage;
        currentCursor = response.nextCursor;
        // Append items
        allParticipations = allParticipations.concat(participations);
    }

    return allParticipations;
}