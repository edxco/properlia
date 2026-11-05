'use client';

import { use } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { DashboardNav } from "@/src/components/DashboardNav";
import ProperliaLogo from "@/public/properlia.png";
import ProperliaSimpleLogo from "@/public/properlia-simple.png";
import { useT } from "@properlia/shared/components/TranslationProvider";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { Button } from "@properlia/shared/components/ui";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const { user, logout } = useAuth();
  const t = useT();

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Dashboard Header */}
      <header className="bg-white border-b border-brand-border">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Image src={ProperliaLogo} alt="Properlia logo" width={160} className="hidden sm:block" />
            <Image src={ProperliaSimpleLogo} alt="Properlia logo" width={32} className="block sm:hidden" />
            <div className="flex items-center space-x-6">
              <DashboardNav locale={locale} />
              <div className="flex items-center space-x-4 border-l border-brand-border pl-4">
                {user && (
                  <span className="text-sm text-brand-carbon/70">
                    {user.name || user.email}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="size-8 text-danger hover:bg-danger-soft"
                  aria-label={t('logout')}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-[16px] py-8">
        {children}
      </main>
    </div>
  );
}
