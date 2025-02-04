import { notFound } from 'next/navigation';
import {getSponsorAddress} from "@/app/actions";
import {fetchBalance} from "@/api/queries/balance";
import {formatSuiAmount} from "@/lib/utils";
import FundSponsor from "@/components/sponsor/fund-sponsor";
import Link from "next/link";


export default async function Home() {
    const sponsorAddress = await getSponsorAddress();

    if (!sponsorAddress){
        return notFound();
    }

    const sponsorBalance = await fetchBalance(sponsorAddress);

    return (
        <div className={"w-screen h-screen flex flex-col justify-center items-center gap-4"}>
            <div>
                <p>Address: <span className={"font-semibold"}>{sponsorAddress}</span></p>
                <p>Balance: <span className={"font-semibold"}>{formatSuiAmount(sponsorBalance)}</span></p>
            </div>
            <FundSponsor sponsorAddress={sponsorAddress}/>
            <Link href={"/"} className={"underline text-muted-foreground"}>
                Back
            </Link>
        </div>
    );
}
