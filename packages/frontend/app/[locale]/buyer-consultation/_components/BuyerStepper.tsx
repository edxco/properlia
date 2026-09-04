"use client";

import { IconCheck } from "@tabler/icons-react";
import { useT } from "@properlia/shared/components/TranslationProvider";

interface BuyerStepperProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function BuyerStepper({ currentStep, totalSteps, labels }: BuyerStepperProps) {
  const t = useT();
  const stepOfLabel = `${t("buyerStepPrefix")} ${currentStep} ${t("buyerStepConnector")} ${totalSteps}`;

  return (
    <div className="flex h-full flex-col bg-navy px-6 py-6 lg:px-10 lg:py-12">
      {/* Desktop: vertical agenda */}
      <div className="hidden flex-1 flex-col lg:flex">
        <p className="font-[family-name:var(--font-editorial-body)] text-xs font-medium uppercase tracking-[0.22em] text-white/50">
          {t("buyerRailTitle")}
        </p>

        <ol className="mt-10 space-y-2" aria-label={stepOfLabel}>
          {labels.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isActive = stepNumber === currentStep;

            return (
              <li key={stepNumber}>
                <div
                  aria-current={isActive ? "step" : undefined}
                  className={`flex items-center gap-5 border-l-2 py-4 pl-6 transition-colors duration-200 ${
                    isActive
                      ? "border-gold"
                      : isCompleted
                      ? "border-white/40"
                      : "border-white/10"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`w-9 font-[family-name:var(--font-editorial-display)] text-2xl font-medium italic leading-none transition-colors duration-200 ${
                      isActive ? "text-gold" : isCompleted ? "text-white/70" : "text-white/30"
                    }`}
                  >
                    {isCompleted ? (
                      <IconCheck size={22} stroke={2} className="not-italic" />
                    ) : (
                      `0${stepNumber}`
                    )}
                  </span>
                  <span
                    className={`font-[family-name:var(--font-editorial-body)] text-sm transition-colors duration-200 ${
                      isActive
                        ? "font-medium text-white"
                        : isCompleted
                        ? "text-white/70"
                        : "text-white/40"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Trust microcopy anchored to the rail's foot */}
        <div className="mt-auto space-y-3 border-t border-white/10 pt-8">
          <p className="flex items-start gap-3 font-[family-name:var(--font-editorial-body)] text-sm leading-relaxed text-white/70">
            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
            {t("buyerTrustStripPart2")}
          </p>
          <p className="flex items-start gap-3 font-[family-name:var(--font-editorial-body)] text-sm leading-relaxed text-white/70">
            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
            {t("buyerTrustStripPart1")}
          </p>
        </div>
      </div>

      {/* Mobile: compact progress strip */}
      <div className="lg:hidden">
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-[family-name:var(--font-editorial-body)] text-xs font-medium uppercase tracking-[0.2em] text-white/60">
            {stepOfLabel}
          </span>
          <span className="font-[family-name:var(--font-editorial-body)] text-sm font-medium text-white">
            {labels[currentStep - 1]}
          </span>
        </div>
        <ol className="mt-4 flex gap-1.5" aria-label={stepOfLabel}>
          {labels.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isActive = stepNumber === currentStep;

            return (
              <li
                key={stepNumber}
                aria-current={isActive ? "step" : undefined}
                className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                  isActive ? "bg-gold" : isCompleted ? "bg-white/60" : "bg-white/15"
                }`}
              >
                <span className="sr-only">{label}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
