
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface BodyMetricsHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpPages = [
    {
        title: "How to Track Body Metrics",
        content: "This guide explains how to use the Body Metrics page to track your physical progress over time. Use the arrows to navigate."
    },
    {
        title: "1. Add a New Measurement",
        content: 'Click the "Add Measurement" button to open the form. Here you can enter your weight, body fat percentage, and various body measurements like chest, waist, arms, and thighs.'
    },
    {
        title: "2. Fill in Your Data",
        content: "Enter the values for the date of the measurement and any metrics you want to track. You don't have to fill in every field, just the ones you want to monitor."
    },
    {
        title: "3. Save and View History",
        content: "Click 'Save Measurement' to add the entry to your history. All your saved measurements will be displayed as cards, sorted by date."
    },
    {
        title: "4. Why Track Metrics?",
        content: "Tracking body metrics provides concrete evidence of your progress, which can be highly motivating. It helps you see how your body is changing in response to your training and diet, beyond just what the scale says."
    }
];

const BodyMetricsHelpPopup = ({ isOpen, onClose }: BodyMetricsHelpPopupProps) => {
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

export default BodyMetricsHelpPopup;
