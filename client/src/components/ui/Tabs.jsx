import React, { createContext, useContext, forwardRef } from "react";

const TabsContext = createContext({
  activeTab: "",
  onTabChange: () => {},
  variant: "underline",
});

/**
 * Tabs component based on Linear / GitHub design system
 * - Variants: 'underline' (default) | 'segmented'
 * - Touch targets ≥ 40px
 * - Visible focus-visible ring
 */
export const Tabs = ({
  activeTab,
  onTabChange,
  variant = "underline", // 'underline' | 'segmented'
  children,
  className = "",
  ...props
}) => {
  return (
    <TabsContext.Provider value={{ activeTab, onTabChange, variant }}>
      <div className={`w-full ${className}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabList = forwardRef(({ children, className = "", ...props }, ref) => {
  const { variant } = useContext(TabsContext);

  if (variant === "segmented") {
    return (
      <div
        ref={ref}
        role="tablist"
        className={`inline-flex items-center p-1 rounded-md bg-surface border border-border gap-1 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }

  // Underline variant (GitHub/Linear style)
  return (
    <div
      ref={ref}
      role="tablist"
      className={`flex items-center gap-1 border-b border-border overflow-x-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

TabList.displayName = "TabList";

export const TabTrigger = forwardRef(
  ({ value, children, icon: Icon = null, count = null, className = "", disabled = false, ...props }, ref) => {
    const { activeTab, onTabChange, variant } = useContext(TabsContext);
    const isActive = activeTab === value;

    if (variant === "segmented") {
      return (
        <button
          ref={ref}
          role="tab"
          type="button"
          disabled={disabled}
          aria-selected={isActive}
          onClick={() => onTabChange(value)}
          className={`inline-flex items-center justify-center min-h-[36px] sm:min-h-[40px] px-3.5 py-1.5 text-[13px] font-medium rounded-md transition-colors duration-150 ease-out cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            isActive
              ? "bg-surface-2 text-text shadow-sm"
              : "text-text-muted hover:text-text hover:bg-surface-2/50"
          } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        >
          {Icon && <Icon className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={1.75} />}
          <span>{children}</span>
          {count !== null && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[11px] font-medium bg-border text-text-muted tabular-nums">
              {count}
            </span>
          )}
        </button>
      );
    }

    // Underline variant
    return (
      <button
        ref={ref}
        role="tab"
        type="button"
        disabled={disabled}
        aria-selected={isActive}
        onClick={() => onTabChange(value)}
        className={`relative inline-flex items-center justify-center min-h-[40px] px-3.5 py-2 text-[14px] font-medium transition-colors duration-150 ease-out cursor-pointer select-none border-b-2 -mb-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          isActive
            ? "border-accent text-text"
            : "border-transparent text-text-muted hover:text-text hover:border-border"
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {Icon && <Icon className="w-4 h-4 mr-2 shrink-0" strokeWidth={1.75} />}
        <span>{children}</span>
        {count !== null && (
          <span className="ml-2 px-1.5 py-0.2 rounded text-[11px] font-medium bg-surface-2 text-text-muted tabular-nums border border-border">
            {count}
          </span>
        )}
      </button>
    );
  }
);

TabTrigger.displayName = "TabTrigger";

export const TabContent = ({ value, children, className = "", ...props }) => {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={`pt-4 focus-visible:outline-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
