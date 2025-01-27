import {getGraphQLClient} from "@/api/graphql-client";
import {GET_MOVE_OBJECT_CONTENTS, GET_REFERRAL_CAPS} from "@/api/queries/sui-graphql-queries";
import {ReferralCapModel, ReferralModel} from "@/api/models/openplay-core";


export const fetchReferralById = async (referralId: string) => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_MOVE_OBJECT_CONTENTS,
        variables: {
            address: referralId
        }
    });
    const rawData = result?.data?.object?.asMoveObject?.contents?.json;
    return rawData as ReferralModel;
}


export const fetchAllOwnedReferrals = async (owner: string): Promise<ReferralModel[]> => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_REFERRAL_CAPS,
        variables: {
            address: owner
        }
    });

    const rawData = result?.data?.address?.objects?.nodes;
    if (!rawData) {
        throw new Error(`Data not found for referral caps`);
    }

    const referralCaps = rawData?.map((node: any) => {
        return node.contents.json as ReferralCapModel
    });

    const results = await Promise.allSettled(referralCaps.map(async (cap) => {
        return await fetchReferralById(cap.referral_id);
    }));

    // Filter fulfilled promises and extract values
    const referrals = results
        .filter((res) => res.status === 'fulfilled') // Keep only fulfilled promises
        .map((res) => (res as PromiseFulfilledResult<ReferralModel>).value); // Extract the values

    return referrals; // Return an array of ReferralData
};