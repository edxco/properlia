// app/[locale]/properties/page.tsx
import { Suspense } from "react";
import PropertiesClient from "./PropertiesClient";

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center">Loading...</div>}>
      <PropertiesClient />
    </Suspense>
  );
}
