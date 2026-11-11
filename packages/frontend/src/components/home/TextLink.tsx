import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { buttonClasses } from "@properlia/shared/components/ui";
import { cn } from "@properlia/shared/lib/utils";

interface TextLinkProps {
  href: string;
  children: React.ReactNode;
  /** White link for navy backgrounds. */
  inverse?: boolean;
  className?: string;
}

/** Descriptive text link with a trailing arrow. */
export function TextLink({ href, children, inverse, className }: TextLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        buttonClasses({ variant: "link", className: "gap-1.5 text-left" }),
        inverse && "text-white focus-visible:ring-white focus-visible:ring-offset-brand-navy",
        className
      )}
    >
      {children}
      <IconArrowRight size={16} stroke={1.75} aria-hidden="true" className="shrink-0" />
    </Link>
  );
}
