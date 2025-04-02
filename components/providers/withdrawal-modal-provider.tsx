"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { WithdrawalModal } from "../sui/withdrawal-modal";

interface WithdrawalModalContextType {
  openWithdrawalModal: () => void;
  closeWithdrawalModal: () => void;
  isWithdrawalModalOpen: boolean;
}

const WithdrawalModalContext = createContext<WithdrawalModalContextType | undefined>(undefined);

export function WithdrawalModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openWithdrawalModal = () => setIsOpen(true);
  const closeWithdrawalModal = () => setIsOpen(false);

  return (
    <WithdrawalModalContext.Provider
      value={{
        openWithdrawalModal,
        closeWithdrawalModal,
        isWithdrawalModalOpen: isOpen,
      }}
    >
      {children}
      <WithdrawalModal open={isOpen} onOpenChange={setIsOpen} />
    </WithdrawalModalContext.Provider>
  );
}

export function useWithdrawalModal() {
  const context = useContext(WithdrawalModalContext);
  if (context === undefined) {
    throw new Error("useWithdrawalModal must be used within a WithdrawalModalProvider");
  }
  return context;
}