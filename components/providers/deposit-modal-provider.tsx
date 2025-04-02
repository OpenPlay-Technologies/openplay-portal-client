"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { DepositModal } from "../sui/deposit-modal";

interface DepositModalContextType {
  openDepositModal: () => void;
  closeDepositModal: () => void;
  isDepositModalOpen: boolean;
}

const DepositModalContext = createContext<DepositModalContextType | undefined>(undefined);

export function DepositModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDepositModal = () => setIsOpen(true);
  const closeDepositModal = () => setIsOpen(false);

  return (
    <DepositModalContext.Provider
      value={{
        openDepositModal,
        closeDepositModal,
        isDepositModalOpen: isOpen,
      }}
    >
      {children}
      <DepositModal open={isOpen} onOpenChange={setIsOpen} />
    </DepositModalContext.Provider>
  );
}

export function useDepositModal() {
  const context = useContext(DepositModalContext);
  if (context === undefined) {
    throw new Error("useDepositModal must be used within a DepositModalProvider");
  }
  return context;
}