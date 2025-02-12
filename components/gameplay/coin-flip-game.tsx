"use client"
import {Event, EventType, Fit, Layout, RiveEventPayload, useRive} from "@rive-app/react-canvas";
import {useCallback, useEffect, useRef, useState} from "react";
import {mistToSUI} from "@/lib/utils";
import {useBalanceManager} from "@/components/providers/balance-manager-provider";
import {fetchCoinflipContext} from "@/api/queries/coin-flip";
import {useCurrentAccount} from "@mysten/dapp-kit";
import {Transaction} from "@mysten/sui/transactions";
import {getCoinFlipErrorMessage} from "@/lib/error-messages";
import {useKeypair} from "@/components/providers/keypair-provider";
import {
    buildSponsoredCoinFlipTransaction,
    executeSponsoredTransact,
    waitForTransaction
} from "@/app/actions";
import {CoinFlipContextModel, GameModel, InteractedWithGameModel} from "@/api/models/openplay-coin-flip";
import {PlayCapModel} from "@/api/models/openplay-core";
import {INTERACT_EVENT_TYPE} from "@/api/coinflip-constants";

interface GameProps {
    game: GameModel;
    house_id: string;
    onClose: () => void;
    stakes: number[];
}

export default function CoinFlipGame(props: GameProps) {
    const account = useCurrentAccount();
    const {
        selectedBalanceManagerId,
        refreshBalanceManagers,
        currentBalanceManager,
    } = useBalanceManager();
    const {keypair, playCaps} = useKeypair();
    const [currentPlayCap, setCurrentPlayCap] = useState<PlayCapModel | null>(null);
    const [gameContext, setGameContext] = useState<CoinFlipContextModel | null>(null);
    const [gameOngoing, setGameOngoing] = useState<boolean>(false);
    const prevGameOngoing = useRef(gameOngoing);
    const [tempBalance, setTempBalance] = useState<number>(currentBalanceManager?.balance ?? 0);
    const [selectedStakeIndex, setSelectedStakeIndex] = useState<number>(0);

    // Set up rive
    const {rive, RiveComponent} = useRive({
        src: '/sui-vs-sol.riv',
        artboard: "sui-vs-sol",
        stateMachines: "State Machine 1",
        autoplay: true,
        layout: new Layout({
            fit: Fit.Layout
        }),
    });

    useEffect(() => {
        const resize = () => {
            rive?.resizeDrawingSurfaceToCanvas();
            // console.log(window.innerWidth, window.innerHeight);
        };

        resize(); // Call on initial render
        window.addEventListener("resize", resize); // Add resize listener

        return () => window.removeEventListener("resize", resize); // Cleanup listener
    }, [rive, currentBalanceManager, account]);

    useEffect(() => {
        setTempBalance(currentBalanceManager?.balance ?? 0);
        const resize = () => {
            rive?.resizeDrawingSurfaceToCanvas();
            // console.log(window.innerWidth, window.innerHeight);
        };

        resize(); // Call on initial render
        window.addEventListener("resize", resize); // Add resize listener

        return () => window.removeEventListener("resize", resize); // Cleanup listener
    }, [rive, currentBalanceManager, account]);

    // Fetch the play cap for the current balance manager
    useEffect(() => {
        if (currentBalanceManager) {
            setCurrentPlayCap(playCaps.find(x => x.balance_manager_id == currentBalanceManager.id.id) ?? null);
        }
    }, [currentBalanceManager, playCaps]);


    // Display error message in rive
    const showError = useCallback((errorMsg: string) => {
        const showErrorInput = rive?.stateMachineInputs("State Machine 1").find(x => x.name == "Show error");
        if (showErrorInput && errorMsg) {
            rive?.setTextRunValue("Error body run", errorMsg);
            showErrorInput.value = true;
        }
    }, [rive]);

    // Handle error message: parse it and display it
    const handleError = useCallback((rawErrorMsg: string) => {
        setTempBalance(currentBalanceManager?.balance ?? 0);

        // Regex to capture the name inside `Identifier("...")`
        const moduleNameRegex = /name: Identifier\("([^"]+)"\)/;

        // Regex to capture the error number after the final comma before `) in command`
        // Adjust this if the structure of the error changes in the future
        const errorNumberRegex = /},\s*(\d+)\)\s*in command/;

        // Attempt to match the module name
        const moduleNameMatch = rawErrorMsg.match(moduleNameRegex);
        const moduleName = moduleNameMatch ? moduleNameMatch[1] : "";

        // Attempt to match the error number
        const errorNumberMatch = rawErrorMsg.match(errorNumberRegex);
        const errorNumber = errorNumberMatch ? parseInt(errorNumberMatch[1], 10) : 0;

        setGameOngoing(false);

        if (!moduleName || !errorNumber) {
            showError(rawErrorMsg);
        } else {
            showError(getCoinFlipErrorMessage(moduleName, errorNumber));
        }
    }, [showError, currentBalanceManager?.balance]);


    // Callback for updating the game context
    // queries the blockchain for the latest context and sets it in react state
    const updateContext = useCallback(async () => {
        if (!selectedBalanceManagerId) {
            console.error('No game or balance manager found');
            return;
        }
        const context = await fetchCoinflipContext(props.game.contexts.fields.id.id, selectedBalanceManagerId);
        setGameContext(context ?? null);
    }, [props.game.contexts.fields.id, selectedBalanceManagerId]);

    useEffect(() => {
        updateContext();
    }, [updateContext]);

    // Callback for starting the flipping animation - result is unknown at this point
    const startFlippingAnimation = useCallback(() => {
        rive?.fireStateAtPath("Start flip", "Coin flip v2");
        const disableButtonInput = rive?.stateMachineInputs("State Machine 1").find(x => x.name == "Disable button");
        if (disableButtonInput) {
            disableButtonInput.value = true;
        }
    }, [rive]);

    // Callback for updating the UI in rive to the given inputs
    const updateUI = useCallback((balanceValue: number, winValue: number, disableButton: boolean) => {
        // console.log("Updating UI", balanceValue, winValue, disableButton);
        rive?.setTextRunValue("Balance Value Run", mistToSUI(Number(balanceValue)));
        rive?.setTextRunValue("Win Value Run", mistToSUI(Number(winValue)));
        const disableButtonInput = rive?.stateMachineInputs("State Machine 1").find(x => x.name == "Disable button");
        if (disableButtonInput) {
            disableButtonInput.value = disableButton;
        }
    }, [rive]);


    const updateStake = useCallback((stakeIndex: number) => {
        if (stakeIndex < 0 || stakeIndex >= props.stakes.length) {
            console.error('Invalid stake index');
            return;
        }
        const stakeValue = props.stakes[stakeIndex];
        const canIncrease = stakeIndex < props.stakes.length - 1;
        const canDecrease = stakeIndex > 0;

        rive?.setTextRunValue("Bet Value Run", mistToSUI(Number(stakeValue)));

        const allowStakeIncreaseInput = rive?.stateMachineInputs("State Machine 1").find(x => x.name == "Allow stake increase");
        if (allowStakeIncreaseInput) {
            allowStakeIncreaseInput.value = canIncrease;
        }
        const allowStakeDecreaseInput = rive?.stateMachineInputs("State Machine 1").find(x => x.name == "Allow stake decrease");
        if (allowStakeDecreaseInput) {
            allowStakeDecreaseInput.value = canDecrease;
        }

    }, [rive, props.stakes]);

    // Callback for flipping the coin to the result. This is from mid-air to the result once it is known to us
    const flipToResult = useCallback((result: string) => {
        // console.log("Flipping to result", result);
        if (result == "Head") {
            rive?.setBooleanStateAtPath("End sui", true, "Coin flip v2");
        } else if (result == "Tail") {
            rive?.setBooleanStateAtPath("End sol", true, "Coin flip v2");
        } else if (result == "HouseBias") {
            rive?.setBooleanStateAtPath("End house", true, "Coin flip v2");
        }
    }, [rive]);

// Callback for pressing the play button
    const handleInteract = useCallback(async () => {
        // console.log("Handling interact");
        // const startTime = performance.now();

        if (!selectedBalanceManagerId || !keypair) {
            console.error('No kepair or balance manager found');
            return;
        }

        if (!currentPlayCap) {
            console.error("No play cap found");
            handleError("No play cap found! You are not authorized to play with this balance manager.");
            return;
        }

        const input = rive?.stateMachineInputs("State Machine 1").find(x => x.name == "Selection")?.value as number ?? -1;
        if (input == -1) {
            console.error('Invalid input');
            return;
        }

        const prediction = input == 0 ? "Head" : "Tail";

        // console.log("Requesting sponsored Tx");

        const stake = props.stakes[selectedStakeIndex];

        // Set game ongoing to true before getting any response to make it feel more responsive
        setTempBalance(tempBalance - stake);
        setGameOngoing(true);


        // const transactionConstructedTime = performance.now();
        // console.log(`Transaction constructed: ${transactionConstructedTime - startTime} ms`);

        try {
            const sponsorSignature = await buildSponsoredCoinFlipTransaction(
                keypair.toSuiAddress(),
                selectedBalanceManagerId,
                props.house_id,
                currentPlayCap.id.id,
                props.game.id.id,
                Number(stake),
                prediction
            );


            const tx = Transaction.from(sponsorSignature.bytes);
            const senderSignature = await tx.sign({
                signer: keypair,
            });

            const result = await executeSponsoredTransact(sponsorSignature.bytes, senderSignature.signature, sponsorSignature.signature);

            const interactEvent = result.events?.find(x => x.type == INTERACT_EVENT_TYPE);
            let eventFound = false;

            if (interactEvent) {
                eventFound = true;
                const parsedEvent = interactEvent.parsedJson as InteractedWithGameModel;
                setTempBalance(Number(parsedEvent.new_balance));
                setGameContext(parsedEvent.context);
            }

            waitForTransaction(result.digest).then(result => {
                const interactEvent = result.events?.find(x => x.type == INTERACT_EVENT_TYPE);

                if (interactEvent && !eventFound) {
                    const parsedEvent = interactEvent.parsedJson as InteractedWithGameModel;
                    setTempBalance(Number(parsedEvent.new_balance));
                    setGameContext(parsedEvent.context);
                }

                // const transactionCompletedTime = performance.now();
                // console.log(`Waiting for transaction completed: ${transactionCompletedTime - startTime} ms`);
                Promise.all([refreshBalanceManagers()]);
            })
                .catch((error) => {
                    console.error(error.message);
                    handleError(error.message);
                });
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            console.error(error.message);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            handleError(error.message);
        }

    }, [selectedBalanceManagerId, keypair, currentPlayCap, rive, props.stakes, props.house_id, props.game.id.id, selectedStakeIndex, tempBalance, handleError, refreshBalanceManagers]);


    // Keep rive in sync with the react state
    useEffect(() => {
        // Game was started
        if (!prevGameOngoing.current && gameOngoing) {

            updateUI(
                tempBalance,
                0,
                true
            );
            startFlippingAnimation();
        }

        if (!gameOngoing) {
            updateUI(
                tempBalance,
                gameContext?.win ?? 0,
                false
            );
        }

        // Flip states
        if (gameOngoing && gameContext) {
            flipToResult(gameContext.result);
        }

        prevGameOngoing.current = gameOngoing;
    }, [tempBalance, flipToResult, gameContext, gameOngoing, startFlippingAnimation, updateUI]);

    // Keep the state in sync with react state
    useEffect(() => {
        if (selectedStakeIndex >= 0 && selectedStakeIndex < props.stakes.length) {
            updateStake(selectedStakeIndex);
        }
    }, [updateStake, gameContext, selectedStakeIndex, props.stakes.length]);


    const onRiveEventReceived = useCallback((riveEvent: Event) => {
        // console.log("Event received", riveEvent);
        const eventData = riveEvent.data as RiveEventPayload;
        if (!eventData) {
            return;
        }
        // Play a game when user clicks play button
        if (eventData.name == "PlayButtonClicked") {
            setGameContext(null);
            handleInteract();
        }
        // Listen on flip completed to keep react state in sync with animation
        if (eventData.name == "FlipCompleted") {
            setGameOngoing(false);
        }
        // Close game
        if (eventData.name == "CloseButtonClicked") {
            props.onClose();
        }
        // Stake increase
        if (eventData.name == "StakeIncreased") {
            setSelectedStakeIndex(selectedStakeIndex + 1);
        }
        // Stake decrease
        if (eventData.name == "StakeDecreased") {
            setSelectedStakeIndex(selectedStakeIndex - 1);
        }
    }, [handleInteract, props, selectedStakeIndex]);

    useEffect(() => {
        if (rive) {
            rive.removeAllRiveEventListeners();
            rive.on(EventType.RiveEvent, onRiveEventReceived);
        }
    }, [rive, onRiveEventReceived]);

    return (
        <RiveComponent
            className="w-full h-full min-w-[500px] min-h-[650px] select-none"
        />
    )
}