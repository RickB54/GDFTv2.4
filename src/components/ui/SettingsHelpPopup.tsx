import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface SettingsHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpPages = [
    {
        title: "How to Use the Settings Page",
        content: "This guide explains the different settings available to manage your app data. Use the arrows to navigate."
    },
    {
        title: "1. Backup & Restore Section",
        content: "This section helps you manage all of your app data.\n\n- Backup All Data: Save all your data (exercises, workouts, plans, etc.) to a single JSON file. \n\n- Restore All Data: Load data from a backup file. This will overwrite all current data. \n\n- Delete All Data: Permanently deletes everything in the app. This cannot be undone."
    },
    {
        title: "2. Exercises Data Section",
        content: "This section is for managing your exercise library.\n\n- Export/Import: Save or load your exercise list as a CSV file for bulk editing or sharing. \n\n- Reinstall All Exercises: Restore the app's default exercises if you've deleted them. \n\n- Delete All Exercises: Permanently delete only the exercises from the app."
    },
    {
        title: "3. About Section",
        content: "This section displays the version of the app."
    }
];

const SettingsHelpPopup = ({ isOpen, onClose }: SettingsHelpPopupProps) => {
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

export default SettingsHelpPopup;
