import { Suspense } from "react";
import BuyerConsultationClient from "./BuyerConsultationClient";

export default function BuyerConsultationPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center">Loading...</div>}>
      <BuyerConsultationClient />
    </Suspense>
  );
}
