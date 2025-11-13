// src/components/Title.jsx
import React from "react";


export default function Title({
  children,
  size = "md",
  align = "center",
  colorClass = "color-title",
  as: Tag = "h2",
  className = "",
}) {
  const sizeMap = {
    sm: "text-xl lg:text-3xl",
    md: "text-2xl lg:text-4xl", 
    lg: "text-3xl lg:text-5xl",
  };

  const alignMap = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <Tag
      className={`${sizeMap[size]} font-bold py-4 mb-8 ${colorClass} ${alignMap[align]} ${className}`}
    >
      {children}
    </Tag>
  );
}
