import React from "react";
import {cn} from "@/lib/utils";

type ButtonProps = {
    text: string;
    icon: React.ReactNode;
    light?: boolean;
    onClick?: () => void;
    tabIndex?: number;
    className?: string; // For additional styling if needed
};

const NavButton: React.FC<ButtonProps> = ({
                                                 text,
                                                 icon,
                                              light = false,
                                                 onClick,
                                                 tabIndex = 0,
                                                 className,
                                             }) => {
    return (
        <div
            tabIndex={tabIndex}
            onClick={onClick}
            className={cn(
                "h-auto inline-flex gap-2 p-2 border-transparent rounded-lg backdrop-blur-3xl items-center cursor-pointer",
                light
                    ? "bg-background/30 text-primary-foreground hover:bg-background/40"
                    : "bg-foreground/10 text-foreground hover:bg-foreground/20",
                className
            )}
        >
            <span>{text}</span>
            {icon}
        </div>
    );
};

export default NavButton;