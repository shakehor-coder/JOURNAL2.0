import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

/**
 * Button component for retro-print design system
 * - Border: 2px solid var(--ink)
 * - Radius: 6px
 * - Hard offset shadow: 3px 3px 0 var(--ink)
 * - Hover / Active: tactile press translation
 */
export const Button = forwardRef(
  (
    {
      children,
      variant = "secondary", // 'primary' | 'secondary' | 'ghost' | 'danger'
      size = "md", // 'sm' | 'md' | 'lg'
      isLoading = false,
      disabled = false,
      icon: Icon = null,
      iconRight: IconRight = null,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium select-none min-h-[40px] rounded-[6px] border-2 border-ink transition-transform duration-120 ease-out cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

    const variantClasses = {
      primary:
        "bg-ink text-on-ink shadow-[3px_3px_0_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
      secondary:
        "bg-surface text-ink shadow-[3px_3px_0_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
      ghost:
        "bg-transparent text-ink border-transparent shadow-none hover:bg-surface-2 active:translate-y-[1px]",
      danger:
        "bg-surface text-danger border-danger shadow-[3px_3px_0_var(--danger)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
    };

    const sizeClasses = {
      sm: "h-9 px-3 text-[13px] gap-1.5",
      md: "h-10 px-4 text-[14px] gap-2",
      lg: "h-11 px-5 text-[15px] gap-2.5",
    };

    const isButtonDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isButtonDisabled}
        className={`${baseClasses} ${variantClasses[variant] || variantClasses.secondary} ${sizeClasses[size] || sizeClasses.md} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" strokeWidth={2} />
        ) : Icon ? (
          <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
        ) : null}

        <span>{children}</span>

        {!isLoading && IconRight && (
          <IconRight className="w-4 h-4 shrink-0" strokeWidth={2} />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
