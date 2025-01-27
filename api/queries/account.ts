import {getGraphQLClient} from "@/api/graphql-client";
import { fromHex, toBase64} from "@mysten/bcs";
import {GET_DYNAMIC_VALUE} from "@/api/queries/sui-graphql-queries";
import {AccountModel} from "@/api/models/openplay-core";

export const fetchAccount = async (accountTableId: string, balanceManagerId: string): Promise<AccountModel | undefined> => {
    const gqlClient = getGraphQLClient();
    const idBcs = toBase64(fromHex(balanceManagerId));
    const result = await gqlClient.query({
        query: GET_DYNAMIC_VALUE,
        variables: {
            owner: accountTableId,
            type: "0x2::object::ID",
            bcs: idBcs
        }
    });
    // @ts-ignore
    return result?.data?.owner?.dynamicField?.value?.json as AccountData;
};