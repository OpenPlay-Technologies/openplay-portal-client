// pages/open-play-connect-game.tsx
import { useEffect, useRef } from "react";
import { useKeypair } from "../providers/keypair-provider";
import { INIT_REQUEST } from "@/openplay-connect/messages";
import { handleMessage } from "@/openplay-connect/listener";
import { useBalanceManager } from "../providers/balance-manager-provider";

export default function OpenPlayConnectGame() {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { keypair, activePlayCap } = useKeypair();
    const {
        selectedBalanceManagerId
    } = useBalanceManager();

    useEffect(() => {
        // Attach the event listener to the window
        if (!keypair || !activePlayCap || !selectedBalanceManagerId) {
            return;
        }

        window.addEventListener("message", (event) => {
            handleMessage(event, keypair);
        });


        // When the iframe loads, send an INIT_REQUEST message to it
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

        // Cleanup on unmount
        return () => {
            window.removeEventListener("message", (event) => {
                handleMessage(event, keypair);
            });
        };
    }, [keypair, activePlayCap, selectedBalanceManagerId]);



    return (
        <iframe
          id="gameIframe"
          ref={iframeRef}
          src="https://piggy-bank-client.vercel.app/"
          className="w-full h-full"
        />
    );
}
