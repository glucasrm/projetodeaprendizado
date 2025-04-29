import * as React from "react";

function Card({ className, children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-gray-700 bg-[#0F172A] text-white shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardContent({ className, children, ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export { Card, CardContent };
