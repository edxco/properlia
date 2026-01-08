'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, PlusCircle, List } from 'lucide-react';
import { useT } from '@properlia/shared/components/TranslationProvider';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface DashboardNavProps {
  locale: string;
}

export function DashboardNav({ locale }: DashboardNavProps) {
  const pathname = usePathname();
  const t = useT();
  const localePrefix = `/${locale}`;

  const navItems: NavItem[] = [
    {
      href: `${localePrefix}/dashboard`,
      labelKey: 'overview',
      icon: Home,
    },
    {
      href: `${localePrefix}/dashboard/properties`,
      labelKey: 'properties',
      icon: Building2,
    },
  ];

  const isActive = (href: string) => {
    if (href === `${localePrefix}/dashboard`) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="flex items-center space-x-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
