import React, { forwardRef, useId } from "react";

/**
 * Input component for retro-print design system
 * - Border: 2px solid var(--ink)
 * - Border radius: 6px
 * - Height: 40px
 */
export const Input = forwardRef(
  (
    {
      label = null,
      error = null,
      hint = null,
      icon: Icon = null,
      iconRight: IconRight = null,
      className = "",
      id = null,
      disabled = false,
      type = "text",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-bold text-ink select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {Icon && (
            <div className="absolute left-3 text-ink-muted pointer-events-none flex items-center justify-center">
              <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={`w-full h-10 rounded-[6px] bg-surface border-2 text-ink placeholder:text-ink-muted text-[14px] transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed ${
              Icon ? "pl-9" : "px-3"
            } ${IconRight ? "pr-9" : "px-3"} ${
              error
                ? "border-danger focus-visible:outline-danger"
                : "border-ink focus-visible:outline-accent"
            } focus-visible:outline-2 focus-visible:outline-offset-1 ${className}`}
            {...props}
          />

          {IconRight && (
            <div className="absolute right-3 text-ink-muted flex items-center justify-center">
              <IconRight className="w-4 h-4 shrink-0" strokeWidth={2} />
            </div>
          )}
        </div>

        {error ? (
          <span className="text-[13px] text-danger font-medium leading-tight">
            {error}
          </span>
        ) : hint ? (
          <span className="text-[13px] text-ink-muted leading-tight">
            {hint}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
