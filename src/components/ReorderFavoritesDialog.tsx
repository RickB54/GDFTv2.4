import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { Exercise } from "@/lib/data";
import { useExercise } from "@/contexts/ExerciseContext";
import { useWorkout } from "@/contexts/WorkoutContext";
import { toast } from "sonner";

interface SortableExerciseItemProps {
  exercise: Exercise;
}

function SortableExerciseItem({ exercise }: SortableExerciseItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center p-2 bg-gym-card rounded-md mb-2"
    >
      <button {...listeners} className="cursor-grab p-2 mr-2">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <span>{exercise.name}</span>
    </div>
  );
}


interface ReorderFavoritesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReorderFavoritesDialog({ open, onOpenChange }: ReorderFavoritesDialogProps) {
  const navigate = useNavigate();
  const { exercises, favoriteExercises, reorderFavorites } = useExercise();
  const { startWorkout } = useWorkout();
  const [orderedFavorites, setOrderedFavorites] = useState<Exercise[]>([]);

  useEffect(() => {
    if (open) {
      const favoriteExDetails = favoriteExercises
        .map(id => exercises.find(ex => ex.id === id))
        .filter((ex): ex is Exercise => !!ex);
      setOrderedFavorites(favoriteExDetails);
    }
  }, [open, favoriteExercises, exercises]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setOrderedFavorites((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
  
  const handleSave = () => {
    const reorderedIds = orderedFavorites.map(ex => ex.id);
    reorderFavorites(reorderedIds);
    toast.success("Favorite order saved!");
    onOpenChange(false);
  };

  const handleStartWorkout = () => {
    if (orderedFavorites.length === 0) {
      toast.error("No favorite exercises to start a workout.");
      return;
    }
    const exerciseIds = orderedFavorites.map(ex => ex.id);
    reorderFavorites(exerciseIds); // Save the new order
    startWorkout("Favorites", exerciseIds);
    onOpenChange(false);
    navigate("/workout");
  };

  const handleCreateTemplate = () => {
    if (orderedFavorites.length === 0) {
      toast.error("No favorite exercises to create a template.");
      return;
    }
    const reorderedIds = orderedFavorites.map(ex => ex.id);
    reorderFavorites(reorderedIds); // Save the new order
    const exerciseIds = reorderedIds.join(',');
    onOpenChange(false);
    navigate(`/create-workout?type=Custom&exercises=${exerciseIds}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reorder Favorites</DialogTitle>
          <DialogDescription>
            Drag and drop to reorder your favorite exercises. This order will be used when you start a "Favorites" workout.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedFavorites.map(ex => ex.id)} strategy={verticalListSortingStrategy}>
              {orderedFavorites.map(exercise => (
                <SortableExerciseItem key={exercise.id} exercise={exercise} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-2 gap-2">
            <div className="flex gap-2">
                 <Button onClick={handleStartWorkout} variant="outline">Start Workout</Button>
                 <Button onClick={handleCreateTemplate} variant="outline">Create Template</Button>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => onOpenChange(false)} variant="secondary">Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
