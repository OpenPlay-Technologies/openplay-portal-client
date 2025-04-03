"use client";
import React from "react";
import Navbar from "@/components/nav/navbar";
import AlertBar from "./alert-bar";
import { useAlert } from "../providers/alert-provider";


export default function Header() {
    const { alerts } = useAlert();

    return (
        <header className={"flex-grow-0 sticky top-0 z-50 overflow-auto bg-background border-b border-primary/20"}>
            {alerts.map((alert) => (
                <AlertBar key={alert.id} variant={alert.variant}>
                    {alert.content}
                </AlertBar>
            ))}
            <Navbar />
        </header>

    );
}