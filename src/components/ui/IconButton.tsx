
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IconButtonProps {
  Icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
  variant?: "blue" | "green" | "purple" | "orange";
  size?: "sm" | "md" | "lg";
}

const IconButton = ({
  Icon,
  label,
  onClick,
  className,
  variant = "blue",
  size = "md",
}: IconButtonProps) => {
  const variantClasses = {
    blue: "bg-gym-blue text-white",
    green: "bg-gym-green text-white",
    purple: "bg-gym-purple text-white",
    orange: "bg-gym-orange text-white",
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center space-y-2",
        className
      )}
    >
      <div
        onClick={onClick}
        className={cn(
          "rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105",
          variantClasses[variant],
          sizeClasses[size]
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      {label && <span className="text-xs font-medium">{label}</span>}
    </div>
  );
};

export default IconButton;
