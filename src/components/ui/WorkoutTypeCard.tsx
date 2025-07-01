
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface WorkoutTypeCardProps {
  icon: LucideIcon;
  title: string;
  color: string;
  onClick: () => void;
  className?: string;
}

const WorkoutTypeCard = ({
  icon: Icon,
  title,
  color,
  onClick,
  className,
}: WorkoutTypeCardProps) => {
  const colorVariants: Record<string, string> = {
    blue: "bg-gym-blue/20 border-gym-blue/30 hover:bg-gym-blue/30",
    green: "bg-gym-green/20 border-gym-green/30 hover:bg-gym-green/30",
    purple: "bg-gym-purple/20 border-gym-purple/30 hover:bg-gym-purple/30",
    orange: "bg-gym-orange/20 border-gym-orange/30 hover:bg-gym-orange/30",
    red: "bg-gym-red/20 border-gym-red/30 hover:bg-gym-red/30",
  };

  const iconColorVariants: Record<string, string> = {
    blue: "bg-gym-blue",
    green: "bg-gym-green",
    purple: "bg-gym-purple",
    orange: "bg-gym-orange",
    red: "bg-gym-red",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg border backdrop-blur-sm transition-all duration-300 flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02]", // Reduced padding from p-3 to p-2, rounded-xl to rounded-lg
        colorVariants[color],
        className
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center mb-1", // Reduced icon container from w-10 h-10 to w-8 h-8
          iconColorVariants[color]
        )}
      >
        <Icon className="h-4 w-4 text-white" /> {/* Reduced icon size from h-5 w-5 to h-4 w-4 */}
      </div>
      <span className="font-medium text-xs">{title}</span> {/* Reduced font size from text-sm to text-xs */}
    </div>
  );
};

export default WorkoutTypeCard;
