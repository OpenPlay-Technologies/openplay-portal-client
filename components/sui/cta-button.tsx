import {cn} from "@/lib/utils";
import React from "react";

interface CtaButtonProps {
    variant: "primary" | "secondary" | "secondary-white";
    text: string;
    uppercase?: boolean;
    bold?: boolean;
    size?: "small" | "medium" | "large";
    icon?: React.ReactNode;
}

export default function CtaButton(props: CtaButtonProps) {
    const size = props.size ?? "medium";
    return (
        <button
            className={cn("inline-flex items-center gap-2 rounded-full hover:scale-105 backdrop-blur-3xl",
                size === "small" ? "px-4 py-2" : "",
                size === "medium" ? "px-8 py-4" : "",
                size === "large" ? "px-12 py-6" : "",
                props.variant === "primary" ? "text-white bg-gradient-to-r from-openplay1 to-openplay2" : "",
                props.variant === "secondary" ? "bg-primary/15 text-primary" : "",
                props.variant === "secondary-white" ? "bg-white/15 text-white" : "",
                props.uppercase ? "uppercase" : "",
                props.bold ? "font-bold" : "",)}
        >
            {props.text}
            {props.icon}            
        </button>
    )
}