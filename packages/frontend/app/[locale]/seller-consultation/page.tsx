import { Suspense } from "react";
import SellPropertyClient from "./SellPropertyClient";

export default function SellPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center">Loading...</div>}>
      <SellPropertyClient />
    </Suspense>
  );
}
