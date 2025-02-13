import { Info } from "lucide-react"

interface InfoBarProps {
    network: string;
}

export default function NetworkInfoBar(props: InfoBarProps) {
    
    return (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-blue-700">
            <div className="container mx-auto flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium">
            This is a {props.network} deployment. Please configure your wallet to use {props.network}.
          </span>
                </div>
            </div>
        </div>
    )
}

