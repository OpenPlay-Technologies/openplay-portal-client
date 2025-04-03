"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Wallet, ArrowDownToLine, PlusCircle, ArrowUpFromLine, Play, Frown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useBalanceManager } from "@/components/providers/balance-manager-provider";
import { formatAddress, formatSuiAmount } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { useCurrentAccount, useSignTransaction } from "@mysten/dapp-kit";
import { BALANCE_MANAGER_TYPE } from "@/api/core-constants";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { buildCreateNewBalanceManagerTransaction, executeAndWaitForTransactionBlock } from "../actions";
import { useDepositModal } from "@/components/providers/deposit-modal-provider";
import { useWithdrawalModal } from "@/components/providers/withdrawal-modal-provider";
import Link from "next/link";

export default function BalanceManagerPage() {
  const {
    balanceManagerData,
    currentBalanceManager,
    selectedBalanceManagerId,
    setSelectedBalanceManagerId,
    bmLoading,
    refreshData
  } = useBalanceManager();
  const { mutate: signTransaction } = useSignTransaction();

  const { openDepositModal } = useDepositModal();
  const { openWithdrawalModal } = useWithdrawalModal();

  const account = useCurrentAccount();
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(false);

  const handleCreateManager = async () => {
    setLoading(true);
    setIsSubmitting(false);
    setSigning(false);
    setErrorMsg(undefined);

    try {
      if (!account) {
        console.error("Account not found");
        setLoading(false);
        return;
      }

      const bytes = await buildCreateNewBalanceManagerTransaction(account.address);

      if (!bytes) {
        console.error("Transaction bytes not found");
        setLoading(false);
        return;
      }

      const tx = Transaction.from(bytes);
      setSigning(true);

      signTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            setSigning(false);
            setIsSubmitting(true);
            executeAndWaitForTransactionBlock(result.bytes, result.signature)
              .then((resp) => {
                // TODO: fix bug where the transaction is still seen as successful even if the amount is too high and the transaction fails
                setIsSubmitting(false);
                setLoading(false);
                refreshData();
                // console.log(resp.objectChanges);

                const createdBm = resp.objectChanges?.find(
                  (change) =>
                    change.type === "created" &&
                    change.objectType === BALANCE_MANAGER_TYPE &&
                    change.objectId
                );
                if (createdBm && createdBm.type === "created") {
                  console.log(createdBm.objectId);
                  setSelectedBalanceManagerId(createdBm.objectId);
                }
              })
              .catch((error) => {
                setIsSubmitting(false);
                setSigning(false);
                console.error("Transaction failed", error);
                setErrorMsg(error.message);
                setLoading(false);
              });
          },
          onError: (error) => {
            setIsSubmitting(false);
            setSigning(false);
            console.error("Error signing transaction:", error);
            setErrorMsg(error.message);
            setLoading(false);
          },
        }
      );
    }
    catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An unknown error occurred"
      setErrorMsg(errorMsg)
      console.error("Error during withdrawal:", errorMsg)
      setLoading(false);
      setSigning(false);
      setIsSubmitting(false);
    }
  };

  // If the account is not connected, show an alert.
  if (!account) {
    return (
      <div />
    );
  }

  // If balance managers are loading, show the loader.
  if (bmLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-5xl">
        <Loader title="Loading Balance Managers" body="Please wait while we load your balance managers." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-5xl">
      <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3">Balance Manager</h1>
      <p className="text-sm md:text-lg text-muted-foreground mb-8 md:mb-12">
        Effortlessly manage your on-chain funds for a seamless gaming experience.
      </p>

      <>
        {/* Overview when balance managers exist */}
        <div className="grid gap-8 md:gap-12">
          {/* Current Balance Manager */}
          {currentBalanceManager ? (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">Current Balance Manager</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Your currently selected balance manager for games
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-muted/30">
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 md:p-4 rounded-full">
                          <Wallet className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-base md:text-lg">
                            {formatAddress(currentBalanceManager.id.id)}
                          </p>
                          <p className="text-xs md:text-sm text-muted-foreground">Active Balance Manager</p>
                        </div>
                      </div>
                      <div className="w-full md:w-auto">
                        <div className="font-bold text-xl md:text-2xl text-center md:text-right">
                          {formatSuiAmount(currentBalanceManager.balance)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t bg-muted/10 p-3 md:p-4 flex flex-col sm:flex-row gap-2 md:gap-3 justify-end">
                    <Button variant="accent" className="flex items-center gap-2" onClick={() => openDepositModal()}>
                      <ArrowDownToLine className="h-4 w-4" /> Deposit
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => openWithdrawalModal()}>
                      <ArrowUpFromLine className="h-4 w-4" /> Withdraw
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted p-4 rounded-b-lg shadow">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Ready to go?
                  </p>
                  <Link href={"/"}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 h-8 px-4"
                    >
                      <Play className="mr-1 h-3.5 w-3.5" />
                      Start Playing
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ) : (
            (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">Create a Balance Manager</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Make your first deposit to create a balance manager
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border bg-muted/30">
                    <div className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-3 md:p-4 rounded-full">
                            <Wallet className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-base md:text-lg">
                              New
                            </p>
                            <p className="text-xs md:text-sm text-muted-foreground">New Balance Manager</p>
                          </div>
                        </div>
                        <div className="w-full md:w-auto">
                          <div className="font-bold text-xl md:text-2xl text-center md:text-right">
                            {formatSuiAmount(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t bg-muted/10 p-3 md:p-4 flex flex-col sm:flex-row gap-2 md:gap-3 justify-end">
                      <Button variant="accent" className="flex items-center gap-2" onClick={() => openDepositModal()}>
                        <ArrowDownToLine className="h-4 w-4" /> Deposit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="md:col-span-2">
              {/* List of Balance Managers and Create New Manager */}
              <Card className="shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">Your Balance Managers</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Select a balance manager to use for your games
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {
                    balanceManagerData.length === 0 ? (
                      <div
                        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 md:p-6"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-muted p-2 md:p-3 rounded-full">
                            <Frown className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-base md:text-lg">
                              No Balance Manager
                            </p>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              You don&apos;t have any balance managers configured yet
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                      :
                      (
                        <div className="grid gap-4 md:gap-6">
                          {balanceManagerData.map((data) => (
                            <div
                              key={data.id.id}
                              className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 md:p-6 border rounded-lg ${selectedBalanceManagerId === data.id.id ? "border-primary bg-primary/5" : ""
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="bg-muted p-2 md:p-3 rounded-full">
                                  <Wallet className="h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <div>
                                  <p className="font-medium text-base md:text-lg">{formatAddress(data.id.id)}</p>
                                  <p className="text-xs md:text-sm text-muted-foreground">{formatSuiAmount(data.balance)}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 w-full md:w-auto">
                                {selectedBalanceManagerId === data.id.id ? (
                                  <Button variant="outline" className="flex-1 md:flex-none" disabled>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Selected
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    className="flex-1 md:flex-none"
                                    onClick={() => setSelectedBalanceManagerId(data.id.id)}
                                  >
                                    Select
                                  </Button>
                                )}
                                {/* <Button
                                  variant="ghost"
                                  size="icon"
                                  className="flex-none text-muted-foreground hover:text-destructive"
                                  // onClick={() => handleDelete(data.id.id)}
                                  aria-label="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button> */}
                              </div>
                            </div>
                          ))}

                        </div>
                      )
                  }
                </CardContent>
                <CardFooter className="flex flex-col items-start pt-4 md:pt-6">
                  <div
                    key="new-balance-manager"
                    className="flex flex-col w-full md:flex-row justify-between items-start md:items-center gap-4 p-4 md:p-6 border-2 border-dashed rounded-lg hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 md:p-3 rounded-full">
                        <PlusCircle className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-base md:text-lg text-muted-foreground">
                          New Balance Manager
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Create a fresh balance manager
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="flex-1 md:flex-none" disabled={loading} onClick={handleCreateManager}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create
                    </Button>
                  </div>
                  <div className="mt-4 md:mt-6 w-full">
                    {signing && (
                      <Loader title="Signing Transaction" body="Please approve the creation of your new balance manager." />
                    )}

                    {isSubmitting && (
                      <Loader title="Creating Object" body="Please wait while we create your new balance manager on the SUI network." />
                    )}

                    {errorMsg && (
                      <Alert variant="destructive">
                        <AlertTitle>Something went wrong</AlertTitle>
                        <AlertDescription>
                          {errorMsg}
                          <br />
                          Please try again or contact support.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </div>

            {/* About Balance Managers */}
            <div>
              <Card className="shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">About Balance Managers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  <div>
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">
                      What is a Balance Manager?
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      A Balance Manager is an on-chain object that holds your balance for gaming. Each manager has a unique address and maintains its own balance.
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">
                      How They Work With Games
                    </h3>
                    <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-muted-foreground">
                      <li className="flex gap-2 items-start">
                        <div className="bg-primary/10 p-1 rounded-full mt-1">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        <span>Place bets and wagers from your balance</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <div className="bg-primary/10 p-1 rounded-full mt-1">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        <span>Receive winnings directly to your manager</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <div className="bg-primary/10 p-1 rounded-full mt-1">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        <span>Track gaming history and transactions</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <div className="bg-primary/10 p-1 rounded-full mt-1">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        <span>Isolate gaming funds from your main wallet</span>
                      </li>
                    </ul>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      You can switch between balance managers at any time, but only the selected manager will be used for new games.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    </div>
  );
}
