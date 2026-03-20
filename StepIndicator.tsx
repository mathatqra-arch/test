"use client";

import React from "react";
import { motion } from "framer-motion";
import { theme, Language } from "@/themes/config";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  lang: Language;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, lang }) => {
  const steps = Array.from({ length: totalSteps - 2 }, (_, i) => i + 1);
  const copy = theme.copy[lang];

  // شرط العرض - نحسب عدد الخطوات
  const stepCount = steps.length;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-start justify-between relative px-2 sm:px-6">

        {/* Background Line */}
        <div
          className="absolute h-0.5 bg-muted rounded-full"
          style={{
            top: lang === 'ar' ? '28px' : '28px',
            left: '10%',
            right: '10%',
          }}
        />

        {/* Progress Line */}
        <motion.div
          className="absolute h-0.5 bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold-primary)] to-[var(--gold-light)] rounded-full origin-left"
          style={{
            top: '28px',
            left: '10%',
            width: `${Math.max(0, ((currentStep - 1) / (stepCount - 1)) * 80)}%`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Step Nodes */}
        {steps.map((step) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;

          // نص قصير للإنجليزي عشان ميتداخلش
          const rawLabel = (copy.steps as any)[step] as string;
          const shortLabel = lang === 'en'
            ? rawLabel
                .replace('Upload Photos', 'Photos')
                .replace('Measurements', 'Body')
                .replace('Preferences', 'Style')
                .replace('Analyzing', 'AI')
                .replace('Your Report', 'Report')
            : rawLabel;

          return (
            <div
              key={step}
              className="relative z-10 flex flex-col items-center"
              style={{ flex: 1 }}
            >
              {/* Number Circle */}
              <motion.div
                className={`
                  w-14 h-14 sm:w-16 sm:h-16
                  rounded-full
                  flex items-center justify-center
                  text-lg sm:text-xl font-bold
                  border-2
                  transition-all duration-300
                  ${isCompleted
                    ? "bg-[var(--gold-primary)] border-[var(--gold-primary)] text-[var(--purple-deep)]"
                    : isActive
                      ? "bg-background border-[var(--gold-primary)] text-[var(--gold-primary)] shadow-lg shadow-[var(--gold-primary)]/30"
                      : "bg-background border-muted text-muted-foreground"
                  }
                `}
                animate={isActive ? { scale: [1.05, 1.1, 1.05] } : { scale: 1 }}
                transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6 sm:w-7 sm:h-7" />
                ) : (
                  <span className="font-display ltr-text">{step}</span>
                )}
              </motion.div>

              {/* Label - تحت الدائرة */}
              <motion.span
                className={`
                  mt-2 sm:mt-3
                  text-[10px] sm:text-xs
                  font-medium
                  text-center
                  leading-tight
                  max-w-[60px] sm:max-w-[80px]
                  transition-colors duration-300
                  ${isActive
                    ? "text-[var(--gold-primary)] font-semibold"
                    : isCompleted
                      ? "text-[var(--gold-primary)]/70"
                      : "text-muted-foreground"
                  }
                  ${lang === 'ar' ? 'font-arabic' : 'font-label uppercase tracking-wide'}
                `}
                animate={isActive ? { opacity: [0.7, 1, 0.7] } : {}}
                transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
              >
                {shortLabel}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
