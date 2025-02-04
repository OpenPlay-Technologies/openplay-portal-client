"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {useEffect, useState} from "react";

export function ModeToggle() {
    const { theme, setTheme } = useTheme();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    const isDark = theme === "dark";

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark");
    };

    return (
        <>
        {
            loading ? (<div className={"w-[32px] h-[40px]"}>
                
                </div>) :
                <Button variant="ghost" size="default" onClick={toggleTheme} className={"p-2 h-auto"}>
                    {isDark ? <Sun className="size-6"/> :
                        <Moon className="size-6"/>}
                </Button>
        }
        </>
    );
}
