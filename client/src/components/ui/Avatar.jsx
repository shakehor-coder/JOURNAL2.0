import React, { useState } from "react";

/**
 * Avatar component based on Linear / GitHub design system
 * - Sizes: sm (32px), md (40px), lg (48px)
 * - Clean 1px border, fallback initials
 * - No neon flaming borders or rainbow glows
 */
export const Avatar = ({
  src = null,
  name = "Студент",
  size = "md", // 'sm' | 'md' | 'lg'
  shape = "circle", // 'circle' | 'rounded' (8px)
  className = "",
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  // Compute initials (up to 2 letters)
  const initials = (name || "С")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClasses = {
    sm: "w-8 h-8 text-[12px]",
    md: "w-10 h-10 text-[13px]",
    lg: "w-12 h-12 text-[15px]",
  };

  const shapeClasses = {
    circle: "rounded-full",
    rounded: "rounded-md", // 8px
  };

  const showImage = Boolean(src && !hasError);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none bg-surface-2 border border-border text-text font-medium ${sizeClasses[size] || sizeClasses.md} ${shapeClasses[shape] || shapeClasses.circle} ${className}`}
      aria-label={name}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-semibold text-text tracking-wide">{initials}</span>
      )}
    </div>
  );
};
