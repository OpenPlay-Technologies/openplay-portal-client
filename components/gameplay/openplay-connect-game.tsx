// pages/open-play-connect-game.tsx
import { useCallback, useEffect, useRef } from "react";
import { INIT_REQUEST } from "@/openplay-connect/messages";
import { handleMessage } from "@/openplay-connect/listener";
import { useBalanceManager } from "../providers/balance-manager-provider";
import { useInvisibleWallet } from "../providers/invisible-wallet-provider";
import { useRouter } from "next/navigation";
import { DEPOSIT_COMPLETED_EVENT, InternalEventEmitter, WITHDRAWAL_COMPLETED_EVENT } from "@/events/event-definitions";
import { notifyBalanceUpdate } from "@/openplay-connect/host-functions";

interface OpenPlayConnectGameProps {
    houseId: string;
    gameUrl: string;
}

export default function OpenPlayConnectGame(props: OpenPlayConnectGameProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const router = useRouter();
    // const { keypair, activePlayCap } = useKeypair();
    const { walletId, activePlayCap } = useInvisibleWallet();
    const {
        selectedBalanceManagerId,
        refreshBalance
    } = useBalanceManager();

    useEffect(() => {
        const window = iframeRef.current?.contentWindow;
        if (!window) return;
        const onDepositCompleted = () => {
            notifyBalanceUpdate(window);
        };
        const onWithdrawalCompleted = () => {
            notifyBalanceUpdate(window);
        }
        InternalEventEmitter.on(DEPOSIT_COMPLETED_EVENT, onDepositCompleted);
        InternalEventEmitter.on(WITHDRAWAL_COMPLETED_EVENT, onWithdrawalCompleted);
        return () => {
            InternalEventEmitter.off(DEPOSIT_COMPLETED_EVENT, onDepositCompleted);
            InternalEventEmitter.off(WITHDRAWAL_COMPLETED_EVENT, onWithdrawalCompleted);
        };
    }, []);

    // Define a stable callback to avoid re-attaching the listener
    const messageHandler = useCallback((event: MessageEvent) => {
        if (walletId) {
            handleMessage(event, router, walletId, refreshBalance);
        }
    }, [walletId, router, refreshBalance]);

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
                    houseId: props.houseId,
                    playCapId: activePlayCap?.id.id,
                };

                console.log("Sending init data:", initData);
                targetWindow.postMessage(initData, "*");
            };
        }

        return () => {
            window.removeEventListener("message", messageHandler);
        };
    }, [walletId, activePlayCap, selectedBalanceManagerId, messageHandler, props.houseId]);



    return (
        <iframe
            id="gameIframe"
            ref={iframeRef}
            src={props.gameUrl}
            className="w-full h-full"
        />
    );
}
