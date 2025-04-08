import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { CLOSE_GAME_REQUEST, INIT_RESPONSE, isMessage, Message, TX_SIGN_AND_EXECUTE_REQUEST, TX_SIGN_AND_EXECUTE_RESPONSE } from "./messages";
import { signAndExecuteInvisWalletJsonTransaction } from "@/app/actions";

// Define the message event listener
export function handleMessage(event: MessageEvent, router: AppRouterInstance, walletId: string) {

    if (!isMessage(event.data)) return;
    const data = event.data;
    const sourceWindow = event.source as Window;

    switch (data.type) {
        case TX_SIGN_AND_EXECUTE_REQUEST:
            handleSignRequest(sourceWindow, data, walletId);
            break;
        case TX_SIGN_AND_EXECUTE_RESPONSE:
            // Handle TX_SIGN_AND_EXECUTE_RESPONSE if needed
            break;
        case INIT_RESPONSE:
            if (data.isSuccessful) {
                console.log("Init successful");
            } else {
                console.error("Init failed:", data.errorMsg);
            }
            break;
        case CLOSE_GAME_REQUEST:
            // Go BAck
            router.back();
            break;
        default:
            // Unknown message type; no action.
            break;
    }
}

// Handler for TX_SIGN_AND_EXECUTE_REQUEST messages
async function handleSignRequest(targetWindow: Window, data: Message, walletId: string) {
    if (data.type !== TX_SIGN_AND_EXECUTE_REQUEST) return;


    try {

        const result = await signAndExecuteInvisWalletJsonTransaction(data.txJson, walletId);
        if (!result.isSuccessful || !result.result) {
            console.error("Transaction execution failed:", result.errorMsg);
            throw new Error(result.errorMsg || "Transaction execution failed");
        }

        console.log("Transaction Result:", result);

        const postMessage: Message = {
            type: TX_SIGN_AND_EXECUTE_RESPONSE,
            requestId: data.request_id,
            result: result.result,
            isSuccessful: true,
        };
        targetWindow.postMessage(postMessage, "*");
    } catch (error) {
        
        const postMessage: Message = {
            type: TX_SIGN_AND_EXECUTE_RESPONSE,
            requestId: data.request_id,
            isSuccessful: false,
            errorMsg:
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred",
        };
        targetWindow.postMessage(postMessage, "*");
    }
}
