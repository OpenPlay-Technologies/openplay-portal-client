// "use client"
// import { useBalanceManager } from "@/components/providers/balance-manager-provider";
// import { useCurrentAccount, useSignTransaction } from "@mysten/dapp-kit";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Transaction } from "@mysten/sui/transactions";
// import { useState } from "react";
// import Wallet from "@/components/sui/wallet";
// import { buildMintPlayCapTransaction } from "@/app/coin-flip/actions";
// import { executeAndWaitForTransactionBlock } from "@/app/actions";
// import OpenPlayConnectGame from "./openplay-connect-game";
// import { useInvisibleWallet } from "../providers/invisible-wallet-provider";
// import SessionExpiredCard from "./session-expired-card";

// interface GameLauncherProps {
//     gameUrl: string;
//     houseId: string;
// }

// export default function GameLauncher(props: GameLauncherProps) {
//     const account = useCurrentAccount();
//     // const { keypair, activePlayCap: kpActivePlayCap, updatePlayCaps: updateKpPlayCaps } = useKeypair();
//     const { walletAddress, activePlayCap: invisActivePlayCap, updatePlayCaps: updateInvisPlayCaps } = useInvisibleWallet();
//     const [loadingRefresh, setLoadingRefresh] = useState(false);

//     const { mutate: signTransaction } = useSignTransaction();

//     const {
//         currentBalanceManager,
//         currentBalanceManagerCap,
//         refreshData,
//         refreshPlayCaps,
//         bmLoading,
//         playCapLoading
//     } = useBalanceManager();


//     const handleRefresh = async () => {

//         if (!account || !walletAddress) {
//             console.error('Account not found');
//             return;
//         }

//         if (!currentBalanceManager) {
//             console.error('Balance manager not found');
//             return;
//         }

//         if (!currentBalanceManagerCap) {
//             console.error('Balance manager cap not found');
//             return;
//         }

//         const bytes = await buildMintPlayCapTransaction(account.address, currentBalanceManager.id.id, currentBalanceManagerCap.id.id, walletAddress);
//         const tx = Transaction.from(bytes);

//         setLoadingRefresh(true);

//         signTransaction({
//             transaction: tx
//         },
//             {
//                 onSuccess: (result) => {
//                     // console.log('Transaction executed', result);
//                     executeAndWaitForTransactionBlock(result.bytes, result.signature).then(() => {
//                         setLoadingRefresh(false);
//                         refreshData();
//                         updateInvisPlayCaps();
//                     }).catch((error) => {
//                         console.error('Transaction failed', error);
//                     });
//                 },
//                 onError: (error) => {
//                     console.error('Transaction failed', error);
//                 }
//             }
//         );
//     }

//     return (
//         <>
//             {invisActivePlayCap && account && currentBalanceManager ? <OpenPlayConnectGame gameUrl={props.gameUrl} houseId={props.houseId} /> : (
//                 <SessionExpiredCard />
//                 // <div className={"flex flex-grow justify-center items-center h-full w-full bg-muted rounded-l-md"}>

//                 //     {!account && <Card>
//                 //         <CardHeader>
//                 //             <CardTitle>
//                 //                 Connect your wallet to continue
//                 //             </CardTitle>
//                 //             <CardDescription>
//                 //                 Please connect your wallet and set up a balance manager to start playing.
//                 //             </CardDescription>
//                 //         </CardHeader>
//                 //         <CardContent>
//                 //             <Wallet></Wallet>
//                 //         </CardContent>
//                 //     </Card>}
//                 //     {(bmLoading || playCapLoading) && (
//                 //         <Card>
//                 //             <CardHeader>
//                 //                 <CardTitle>
//                 //                     Loading...
//                 //                 </CardTitle>
//                 //                 <CardDescription>
//                 //                     Please wait while we load your balance manager and play cap.
//                 //                 </CardDescription>
//                 //             </CardHeader>
//                 //         </Card>
//                 //     )}
//                 //     {!playCapLoading && !bmLoading && account && !currentBalanceManager && <BalanceManagerCard />}
//                 //     {!playCapLoading && !bmLoading && !invisActivePlayCap && account && currentBalanceManager &&

//                 //         <Card>
//                 //             <CardHeader>
//                 //                 <CardTitle>
//                 //                     No valid gaming session found
//                 //                 </CardTitle>
//                 //                 <CardDescription>
//                 //                     Please refresh your gaming session to continue.
//                 //                 </CardDescription>
//                 //             </CardHeader>
//                 //             <CardContent>
//                 //                 <Button className={"w-fit h-fit"} onClick={handleRefresh} disabled={loadingRefresh}>
//                 //                     Refresh Session
//                 //                 </Button>
//                 //             </CardContent>
//                 //         </Card>
//                 //     }
//                 // </div>
//             )}
//         </>
//     );
// }