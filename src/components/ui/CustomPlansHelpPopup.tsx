
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CustomPlansHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpPages = [
    {
        title: "How to Use the Day Planner",
        content: "The Day Planner helps you create custom workout plans by adding days and exercises. You can filter exercises by category and equipment, search for specific exercises, select them from the dropdown, and specify sets, reps, and weight.\n\nThis guide explains all the features in detail. Use the arrows to navigate."
    },
    {
        title: "1. Create a Plan",
        content: 'Start by giving your plan a name at the top of the page (e.g., "Upper Body Split" or "5-Day Workout Plan").'
    },
    {
        title: "2. Filter Exercises",
        content: "Use the Filter Exercises section to narrow down exercises by category (Weights, Cardio, etc.), equipment, and muscle group."
    },
    {
        title: "3. Add Exercises to Days",
        content: 'Each plan starts with "Day 1" - you can rename this (e.g., "Chest Day" or "Monday").\n\n- Click "Add Exercise" to add an exercise slot to the day.\n- Select an exercise from the dropdown menu.\n- Add the Sets, Reps, and Weight for each exercise.\n- Use the red X button to remove an exercise.'
    },
    {
        title: "4. Add Workouts to Days",
        content: "You can also add entire saved workout templates to a day. Click 'Add Workout' and select from your list of saved workouts. All exercises from that template will be added to the day's plan."
    },
    {
        title: "5. Add Multiple Days",
        content: 'Click "Add Day" at the bottom to create additional days for your plan (e.g., Day 2, Day 3). You can expand/collapse days using the arrow button.'
    },
    {
        title: "6. Save Your Plan",
        content: 'When you\'re finished, click "Save Plan" at the top. Your plan will be saved for future use. If you\'re editing an existing plan, this button will say "Update Plan".'
    },
    {
        title: "7. Manage Your Plans",
        content: "Click 'Show Current Plans' to view, edit, or delete your saved plans. From this view, you can also directly start a workout based on a specific day of a plan."
    }
];

const CustomPlansHelpPopup = ({ isOpen, onClose }: CustomPlansHelpPopupProps) => {
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

export default CustomPlansHelpPopup;
