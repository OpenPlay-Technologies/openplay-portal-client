"use client"
import {CopyIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {useToast} from "@/hooks/use-toast";

interface CopyIconProps {
    value: string;
    className?: string;
    strokeWidth?: number;
}

export default function ClientCopyIcon(props: CopyIconProps) {
    const {toast} = useToast();
    
    return (
        <CopyIcon 
            strokeWidth={props.strokeWidth ?? 1.5}
            className={cn(props.className, "cursor-pointer")} 
            onClick={() => {
                navigator.clipboard.writeText(props.value);
                toast({
                    title: 'Copied to clipboard'})
            }}
        />
    )
}