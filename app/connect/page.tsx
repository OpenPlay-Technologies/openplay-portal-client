import ConnectPage from "@/components/sui/connect-page";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <ConnectPage />
    </Suspense>
  )
}