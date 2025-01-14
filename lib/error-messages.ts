/**
 * A dictionary of modules and their error codes/messages.
 * Add more modules and errors as needed.
 */
const errorMessages: Record<string, Record<number, string>> = {
    coin_flip_context: {
        1: "Invalid state transition. The game state transition is not allowed in the current context.",
        2: "Unsupported result. The game result is not recognized or supported.",
        3: "Unsupported prediction. The predicted outcome is not valid for this game.",
    },
    coin_flip: {
        1: "Unsupported stake. The amount you are trying to stake is not allowed.",
        2: "Unsupported house edge. The house edge percentage is invalid or not supported.",
        3: "Unsupported payout factor. The payout factor provided is not valid.",
        4: "Unsupported prediction. Your prediction is not a valid option in the coin flip game.",
        5: "Unsupported action. The action you are attempting is not allowed.",
    },
    history: {
        1: "Epoch mismatch. The epoch provided does not match the current epoch.",
        2: "Cannot unstake more than staked. You are attempting to unstake more funds than you have staked.",
        3: "End of day data not available. The data for the requested end of day is not accessible.",
        4: "Epoch has not finished yet. The epoch you are trying to access is still in progress.",
        5: "Volume not available. The trading or game volume data is unavailable.",
        6: "Invalid profits or losses. The calculation of profits or losses is invalid or inconsistent.",
    },
    state: {
        1: "Unknown transaction. The transaction could not be identified or processed.",
    },
    balance_manager: {
        1: "Balance too low. Your balance is insufficient to complete this action.",
    },
    game: {
        1: "Invalid game type. The selected game type is not recognized or supported.",
        2: "Insufficient funds. The game vault does not have enough funds to accept your bet.",
        3: "Invalid cap. The cap value provided is invalid or exceeds the allowed limit.",
        4: "Invalid participation. Your participation request is not valid in this game.",
        5: "Vault not active. The game vault is currently inactive and cannot accept your bet. More stake is required to active the vault.",
    },
    participation: {
        1: "Invalid GGR share. The Gross Gaming Revenue share provided is invalid.",
        2: "Cancellation was requested. The participation has been cancelled as per your request.",
        3: "Epoch mismatch. The epoch details provided do not match the current context.",
        4: "Epoch has not finished yet. The requested operation cannot be performed until the epoch ends.",
        5: "Invalid profits or losses. The calculated profits or losses are not valid.",
        6: "Not empty. The participation cannot be finalized as it is not empty.",
    },
    vault: {
        1: "Insufficient funds. The vault does not have enough funds to complete the requested action.",
        2: "Vault not active. The vault is currently inactive and cannot process the request.",
    },
};

/**
 * A helper function that returns a user-friendly error message
 * given the module name and the error code.
 *
 * @param moduleName - The name of the module (e.g., "coin_flip", "game").
 * @param errorCode - The numerical error code (e.g., 1, 2, 3, 4, 5).
 * @returns A user-friendly error string, or a default if not found.
 */
export function getModuleErrorMessage(
    moduleName: string,
    errorCode: number
): string {
    const moduleErrors = errorMessages[moduleName];
    if (!moduleErrors) {
        return "Unknown error. Please submit a bug report."
    }

    const message = moduleErrors[errorCode];
    if (!message) {
        return "Unknown error. Please submit a bug report"
    }

    return message;
}