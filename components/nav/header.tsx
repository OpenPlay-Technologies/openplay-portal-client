"use client";
import React from "react";
import Navbar from "@/components/nav/navbar";
import { useState, useEffect } from "react";
import {cn} from "@/lib/utils";
import NetworkInfoBar from "@/components/nav/network-info-bar";


export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const network = process.env.NEXT_PUBLIC_NETWORK ?? "localnet";

    // const isHomePage = pathname === "/";
    const isHomePage = false;

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) { // Change 50 to the scroll threshold you prefer
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
        
    return (
        <header className={cn("flex-grow-0 sticky top-0 z-50 overflow-scroll",
            isScrolled || !isHomePage ? "bg-background border-b border-primary/20" : "bg-transparent")}>
            {network != "mainnet" && <NetworkInfoBar network={network}/>}
            <Navbar transparent={!isScrolled && isHomePage}/>
        </header>

    );
}