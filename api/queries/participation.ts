
import {getGraphQLClient} from "@/api/graphql-client";
import { GET_PARTICIPATIONS} from "@/api/queries/sui-graphql-queries";
import { ParticipationData} from "@/api/models/models";


export const fetchAllParticipations = async (owner: string) => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_PARTICIPATIONS,
        variables: {
            address: owner
        }
    });

    const rawData = result?.data?.address?.objects?.nodes;
    if (!rawData) {
        throw new Error(`Data not found for participations`);
    }
    const balanceManagers = rawData?.map((node: any) => {
        return node.contents.json as ParticipationData
    });
    return balanceManagers as ParticipationData[];
}