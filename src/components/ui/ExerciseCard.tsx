
import React, { useState } from "react";
import { Edit, Play, Heart, Trash } from "lucide-react";
import { convertGoogleDriveUrl } from "@/lib/formatters";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getExerciseImageUrl } from "@/lib/utils";

interface ExerciseCardProps {
  name: string;
  category: string;
  thumbnailUrl?: string;
  pictureUrl?: string;
  onStart: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  isFavorite: boolean;
}

const ExerciseCard = ({
  name,
  category,
  thumbnailUrl,
  pictureUrl,
  onStart,
  onEdit,
  onToggleFavorite,
  onDelete,
  isFavorite,
}: ExerciseCardProps) => {
  // Use pictureUrl directly if available, otherwise use thumbnailUrl
  const imageUrl = pictureUrl || thumbnailUrl;
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    console.error("Image failed to load:", imageUrl);
    setImageError(true);
  };

  const handleStartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onStart();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };


  return (
    <div className="card-glass p-4 mb-4 animate-fadeIn">
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-md bg-gym-dark flex-shrink-0 flex items-center justify-center mr-4 overflow-hidden">
          {imageUrl && !imageError ? (
            <img 
              src={imageUrl.includes('drive.google.com') ? convertGoogleDriveUrl(imageUrl) : imageUrl} 
              alt={name} 
              className="h-full w-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="h-10 w-10 flex items-center justify-center text-muted-foreground">
              <span className="text-xs">No image</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-base truncate">{name}</h3>
          <p className="text-sm text-muted-foreground">{category}</p>
        </div>
        <div className="flex items-center space-x-1">
           <button onClick={handleFavoriteClick} className="bg-gym-dark hover:bg-gym-card-hover rounded-full p-2 transition-colors">
                <Heart className={`h-4 w-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </button>
            <button
              onClick={handleStartClick}
              className="bg-gym-dark hover:bg-gym-card-hover rounded-full p-2 transition-colors"
            >
              <Play className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={handleEditClick}
              className="bg-gym-dark hover:bg-gym-card-hover rounded-full p-2 transition-colors"
            >
              <Edit className="h-4 w-4 text-muted-foreground" />
            </button>
             <button onClick={handleDeleteClick} className="bg-gym-dark hover:bg-gym-card-hover rounded-full p-2 transition-colors">
                <Trash className="h-4 w-4 text-gym-red" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
