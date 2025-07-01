
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { convertGoogleDriveUrl } from "@/lib/formatters";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
  color?: string;
  imageUrl?: string;
  category?: string;
}

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  className, 
  color,
  imageUrl,
  category
}: StatsCardProps) => {
  // Format the value if it's a number
  const displayValue = typeof value === 'number' ? formatNumber(value) : value;
  const isSlideBoard = category === "Slide Board";
  const [imageError, setImageError] = React.useState(false);
  
  const handleImageError = () => {
    console.error("StatsCard - Image failed to load:", imageUrl);
    setImageError(true);
  };
  
  return (
    <div
      className={cn(
        "card-glass p-4 animate-fadeIn",
        className
      )}
    >
      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          {imageUrl && !imageError ? (
            <div className="h-6 w-6 rounded-md flex-shrink-0 overflow-hidden mr-2">
              <img 
                src={imageUrl.includes('drive.google.com') ? convertGoogleDriveUrl(imageUrl) : imageUrl}
                alt={title}
                className="h-full w-full object-cover"
                onError={handleImageError}
              />
            </div>
          ) : (
            <Icon className={cn("h-5 w-5 mr-2", color ? `text-${color}-500` : "text-muted-foreground")} />
          )}
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
        <p className="text-2xl font-bold">{displayValue}</p>
      </div>
    </div>
  );
};

export default StatsCard;
