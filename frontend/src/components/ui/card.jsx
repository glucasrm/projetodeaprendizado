import React from "react";

function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-gray-700 bg-[#0F172A] text-white shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className = "", children, ...props }) {
  return (
    <div
      className={`flex items-center justify-between p-4 border-b border-gray-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({ className = "", children, ...props }) {
  return (
    <h3 className={`text-lg font-semibold ${className}`} {...props}>
      {children}
    </h3>
  );
}

function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardContent };
