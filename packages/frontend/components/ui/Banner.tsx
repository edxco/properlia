import type { ReactNode } from "react";

type BannerProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
};

export const Banner = ({ title, description, icon, className }: BannerProps) => {
  return (
    <div
      className={`bg-white border border-stone-200 rounded-lg p-6 ${className ?? ""}`}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex-shrink-0 text-primary">{icon}</div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-stone-800 mb-1">{title}</h3>
          <p className="text-sm text-stone-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};
