import {getGraphQLClient} from "@/api/graphql-client";
import {GET_ALL_COIN_FLIPS, GET_MOVE_OBJECT_CONTENTS} from "@/api/queries/sui-graphql-queries";
import {GameModel} from "@/api/models/openplay-coin-flip";


export const fetchGame = async (gameId: string): Promise<GameModel | undefined> => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_MOVE_OBJECT_CONTENTS,
        variables: {
            address: gameId,
        },
    });

    const rawData = result?.data?.object?.asMoveObject?.contents?.json;
    console.log(rawData);
    if (!rawData) {
        throw new Error(`Data not found for gameId: ${gameId}`);
    }
    return rawData as GameModel;
}

export const fetchGamesByIds = async (gameIds: string[]): Promise<Record<string, GameModel>> => {

    const results = await Promise.allSettled(gameIds.map(fetchGame));

    return results.reduce((acc, result, index) => {
        if (result.status === 'fulfilled' && result.value !== undefined) {
            acc[gameIds[index]] = result.value;
        }
        return acc;
    }, {} as Record<string, GameModel>);
}

export const fetchAllCoinFlipGames = async (): Promise<GameModel[]> => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_ALL_COIN_FLIPS,
    });
    const rawData = result?.data?.objects?.nodes;
    console.log(rawData);
    if (!rawData) {
        throw new Error(`Data not found for coin flips`);
    }
    const coinFlips = rawData.map((data: any) => 
        data.asMoveObject.contents.json as GameModel
    );
    return coinFlips;
}