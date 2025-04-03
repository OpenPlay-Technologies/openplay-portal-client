import ConnectPage from "@/components/wallet/connect-page";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <ConnectPage />
    </Suspense>
  )
}