
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CalendarHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpPages = [
    {
        title: "How to Use the Calendar",
        content: "This guide explains the features of your workout calendar. Use the arrows to navigate."
    },
    {
        title: "Views: Week, Month, Year",
        content: "You can switch between three views:\n\n- Week View: See a detailed horizontal layout of your scheduled workouts for the current week.\n\n- Month View: Get a monthly overview. Days with workouts have colored dots.\n\n- Year View: A high-level view of the entire year, with indicators for workout days."
    },
    {
        title: "Navigating Time",
        content: "Use the < and > arrow buttons to move to the previous or next week/month/year. The 'Today' button will bring you back to the current date."
    },
    {
        title: "Scheduling a Workout",
        content: "In the Month view, click on any empty day to open the scheduling dialog. You can also use the 'Schedule A Workout For Today' button.\n\nFrom the dialog, you can schedule different types of workouts, including from your saved templates, plans, or workout history."
    },
    {
        title: "Managing Daily Workouts",
        content: "In the Month view, clicking on a day that already has workouts will open a detailed view.\n\nHere you can see all scheduled and completed workouts. You can perform, delete, or schedule another workout for that day. Editing scheduled workouts is coming soon!"
    },
    {
        title: "Performing a Workout",
        content: "In the Week view and the Day Detail view, you will see a 'Perform Workout' play icon next to each scheduled workout. Click it to start your session immediately.\n\nYou can also re-start completed workouts from the week view."
    },
    {
        title: "Understanding The Dots",
        content: "In the Month and Year views, colored dots on each day indicate workout status:\n\n- Blue: A workout is scheduled for this day.\n- Green: A workout has been completed.\n- Red: A scheduled workout was missed.\n\nIf multiple workouts are on one day, you'll see multiple dots."
    }
];

const CalendarHelpPopup = ({ isOpen, onClose }: CalendarHelpPopupProps) => {
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

export default CalendarHelpPopup;
