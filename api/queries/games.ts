import {fetchRegistry} from "@/api/queries/registry";
import {GameData} from "@/api/models/models";
import {getGraphQLClient} from "@/api/graphql-client";
import {GET_MOVE_OBJECT_CONTENTS} from "@/api/queries/sui-graphql-queries";


export const fetchGame = async (gameId: string): Promise<GameData | undefined> => {
    const graphqlClient = getGraphQLClient();
    const result = await graphqlClient.query({
        query: GET_MOVE_OBJECT_CONTENTS,
        variables: {
            address: gameId,
        },
    });

    const rawData = result?.data?.object?.asMoveObject?.contents?.json;
    return rawData as GameData;
}

export const fetchAllGames = async (): Promise<GameData[]> => {
    const registry = await fetchRegistry();
    if (!registry?.games || registry.games.length === 0) {
        return []; // Return early if games is undefined or empty
    }
    const data = await Promise.all(registry.games.map(fetchGame));
    return data.filter((game) => game !== undefined) as GameData[];
};

export const fetchGamesByIds = async (gameIds: string[]): Promise<Record<string, GameData>> => {

    const results = await Promise.allSettled(gameIds.map(fetchGame));

    return results.reduce((acc, result, index) => {
        if (result.status === 'fulfilled' && result.value !== undefined) {
            acc[gameIds[index]] = result.value;
        }
        return acc;
    }, {} as Record<string, GameData>);
}