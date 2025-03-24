import { Transaction } from "@mysten/sui/transactions";
import { INIT_RESPONSE, isMessage, Message, TX_SIGN_AND_EXECUTE_REQUEST, TX_SIGN_AND_EXECUTE_RESPONSE } from "./messages";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { buildSponsoredTransactionFromJson, executeSponsoredTransact } from "@/app/actions";

// Define the message event listener
export function handleMessage(event: MessageEvent, keypair: Ed25519Keypair) {
    console.log("Received message from origin:", event.origin);
    console.log("Received message:", event.data);

    if (!isMessage(event.data)) return;
    const data = event.data;
    const sourceWindow = event.source as Window;

    switch (data.type) {
        case TX_SIGN_AND_EXECUTE_REQUEST:
            handleSignRequest(sourceWindow, data, keypair);
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
        default:
            // Unknown message type; no action.
            break;
    }
}

// Handler for TX_SIGN_AND_EXECUTE_REQUEST messages
async function handleSignRequest(targetWindow: Window, data: Message, keypair: Ed25519Keypair) {
    if (data.type !== TX_SIGN_AND_EXECUTE_REQUEST) return;


    try {

        const sender = keypair.toSuiAddress();

        const sponsorResponse = await buildSponsoredTransactionFromJson(sender, data.txJson);

        if (!sponsorResponse) {
            const postMessage: Message = {
                type: TX_SIGN_AND_EXECUTE_RESPONSE,
                requestId: data.request_id,
                isSuccessful: false,
                errorMsg: "Invalid transaction data",
            };
            targetWindow.postMessage(postMessage, "*");
            return;
        }

        const tx = Transaction.from(sponsorResponse.bytes);
        const senderSignature = await tx.sign({
            signer: keypair,
        });
        
        // TODO: make sure the Tx has not been tampered with
        const result = await executeSponsoredTransact(sponsorResponse.bytes, senderSignature.signature, sponsorResponse.signature);

        console.log("Transaction Result:", result);

        const postMessage: Message = {
            type: TX_SIGN_AND_EXECUTE_RESPONSE,
            requestId: data.request_id,
            result: result,
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
