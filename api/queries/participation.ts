"use server"
import {getSuiClient} from "@/api/sui-client";
import {ParticipationModel} from "@/api/models/openplay-core";
import {PARTICIPATION_TYPE} from "@/api/core-constants";

export const fetchAllParticipations = async (owner: string) => {
    const client = getSuiClient();

    // Collect all
    let allParticipations: ParticipationModel[] = []

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
                return x.data.content.fields as unknown as ParticipationModel;
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