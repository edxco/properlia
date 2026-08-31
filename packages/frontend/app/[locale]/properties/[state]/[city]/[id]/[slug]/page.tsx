import { propertyApi } from "@properlia/shared/services/properties/api";
import { PropertyDetail } from "@properlia/shared";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  let property;
  try {
    property = await propertyApi.getById(id);
  } catch {
    notFound();
  }

  return <PropertyDetail property={property} locale={locale} />;
}
