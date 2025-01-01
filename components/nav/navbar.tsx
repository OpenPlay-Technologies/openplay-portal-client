"use client";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {
    ArrowTopRightOnSquareIcon
} from "@heroicons/react/24/outline";
import React from "react";
import Link from "next/link";
import Wallet from "@/components/nav/wallet";
import NavButton from "@/components/nav/nav-button";

interface NavbarProps {
    transparent?: boolean;
}

const navigationLinks = [
    {name: "Games", href: "/"},
    {name: "Rewards", href: "/rewards"},
    {name: "Create", href: "/create"},
]

export default function Navbar(props: NavbarProps) {

    return (
        <div className="px-4 flex flex-row justify-between items-center">
            {/*Logo*/}
            <Link className={"flex-shrink-0"} href={"/"}>
                {props.transparent ?

                    <Image src={"/OpenPlay-Inverted-Color.png"} width={150} height={34} alt={"OpenPlay"}/>
                    :
                    <Image src={"/OpenPlay Main Logo (2).png"} width={150} height={34} alt={"OpenPlay"}/>}
            </Link>

            {/*Navigation Menu*/}
            <div className={"inline-flex gap-8 items-center"}>
                {navigationLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn("cursor-pointer inline-flex gap-2 items-center bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent font-semibold text-lg",
                            props.transparent ? 
                                "text-background hover:text-background/70" 
                                : 
                                "text-foreground hover:text-foreground/70")}>
                        {link.name}
                    </Link>
                ))}
            </div>

            {/*Extra links*/}
            <div className={"flex flex-row gap-2 p-4"}>
                <NavButton
                    tabIndex={0}
                    text="Docs"
                    icon={<ArrowTopRightOnSquareIcon className="w-6 h-6" />}
                    light={props.transparent}
                    onClick={() => console.log("Button clicked!")}
                />
                <Wallet transparent={props.transparent}/>
            </div>
        </div>
    );
}