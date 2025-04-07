"use server"
import { Transaction } from "@mysten/sui/transactions";
import { getPriviligedSuiClient, getShinamiWalletSigner, getSuiClient } from "@/api/sui-client";
import { toBase64 } from "@mysten/bcs";
import {
    DEPOSIT_BALANCE_MANAGER_FUNCTION_TARGET,
    MINT_PLAY_CAP_FUNCTION_TARGET,
    NEW_BALANCE_MANAGER_FUNCTION_TARGET,
    SHARE_BALANCE_MANAGER_FUNCTION_TARGET,
    WITHDRAW_BALANCE_MANAGER_FUNCTION_TARGET
} from "@/api/core-constants";
import { buildGaslessTransaction } from "@shinami/clients/sui";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";




// Validate the transaction
// eslint-disable-next-line unused-imports/no-unused-vars
function verifyTxData(_transaction: Transaction): boolean {
    // const txData = transaction.getData();
    // const txInputs = txData.inputs;

    // 1. Verify transaction commands
    // if (txData.commands.length !== 1) {
    //     console.error("Transaction must have exactly one command");
    //     return false;
    // }

    // const moveCallCommand = txData.commands[0].MoveCall;
    // if (!moveCallCommand) {
    //     console.error("Transaction must have a MoveCall command");
    //     return false;
    // }

    // 2. Verify move call target
    // const moveCallTarget =
    //     moveCallCommand.package +
    //     "::" +
    //     moveCallCommand.module +
    //     "::" +
    //     moveCallCommand.function;
    // if (moveCallTarget !== INTERACT_FUNCTION_TARGET) {
    //     console.error("Invalid MoveCall target: ", moveCallTarget);
    //     return false;
    // }

    // 3. Verify move call inputs
    // const moveCallArgs = moveCallCommand.arguments;
    // const gameIdArg = moveCallArgs[0];
    // if (
    //     !(
    //         gameIdArg.$kind === "Input" &&
    //         txInputs[gameIdArg.Input].UnresolvedObject?.objectId ===
    //         "0x3a3dc449dd74875134f1f5306b468afed94206cde4e91937bd284e0dab9f0e3a"
    //     )
    // ) {
    //     console.error("Invalid Game Id");
    //     return false;
    // }

    return true;
}

interface signAndExecuteInvisWalletJsonTransactionResponse {
    result?: SuiTransactionBlockResponse;
    isSuccessful: boolean;
    errorMsg: string;
}

export async function signAndExecuteInvisWalletJsonTransaction(txJson: string, walletId: string): Promise<signAndExecuteInvisWalletJsonTransactionResponse> {
    // Start the timer
    const startTime = Date.now();
    const logStep = (message: string) => {
        console.log(`[${Date.now() - startTime}ms] ${message}`);
    };

    try {
        logStep("Step 1: Parsing transaction JSON.");
        const tx = Transaction.from(txJson);

        logStep("Step 2: Verifying transaction data.");
        if (!verifyTxData(tx)) {
            throw new Error("Invalid transaction data");
        }

        logStep("Step 3: Retrieving wallet signer.");
        const signer = getShinamiWalletSigner(walletId);

        logStep("Step 4: Building gasless transaction.");
        const gaslessTx = await buildGaslessTransaction(tx, { sui: getPriviligedSuiClient() });

        logStep("Step 5: Executing gasless transaction.");
        const result = await signer.executeGaslessTransaction(gaslessTx, {
            showEvents: true,
            showEffects: true,
        });
        logStep("Transaction executed successfully.");
        return {
            result,
            isSuccessful: true,
            errorMsg: ""
        }
    }
    catch (error) {
        logStep("Error signing and executing transaction.");
        let errorMsg = "Unknown error";

        if (error instanceof Error) {
            errorMsg = error.message;

            // Check if error.data.details exists
            if (typeof error === "object" && error !== null && "data" in error && "details" in (error as { data: { details: string } }).data) {
                if (typeof error.data === "object" && error.data !== null && "details" in error.data) {
                    errorMsg = (error.data as { details: string }).details;
                }
            }
        }

        console.log(JSON.stringify(error, null, 2));
        return {
            result: undefined,
            isSuccessful: false,
            errorMsg: errorMsg
        }
    }
}

export async function TryCreateInvisWallet(walletId: string) {
    const signer = getShinamiWalletSigner(walletId);
    await signer.tryCreate();
}

export async function getInvisWalletAddress(walletId: string) {

    const signer = getShinamiWalletSigner(walletId);

    // Safe to do if unsure about the wallet's existence.
    await signer.tryCreate();

    return await signer.getAddress();
}


export async function executeTransactionBlock(bytes: string, signature: string) {
    const client = getSuiClient();
    return await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
            showRawEffects: true,
            showObjectChanges: true,
        },
    });
}

export async function executeAndWaitForTransactionBlock(bytes: string, signature: string) {
    const client = getSuiClient();
    const response = await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
            showRawEffects: true,
            showObjectChanges: true,
        },
    });
    await client.waitForTransaction({
        digest: response.digest
    });
    return response;
}

export async function waitForTransaction(digest: string) {
    const client = getSuiClient();
    return await client.waitForTransaction({
        digest
    });
}

export async function buildDepositToExistingBalanceManagerTransaction(sender: string, balanceManagerId: string, balanceManagerCapId: string, amount: number, playCapDestination: string | null) {
    const tx = new Transaction();

    const [coin] = tx.splitCoins(tx.gas, [amount]);
    tx.moveCall({
        target: DEPOSIT_BALANCE_MANAGER_FUNCTION_TARGET,
        arguments: [
            tx.object(balanceManagerId),
            tx.object(balanceManagerCapId),
            tx.object(coin)
        ],
    });

    // We also add a play_cap during a deposit to avoid double tx costs
    if (playCapDestination) {
        const [play_cap] = tx.moveCall({
            target: MINT_PLAY_CAP_FUNCTION_TARGET,
            arguments: [
                tx.object(balanceManagerId),
                tx.object(balanceManagerCapId),
            ],
        });
        tx.transferObjects([play_cap], playCapDestination);
    }

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}

export async function buildDepositToNewBalanceManagerTransaction(sender: string, amount: number, playCapDestination: string | null) {
    const tx = new Transaction();

    const [balance_manager, balance_manager_cap] = tx.moveCall({
        target: NEW_BALANCE_MANAGER_FUNCTION_TARGET,
        arguments: [],
    });

    const [coin] = tx.splitCoins(tx.gas, [amount]);
    tx.moveCall({
        target: DEPOSIT_BALANCE_MANAGER_FUNCTION_TARGET,
        arguments: [
            tx.object(balance_manager),
            tx.object(balance_manager_cap),
            tx.object(coin)
        ],
    });

    // We also add a play_cap during a deposit to avoid double tx costs
    if (playCapDestination) {
        const [play_cap] = tx.moveCall({
            target: MINT_PLAY_CAP_FUNCTION_TARGET,
            arguments: [
                tx.object(balance_manager),
                tx.object(balance_manager_cap),
            ],
        });
        tx.transferObjects([play_cap], playCapDestination);
    }

    tx.moveCall({
        target: SHARE_BALANCE_MANAGER_FUNCTION_TARGET,
        arguments: [
            tx.object(balance_manager)
        ],
    });
    tx.transferObjects([balance_manager_cap], sender);

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}

export async function buildCreateNewBalanceManagerTransaction(sender: string) {
    const tx = new Transaction();

    const [balance_manager, balance_manager_cap] = tx.moveCall({
        target: NEW_BALANCE_MANAGER_FUNCTION_TARGET,
        arguments: [],
    });

    tx.moveCall({
        target: SHARE_BALANCE_MANAGER_FUNCTION_TARGET,
        arguments: [
            tx.object(balance_manager)
        ],
    });
    tx.transferObjects([balance_manager_cap], sender);

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}

export async function buildWithdrawFromBalanceManagerTransaction(sender: string, balanceManagerId: string, balanceManagerCapId: string, amount: number) {
    const tx = new Transaction();

    const [coin] = tx.moveCall({
        target: WITHDRAW_BALANCE_MANAGER_FUNCTION_TARGET,
        arguments: [
            tx.object(balanceManagerId),
            tx.object(balanceManagerCapId),
            tx.pure.u64(amount)
        ],
    });
    tx.transferObjects([coin], sender);

    tx.setSender(sender);
    const bytes = await tx.build({
        client: getSuiClient(),
    });
    return toBase64(bytes);
}