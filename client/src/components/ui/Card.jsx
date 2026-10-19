import React, { forwardRef } from "react";

/**
 * Card component for retro-print design system
 * - Border: 2px solid var(--ink)
 * - Border radius: 10px
 * - Shadow: 4px 4px 0 var(--ink)
 * - Header: surface-2 with 2px bottom border
 */
export const Card = forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-surface border-2 border-ink rounded-[10px] shadow-hard text-ink overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export const CardHeader = forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-4 py-3 bg-surface-2 border-b-2 border-ink flex flex-col gap-1 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef(
  ({ children, className = "", as: Component = "h3", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={`text-[15px] font-bold text-ink tracking-tight ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`text-[13px] text-ink-muted leading-relaxed ${className}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={`p-4 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-4 py-3 bg-surface-2 border-t-2 border-ink flex items-center justify-between text-[13px] text-ink-muted ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";
