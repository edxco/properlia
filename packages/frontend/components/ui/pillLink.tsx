import Link from "next/link";
import type { ReactNode } from "react";
import { badgeClasses } from "@properlia/shared/components/ui";

type PillLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export const PillLink = ({ href, children, className }: PillLinkProps) => {
  return (
    <Link
      href={href}
      className={badgeClasses({ className: `justify-center px-4 py-1 text-sm ${className ?? ""}` })}
    >
      {children}
    </Link>
  );
};
