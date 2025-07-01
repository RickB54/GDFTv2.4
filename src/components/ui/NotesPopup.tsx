
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { convertGoogleDriveUrl } from "@/lib/formatters";

interface NotesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  notes: string;
  imageUrl?: string;
}

const NotesPopup = ({ isOpen, onClose, title, notes, imageUrl }: NotesPopupProps) => {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | undefined>(undefined);
  const [imageError, setImageError] = useState(false);

  // Process image URL when component mounts or imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      const converted = convertGoogleDriveUrl(imageUrl);
      setProcessedImageUrl(converted);
      setImageError(false);
      console.log("NotesPopup - Image URL set to:", converted);
    } else {
      setProcessedImageUrl(undefined);
    }
  }, [imageUrl, isOpen]);

  // Reset image error state when popup opens or imageUrl changes
  useEffect(() => {
    if (isOpen) {
      setImageError(false);
    }
  }, [isOpen, imageUrl]);

  const handleImageError = () => {
    console.error("Notes popup image failed to load:", processedImageUrl);
    setImageError(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] sm:max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title} Notes</DialogTitle>
          <DialogClose className="absolute right-4 top-4" asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        {processedImageUrl && !imageError && (
          <div className="flex justify-center mb-4">
            <img 
              src={processedImageUrl} 
              alt={title} 
              className="max-h-40 object-contain rounded-md"
              onError={handleImageError}
            />
          </div>
        )}
        
        <ScrollArea className="mt-2 max-h-[50vh] pr-4">
          {notes ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{notes}</p>
          ) : (
            <p className="text-muted-foreground italic">No notes available</p>
          )}
        </ScrollArea>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesPopup;
