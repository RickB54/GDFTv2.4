
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface HelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpPages = [
    {
        title: "Welcome to GymDayFitTracker!",
        content: "This guide will walk you through the main features of the app. Use the arrows at the bottom to navigate through the topics."
    },
    {
        title: "Monitoring Progress & Plans",
        content: "On the home screen, you'll find two main cards:\n\n- Monitor Progress: Tap here to view your workout statistics and track your body measurements over time.\n\n- Create Plans: This section allows you to build and manage your own custom workout plans for structured training."
    },
    {
        title: "Starting a Quick Workout",
        content: "The colored cards on the home page let you quickly start a workout based on an equipment category:\n\n- Standard Weights, Slide Board, Cardio, No Equipment: Tapping one of these will take you to a list of exercises filtered by that category. You can then select exercises to build a workout for the day.\n\nThis is great for when you know exactly what type of workout you want to do."
    },
    {
        title: "Mixing & Matching Exercises",
        content: "For more flexibility, navigate to the Exercises page from the bottom navigation bar. \n\nThere, you can see all exercises and use advanced filters to combine different categories, muscle groups, and equipment types into a single workout. It's the best way to create a truly varied routine."
    },
    {
        title: "Custom Workouts",
        content: "- Create A Custom Workout: This button lets you build a workout from scratch by selecting any exercise from the library, regardless of category. It's perfect for designing your own unique sessions.\n\n- Show Custom Workouts: This takes you to your list of saved workout plans, which you can start or edit at any time."
    },
    {
        title: "Getting Started",
        content: "To get started:\n1. Explore the existing exercises on the Exercises page.\n2. Try creating your first workout using one of the quick-start categories or the custom workout builder.\n3. Save your favorite workouts as plans in the Create Plans section.\n4. Log your progress and watch your fitness journey unfold!\n\nEnjoy your workout!"
    }
];

const HelpPopup = ({ isOpen, onClose }: HelpPopupProps) => {
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

export default HelpPopup;
