'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, ChevronDown, FileText, Users, Sparkles, UserCog, ImageIcon } from 'lucide-react';
import { useT } from '@properlia/shared/components/TranslationProvider';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';

interface DashboardNavProps {
  locale: string;
}

export function DashboardNav({ locale }: DashboardNavProps) {
  const pathname = usePathname();
  const t = useT();
  const { user } = useAuth();
  const localePrefix = `/${locale}`;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dropdownItems = useMemo(() => {
    const items = [
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
      {
        href: `${localePrefix}/dashboard/leads`,
        labelKey: 'leads',
        icon: Users,
      },
      {
        href: `${localePrefix}/dashboard/general-information`,
        labelKey: 'generalInformation',
        icon: FileText,
      },
      {
        href: `${localePrefix}/dashboard/property-features`,
        labelKey: 'propertyFeatures',
        icon: Sparkles,
      },
      {
        href: `${localePrefix}/dashboard/image-generator`,
        labelKey: 'imageGenerator',
        icon: ImageIcon,
      },
    ];

    // Add Users management option for admin users only
    if (user?.role === 'admin') {
      items.push({
        href: `${localePrefix}/dashboard/users`,
        labelKey: 'users',
        icon: UserCog,
      });
    }

    return items;
  }, [localePrefix, user?.role]);

  const isActive = (href: string) => {
    if (href === `${localePrefix}/dashboard`) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const isDropdownActive = dropdownItems.some(item => isActive(item.href));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center space-x-1">
      {/* Properties Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${
              isDropdownActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }
          `}
        >
          <Building2 className="h-4 w-4" />
          <span>Admin Menu</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
            {dropdownItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsDropdownOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2 text-sm transition-colors
                    ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
