import React from "react";

/**
 * SectionHeader component based on Linear / GitHub design system
 * - Clean title (weight 600) + subtle description (13-14px)
 * - Trailing action slot (buttons / filters)
 * - Optional bottom border divider
 */
export const SectionHeader = ({
  title,
  description = null,
  action = null,
  divider = false,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 ${
        divider ? "border-b border-border mb-4" : ""
      } ${className}`}
      {...props}
    >
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[17px] font-semibold text-text tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-[13px] text-text-muted leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {action}
        </div>
      )}
    </div>
  );
};
