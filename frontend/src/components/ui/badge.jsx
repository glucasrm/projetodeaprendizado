import * as React from "react";

function Badge({ className, children, ...props }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-blue-700 px-3 py-1 text-xs font-medium text-white ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
