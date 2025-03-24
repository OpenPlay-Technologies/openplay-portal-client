// pages/open-play-connect-game.tsx
import { useCallback, useEffect, useRef } from "react";
import { INIT_REQUEST } from "@/openplay-connect/messages";
import { handleMessage } from "@/openplay-connect/listener";
import { useBalanceManager } from "../providers/balance-manager-provider";
import { useInvisibleWallet } from "../providers/invisible-wallet-provider";

export default function OpenPlayConnectGame() {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    // const { keypair, activePlayCap } = useKeypair();
    const { walletId, activePlayCap } = useInvisibleWallet();
    const {
        selectedBalanceManagerId
    } = useBalanceManager();

    // Define a stable callback to avoid re-attaching the listener
    const messageHandler = useCallback((event: MessageEvent) => {
        if (walletId) {
            handleMessage(event, walletId);
        }
    }, [walletId]);

    useEffect(() => {
        if (!walletId || !activePlayCap || !selectedBalanceManagerId) return;

        window.addEventListener("message", messageHandler);

        const iframe = iframeRef.current;
        if (iframe) {
            iframe.onload = () => {
                const targetWindow = iframe.contentWindow;
                if (!targetWindow) {
                    console.error("iframe contentWindow is not available.");
                    return;
                }

                const initData = {
                    type: INIT_REQUEST,
                    balanceManagerId: selectedBalanceManagerId,
                    houseId: "0x841cdc09b4ac2b6c991e053f21b2e1a3cb7623ea07b23ccf621b04984b3852d3",
                    playCapId: activePlayCap?.id.id,
                };

                console.log("Sending init data:", initData);
                targetWindow.postMessage(initData, "*");
            };
        }

        return () => {
            window.removeEventListener("message", messageHandler);
        };
    }, [walletId, activePlayCap, selectedBalanceManagerId, messageHandler]);



    return (
        <iframe
          id="gameIframe"
          ref={iframeRef}
          src="https://piggy-bank-client.vercel.app/"
          className="w-full h-full"
        />
    );
}
