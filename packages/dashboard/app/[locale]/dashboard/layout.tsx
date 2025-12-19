import Link from "next/link";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const localePrefix = `/${params.locale}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold">Properlia Dashboard</h1>
            <nav className="flex space-x-4">
              <Link href={`${localePrefix}/dashboard`} className="text-gray-600 hover:text-gray-900">
                Overview
              </Link>
              <Link
                href={`${localePrefix}/dashboard/properties`}
                className="text-gray-600 hover:text-gray-900"
              >
                Properties
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
