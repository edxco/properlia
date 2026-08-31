import Link from "next/link";
import type { ReactNode } from "react";

type PillLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export const PillLink = ({ href, children, className }: PillLinkProps) => {
  return (
    <Link
      href={href}
      className={`
        inline-flex items-center justify-center rounded-full px-4 py-1 text-sm font-medium ${
          className ?? ""
        }
      `}
    >
      {children}
    </Link>
  );
};
