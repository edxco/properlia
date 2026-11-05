import type { ReactNode } from "react";
import { Card } from "@properlia/shared/components/ui";

type BannerProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
};

export const Banner = ({ title, description, icon, className }: BannerProps) => {
  return (
    <Card padding="none" className={`p-6 ${className ?? ""}`}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex-shrink-0 text-primary">{icon}</div>
        )}
        <div>
          <h3 className="text-sm font-medium text-brand-carbon mb-1">{title}</h3>
          <p className="text-sm text-brand-carbon/70 leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  );
};
