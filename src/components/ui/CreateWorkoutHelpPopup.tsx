
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CreateWorkoutHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateWorkoutHelpPopup: React.FC<CreateWorkoutHelpPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workout Help</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>Use this page to build a new workout session.</p>
          <section>
            <h3 className="font-semibold">Selecting Exercises</h3>
            <p>Tap on any exercise from the list to add it to your workout. Tap again to remove it.</p>
          </section>
          <section>
            <h3 className="font-semibold">Filters</h3>
            <p>Use the filter icon to narrow down the exercise list by equipment, category, or muscle group.</p>
          </section>
          <section>
            <h3 className="font-semibold">Saved Workouts</h3>
            <p>For custom workouts, you can view and start previously saved workout templates.</p>
          </section>
           <section>
            <h3 className="font-semibold">Save Workout</h3>
            <p>Once you've selected your exercises, you can save the combination as a template for future use.</p>
          </section>
          <section>
            <h3 className="font-semibold">Start Workout</h3>
            <p>When you're ready, hit "Start Workout" to begin your session.</p>
          </section>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Got it!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkoutHelpPopup;
