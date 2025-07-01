import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StatsHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string; // Added description prop
}

const helpPages = [
    {
        title: "How to Use the Stats Page",
        content: "This guide explains how to view and analyze your workout statistics. Use the arrows to navigate."
    },
    {
        title: "1. Summary Cards",
        content: "The cards at the top give you a quick overview of your key metrics:\n\n- Total Workouts: The total number of workouts you've completed.\n- Total Time: The combined duration of all your workouts.\n- Total Sets: The total number of sets across all workouts.\n- Total Reps: The total number of repetitions completed."
    },
    {
        title: "2. Workout History",
        content: "This section lists all your completed workouts, sorted by date. You can filter them using the date range picker.\n\n- Expand/Collapse: Click on a workout to see detailed stats for each exercise."
    },
    {
        title: "3. Workout Actions",
        content: "Each workout in the history has several actions available:\n\n- Re-run Workout (Play icon): Instantly start the same workout again.\n- View Graph (Bar chart icon): See a visual breakdown of the workout.\n- Edit Notes (Pencil icon): Add or modify notes for the workout.\n- Delete (Trash icon): Permanently remove the workout from your history."
    },
    {
        title: "4. History Management",
        content: "Use the buttons above the history list to manage your view:\n\n- Clean Up: Collapse all workouts older than one week.\n- Expand/Collapse All: Quickly show or hide details for all workouts in the current view."
    }
];

const StatsHelpPopup = ({ isOpen, onClose, title, description }: StatsHelpPopupProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const page = helpPages[currentPage];

  // If a description is provided directly, use it as the only page
  // Otherwise, use the default helpPages
  const pagesToDisplay = description ? [{ title: title || "Help", content: description }] : helpPages;
  const currentDisplayPage = pagesToDisplay[currentPage];

  const handleNext = () => {
    if (currentPage < pagesToDisplay.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">{currentDisplayPage.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-sm text-gray-300 whitespace-pre-wrap">
          {currentDisplayPage.content}
        </div>
        <DialogFooter className="flex justify-between items-center">
          {pagesToDisplay.length > 1 && (
            <div className="text-xs text-gray-400">
              Page {currentPage + 1} of {pagesToDisplay.length}
            </div>
          )}
          <div className="flex gap-2">
            {pagesToDisplay.length > 1 && currentPage > 0 && (
              <Button variant="outline" onClick={handlePrev} className="text-white border-gray-600 hover:bg-gray-700">
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
            )}
            {pagesToDisplay.length > 1 && currentPage < pagesToDisplay.length - 1 && (
              <Button variant="outline" onClick={handleNext} className="text-white border-gray-600 hover:bg-gray-700">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {pagesToDisplay.length === 1 && (
                 <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
                    Close
                 </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatsHelpPopup;
