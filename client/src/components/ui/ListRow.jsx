import React, { forwardRef } from "react";

/**
 * ListRow component for retro-print design system
 * - Border bottom: 1px solid var(--line)
 * - Minimum touch target: 40px
 * - Clean ink typography
 */
export const ListRow = forwardRef(
  (
    {
      title,
      subtitle,
      meta,
      leading: Leading = null,
      trailing: Trailing = null,
      onClick = null,
      active = false,
      className = "",
      as: Component = "div",
      ...props
    },
    ref
  ) => {
    const isInteractive = Boolean(onClick);

    return (
      <Component
        ref={ref}
        onClick={onClick}
        className={`group relative flex items-center justify-between min-h-[44px] px-4 py-3 border-b border-line last:border-b-0 text-ink transition-colors duration-120 ${
          isInteractive
            ? "cursor-pointer hover:bg-surface-2 focus-visible:outline-none focus-visible:bg-surface-2"
            : ""
        } ${active ? "bg-surface-2" : "bg-transparent"} ${className}`}
        {...(isInteractive ? { role: "button", tabIndex: 0 } : {})}
        {...props}
      >
        {/* Left Side: Leading Icon + Text Stack */}
        <div className="flex items-center gap-3 min-w-0 pr-3">
          {Leading && (
            <div className="text-ink-muted group-hover:text-ink transition-colors shrink-0">
              {typeof Leading === "function" ? (
                <Leading className="w-4 h-4" strokeWidth={2} />
              ) : (
                Leading
              )}
            </div>
          )}

          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[14px] font-medium text-ink truncate">
              {title}
            </span>
            {subtitle && (
              <span className="text-[13px] text-ink-muted mt-0.5 truncate leading-normal">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Meta / Trailing Badge or Action */}
        <div className="flex items-center gap-3 shrink-0 font-mono text-[13px]">
          {meta && (
            <span className="text-ink-muted font-normal">
              {meta}
            </span>
          )}
          {Trailing && (
            <div className="shrink-0 flex items-center">
              {Trailing}
            </div>
          )}
        </div>
      </Component>
    );
  }
);

ListRow.displayName = "ListRow";
