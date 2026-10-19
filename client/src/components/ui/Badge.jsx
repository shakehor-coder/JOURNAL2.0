import React from "react";

/**
 * Badge component for retro-print design system
 * - Border: 1.5px / 2px solid var(--ink)
 * - Font: mono 12px
 * - Clean colors without gradients or halos
 */
export const Badge = ({
  children,
  variant = "neutral", // 'neutral' | 'success' | 'warning' | 'danger' | 'accent'
  dot = false,
  className = "",
  ...props
}) => {
  const variantClasses = {
    neutral: "bg-surface-2 text-ink border border-ink",
    success: "bg-success text-white border border-ink",
    warning: "bg-highlight text-on-highlight border border-ink",
    danger: "bg-danger text-white border border-ink",
    accent: "bg-accent text-white border border-ink",
  };

  const dotClasses = {
    neutral: "bg-ink-muted",
    success: "bg-white",
    warning: "bg-ink",
    danger: "bg-white",
    accent: "bg-white",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[12px] font-mono font-medium rounded-full select-none ${variantClasses[variant] || variantClasses.neutral} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses[variant] || dotClasses.neutral}`}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
