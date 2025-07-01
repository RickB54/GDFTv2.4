
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WorkoutsHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkoutsHelpPopup: React.FC<WorkoutsHelpPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Workouts Page Help</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>This page is your main hub for starting a workout.</p>
          <section>
            <h3 className="font-semibold">Workout Types</h3>
            <p>Choose from predefined workout categories like 'Weights', 'Cardio', etc. to see relevant exercises.</p>
          </section>
          <section>
            <h3 className="font-semibold">+ New Workout</h3>
            <p>Click this to create a custom workout from scratch, choosing any exercises you like.</p>
          </section>
          <section>
            <h3 className="font-semibold">Favorites</h3>
            <p>Quickly access your most-used exercises.</p>
          </section>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Got it!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutsHelpPopup;
