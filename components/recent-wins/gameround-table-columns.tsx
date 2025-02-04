"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns";
import {Badge} from "@/components/ui/badge";
import {formatSuiAmount} from "@/lib/utils";
export const mockData = [
    {
        txId: "0x1234567890",
        gameId: "0x1234567890",
        betAmount: 0.1,
        winAmount: 0.2,
        sender: "0x1234567890",
        timestamp: new Date(),
    },
    {
        txId: "0x1234567890",
        gameId: "0x1234567890",
        betAmount: 0.1,
        winAmount: 0.2,
        sender: "0x1234567890",
        timestamp: new Date(),
    },
]

export interface GameRoundModel {
    txId: string;
    gameId: string;
    betAmount: number;
    winAmount: number;
    sender: string;
    timestamp: Date;
}

export const columns: ColumnDef<GameRoundModel>[] = [
    {
        accessorKey: "sender",
        header: "User",
        cell: ({row}) => {
            const address = row.getValue("sender") as string;
            return <span>{address.slice(0, 3) + "..." + address.slice(-3)}</span>;
        },
    },
    {
        accessorKey: "profit",
        accessorFn: (row) => row.winAmount - row.betAmount,
        header: "Profit or loss",
        cell: ({ row }) => {
            console.log(row.original);
            // Compute profit directly instead of using getValue()
            const profit = row.original.winAmount - row.original.betAmount;

            return (
                <Badge variant={profit > 0 ? "default" : "secondary"}>
                    {profit > 0 ? "+" : ""}{formatSuiAmount(profit)}
                </Badge>
            );
        },
    },
    {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ row }) => {
            const date = row.getValue("timestamp") as Date;
            const text = formatDistanceToNow(date, {addSuffix: true});
            // Outputs: "5 minutes ago", "2 hours ago", "1 day ago"
            return <span className={"text-sm text-muted-foreground"}>{text}</span>
        }
    },
    {
        accessorKey: "txId",
        header: "Transaction",
        cell: ({row}) => {
            const txId = row.getValue("txId") as string;
            return txId;
            return (
                <span>{txId.slice(0, 3) + "..." + txId.slice(-3)}</span>
            );
        }
    },
];