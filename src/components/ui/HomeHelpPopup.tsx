
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface HomeHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpPages = [
    {
        title: "Welcome to GymDayFitTracker!",
        content: "This guide explains the main features accessible from the Home screen. Use the arrows to navigate."
    },
    {
        title: "1. Main Actions",
        content: "- Monitor Progress: View your workout statistics and body measurements.\n\n- Create Plans: Design multi-day workout routines.\n\n- Your Custom Plans: Access and manage the plans you've created."
    },
    {
        title: "2. Health & Body Tracking",
        content: "- Body Metrics: Track detailed body measurements and calculate your BMI.\n\n- Health Metrics: Log general health data like sleep, stress, and hydration."
    },
    {
        title: "3. Starting a Workout",
        content: "You can quickly start a workout in several ways:\n\n- Select a Workout Type: Choose from Standard Weights, Slide Board, Cardio, or No Equipment to see a list of relevant exercises.\n\n- Create a Custom Workout: Build a one-off workout session from scratch.\n\n- Show Custom Workouts: View and start workouts from your saved templates."
    },
    {
        title: "4. Navigation",
        content: "Use the bottom navigation bar to access other key areas of the app:\n\n- Home (this screen)\n- Calendar: Schedule and view your workouts.\n- Exercises: Browse and manage your exercise library.\n- Stats: See detailed progress charts.\n- Settings: Manage app data and preferences."
    }
];

const HomeHelpPopup = ({ isOpen, onClose }: HomeHelpPopupProps) => {
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

export default HomeHelpPopup;
