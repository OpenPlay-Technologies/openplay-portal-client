"use client"
import {Event, EventType, Fit, Layout, RiveEventPayload, useRive} from "@rive-app/react-canvas";
import {useCallback, useEffect, useRef, useState} from "react";
import {mistToSUI} from "@/lib/utils";
import {useBalanceManager} from "@/components/providers/balance-manager-provider";
import {fetchCoinflipContext} from "@/api/queries/coin-flip";
import {useCurrentAccount, useSuiClient} from "@mysten/dapp-kit";
import {Transaction} from "@mysten/sui/transactions";
import {getCoinFlipErrorMessage} from "@/lib/error-messages";
import {useKeypair} from "@/components/providers/keypair-provider";
import {sponsoredInteractCoinFlip} from "@/app/actions";
import {CoinFlipContextModel, GameModel, InteractedWithGameModel} from "@/api/models/openplay-coin-flip";
import {PlayCapModel, RegistryModel} from "@/api/models/openplay-core";
import {fetchRegistry} from "@/api/queries/registry";

interface GameProps {
    data: GameModel;
    onClose: () => void;
}

export default function CoinFlipGame(props: GameProps) {
    const coinFlipPackageId = process.env.NEXT_PUBLIC_COIN_FLIP_PACKAGE_ID;
    const account = useCurrentAccount();
    const {
        selectedBalanceManagerId,
        refreshBalanceManagers,
        currentBalanceManager,
    } = useBalanceManager();
    const {keypair, playCaps} = useKeypair();
    const suiClient = useSuiClient();
    const [currentPlayCap, setCurrentPlayCap] = useState<PlayCapModel | null>(null);
    const [gameContext, setGameContext] = useState<CoinFlipContextModel | null>(null);
    const [gameOngoing, setGameOngoing] = useState<boolean>(false);
    const prevGameOngoing = useRef(gameOngoing);
    const [registry, setRegistry] = useState<RegistryModel | null>(null);
    const [tempBalance, setTempBalance] = useState<number>(currentBalanceManager?.balance?.value ?? 0);
    
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
            console.log(window.innerWidth, window.innerHeight);
        };

        resize(); // Call on initial render
        window.addEventListener("resize", resize); // Add resize listener

        return () => window.removeEventListener("resize", resize); // Cleanup listener
    }, [rive, window, currentBalanceManager, account]);

    useEffect(() => {
        setTempBalance(currentBalanceManager?.balance?.value ?? 0);
        const resize = () => {
            rive?.resizeDrawingSurfaceToCanvas();
            console.log(window.innerWidth, window.innerHeight);
        };

        resize(); // Call on initial render
        window.addEventListener("resize", resize); // Add resize listener

        return () => window.removeEventListener("resize", resize); // Cleanup listener
    }, [rive, window, currentBalanceManager, account]);

    // Fetch the play cap for the current balance manager
    useEffect(() => {
        if (currentBalanceManager) {
            setCurrentPlayCap(playCaps.find(x => x.balance_manager_id == currentBalanceManager.id) ?? null);
        }
    }, [currentBalanceManager, playCaps]);
    
    // Fetch the registry
    const updateRegistry = useCallback(async () => {
        const registry = await fetchRegistry();
        if (registry){
            setRegistry(registry);
        }
    }, []);
    
    useEffect(() => {
        updateRegistry();
    }, [updateRegistry]);
    

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
    }, [showError]);


    // Callback for updating the game context
    // queries the blockchain for the latest context and sets it in react state
    const updateContext = useCallback(async () => {
        if (!selectedBalanceManagerId) {
            console.error('No game or balance manager found');
            return;
        }

        const context = await fetchCoinflipContext(props.data.contexts.id, selectedBalanceManagerId);
        console.log(context);
        setGameContext(context ?? null);
    }, [props.data.contexts.id, selectedBalanceManagerId]);
    
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
        console.log("Updating UI", balanceValue, winValue, disableButton);
        rive?.setTextRunValue("Balance Value Run", mistToSUI(Number(balanceValue)));
        rive?.setTextRunValue("Win Value Run", mistToSUI(Number(winValue)));
        const disableButtonInput = rive?.stateMachineInputs("State Machine 1").find(x => x.name == "Disable button");
        if (disableButtonInput) {
            disableButtonInput.value = disableButton;
        }
    }, [rive]);

    // Callback for flipping the coin to the result. This is from mid-air to the result once it is known to us
    const flipToResult = useCallback((result: string) => {
        console.log("Flipping to result", result);
        if (result == "Head") {
            rive?.setBooleanStateAtPath("End sui", true, "Coin flip v2");
        } else if (result == "Tail") {
            rive?.setBooleanStateAtPath("End sol", true, "Coin flip v2");
        } else if (result == "HouseBias") {
            rive?.setBooleanStateAtPath("End house", true, "Coin flip v2");
        }
    }, [rive]);

// Callback for pressing the play button
    const handleInteract = useCallback(() => {
        console.log("Handling interact");
        const startTime = performance.now();

        if (!selectedBalanceManagerId || !keypair || !registry) {
            console.error('No game or balance manager found');
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

        // TODO: make stake dynamic
        const stake = 1e9;

        console.log("Requesting sponsored Tx");

        // Set game ongoing to true before getting any response to make it feel more responsive
        setTempBalance(tempBalance - stake);
        setGameOngoing(true);
        

        const transactionConstructedTime = performance.now();
        console.log(`Transaction constructed: ${transactionConstructedTime - startTime} ms`);

        sponsoredInteractCoinFlip(
            keypair.toSuiAddress(),
            registry.id,
            selectedBalanceManagerId,
            props.data.house_tx_cap.house_id,
            currentPlayCap.id,
            props.data.id,
            Number(stake),
            prediction
        )
            .then((sponsorSignature) => {
                const sponsorSignedTime = performance.now();
                console.log(`Sponsor signed: ${sponsorSignedTime - startTime} ms`);

                const tx = Transaction.from(sponsorSignature.bytes);
                
                tx.sign({
                    signer: keypair,
                    client: suiClient
                })
                    .then((senderSignature) => {
                        const transactionSignedTime = performance.now();
                        console.log(`Transaction signed: ${transactionSignedTime - startTime} ms`);

                        suiClient.executeTransactionBlock({
                            transactionBlock: sponsorSignature.bytes,
                            signature: [sponsorSignature.signature, senderSignature.signature],
                            options: {
                                showEvents: true,
                            }
                        })
                            .then((result) => {
                                const transactionExecutedTime = performance.now();
                                console.log(`Transaction executed: ${transactionExecutedTime - startTime} ms`);
                                console.log(JSON.stringify(result));
                                const interactEventType = `${coinFlipPackageId}::game::InteractedWithGame`
                                const interactEvent = result.events?.find(x => x.type == interactEventType);
                                
                                if (!interactEvent){
                                    showError("No interact event found");
                                    return;
                                }
                                                                
                                const parsedEvent = interactEvent.parsedJson as InteractedWithGameModel;
                                setTempBalance(Number(parsedEvent.new_balance));
                                setGameContext(parsedEvent.context);

                                suiClient.waitForTransaction({
                                    digest: result.digest
                                })
                                    .then(() => {
                                        const transactionCompletedTime = performance.now();
                                        console.log(`Waiting for transaction completed: ${transactionCompletedTime - startTime} ms`);
                                        Promise.all([refreshBalanceManagers()]);
                                    })
                                    .catch((error) => {
                                        console.error(error.message);
                                        handleError(error.message);
                                    });
                            })
                            .catch((error) => {
                                console.error(error.message);
                                handleError(error.message);
                            });
                    })
                    .catch((error) => {
                        console.error(error.message);
                        handleError(error.message);
                    });

                console.log("Executing Sponsored Tx");
            })
            .catch((error) => {
                console.error(error.message);
                handleError(error.message);
            });
    }, [currentPlayCap, handleError, keypair, props.data.id, refreshBalanceManagers, rive, selectedBalanceManagerId, suiClient, updateContext, tempBalance]);


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


    const onRiveEventReceived = useCallback((riveEvent: Event) => {
        console.log("Event received", riveEvent);
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
    }, [handleInteract, props]);

    useEffect(() => {
        if (rive) {
            rive.removeAllRiveEventListeners();
            rive.on(EventType.RiveEvent, onRiveEventReceived);
        }
    }, [rive, onRiveEventReceived]);

    return (
        <RiveComponent
            className={"w-full h-full"}
        />
    )
}