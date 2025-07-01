
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ExercisesHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpPages = [
    {
        title: "How to Use the Exercises Page",
        content: "This guide explains how to use the Exercises page to find, create, and manage your exercises. Use the arrows to navigate."
    },
    {
        title: "1. Filter and Search",
        content: "Use the search bar and dropdown filters for Equipment, Category, and Muscle Group to easily find the exercise you're looking for."
    },
    {
        title: "2. Quick Categories",
        content: "The category boxes provide a quick way to filter your exercise list. You can see totals for all exercises, your favorites, and different categories like Weights and Cardio."
    },
    {
        title: "3. Exercise Actions",
        content: "Each exercise card has several actions:\n- Start an instant workout with that exercise.\n- Edit the exercise details.\n- Add or remove it from your Favorites.\n- Delete the exercise."
    },
    {
        title: "4. Create New Exercises",
        content: "Click the 'New Exercise' button at the top to open the form for creating your own custom exercises to use in your workouts."
    }
];

const ExercisesHelpPopup = ({ isOpen, onClose }: ExercisesHelpPopupProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const page = helpPages[currentPage];

  const handleNext = () => {
    if (currentPage < helpPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleClose = () => {
    setCurrentPage(0);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{page.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 min-h-[200px]">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                {page.content}
            </p>
        </div>
        <DialogFooter className="flex justify-between w-full">
          <Button variant="outline" onClick={handlePrev} disabled={currentPage === 0}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground flex items-center">
            {currentPage + 1} / {helpPages.length}
          </div>
          {currentPage < helpPages.length - 1 ? (
              <Button variant="outline" onClick={handleNext}>
                  <ArrowRight className="h-4 w-4" />
              </Button>
          ) : (
              <Button onClick={handleClose}>
                  Close
              </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExercisesHelpPopup;
