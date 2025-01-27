import {getGraphQLClient} from "@/api/graphql-client";
import {GET_HOUSE_ADMIN_CAPS} from "@/api/queries/sui-graphql-queries";
import {HouseAdminCapModel} from "@/api/models/openplay-core";


export const fetchAllHouseAdminCaps = async (owner: string): Promise<HouseAdminCapModel[]> => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_HOUSE_ADMIN_CAPS,
        variables: {
            address: owner
        }
    });

    const rawData = result?.data?.address?.objects?.nodes;
    if (!rawData) {
        throw new Error(`Data not found for balance managers`);
    }
    const gameCaps = rawData?.map((node: any) => {
        return node.contents.json as HouseAdminCapModel
    });
    return gameCaps as HouseAdminCapModel[];
}