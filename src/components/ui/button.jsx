import React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  default: "bg-blue-600 text-white hover:bg-blue-700",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-gray-300 text-white hover:bg-gray-700",
  secondary: "bg-gray-600 text-white hover:bg-gray-700",
  ghost: "text-white hover:bg-gray-700",
  link: "text-blue-500 underline hover:text-blue-700",
};

const sizeVariants = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 rounded-md",
  lg: "h-11 px-8 rounded-md",
  icon: "h-10 w-10",
};

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        buttonVariants[variant],
        sizeVariants[size],
        className
      )}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button };
