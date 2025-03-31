"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DepositActionButtonProps {
    balance: number;
    onClick: () => void;
}

export function DepositActionButton({ balance, onClick }: DepositActionButtonProps) {
    return (
        <Button
            onClick={onClick}
            variant="outline"
            className="flex items-center gap-2 font-semibold p-3 rounded-lg bg-gradient-to-r from-openplay1 to-openplay2 text-white hover:text-white hover:brightness-105 transition-all"
        >
            <span className="flex-grow text-center">{balance} SUI</span>
            <div className="w-px h-6 bg-white/50" />
            <Plus strokeWidth={2.5} className="h-5 w-5" />
        </Button>
    );
}
