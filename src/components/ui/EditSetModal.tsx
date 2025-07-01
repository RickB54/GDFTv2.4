
import React, { useState } from "react";
import { X, Trash } from "lucide-react";
import { WorkoutSet } from "@/lib/data";
import { formatNumber } from "@/lib/formatters";

interface EditSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  set: WorkoutSet;
  onSave: (updatedSet: WorkoutSet) => void;
  onDelete: () => void;
  onAddSet?: () => void;
}

const EditSetModal = ({ isOpen, onClose, set, onSave, onDelete, onAddSet }: EditSetModalProps) => {
  const [updatedSet, setUpdatedSet] = useState<WorkoutSet>({...set});
  
  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setUpdatedSet(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : newValue
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(updatedSet);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-gym-dark border border-border rounded-lg w-11/12 max-w-md mx-auto p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Edit Set</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {set.weight !== undefined && (
            <div>
              <label className="block text-sm mb-1">Weight:</label>
              <input
                type="number"
                name="weight"
                value={updatedSet.weight !== undefined ? updatedSet.weight : 0}
                onChange={handleChange}
                className="w-full bg-gym-darker border border-gray-700 rounded-md p-2"
                step="0.1"
              />
            </div>
          )}
          
          {set.reps !== undefined && (
            <div>
              <label className="block text-sm mb-1">Reps:</label>
              <input
                type="number"
                name="reps"
                value={updatedSet.reps !== undefined ? updatedSet.reps : 0}
                onChange={handleChange}
                className="w-full bg-gym-darker border border-gray-700 rounded-md p-2"
              />
            </div>
          )}
          
          {set.time !== undefined && (
            <div>
              <label className="block text-sm mb-1">Time (minutes):</label>
              <input
                type="number"
                name="time"
                value={updatedSet.time !== undefined ? updatedSet.time : 0}
                onChange={handleChange}
                className="w-full bg-gym-darker border border-gray-700 rounded-md p-2"
                step="0.1"
              />
            </div>
          )}
          
          {set.distance !== undefined && (
            <div>
              <label className="block text-sm mb-1">Distance:</label>
              <input
                type="number"
                name="distance"
                value={updatedSet.distance !== undefined ? updatedSet.distance : 0}
                onChange={handleChange}
                className="w-full bg-gym-darker border border-gray-700 rounded-md p-2"
                step="0.1"
              />
            </div>
          )}
          
          {set.incline !== undefined && (
            <div>
              <label className="block text-sm mb-1">Incline:</label>
              <input
                type="number"
                name="incline"
                value={updatedSet.incline !== undefined ? updatedSet.incline : 0}
                onChange={handleChange}
                className="w-full bg-gym-darker border border-gray-700 rounded-md p-2"
              />
            </div>
          )}
          
          {set.duration !== undefined && (
            <div>
              <label className="block text-sm mb-1">Duration (seconds):</label>
              <input
                type="number"
                name="duration"
                value={updatedSet.duration !== undefined ? updatedSet.duration : 0}
                onChange={handleChange}
                className="w-full bg-gym-darker border border-gray-700 rounded-md p-2"
              />
            </div>
          )}
          
          <div className="flex space-x-2 items-center">
            <input
              type="checkbox"
              name="completed"
              checked={updatedSet.completed}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label>Completed</label>
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center bg-destructive text-white px-3 py-2 rounded"
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </button>
            
            <div className="space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-600 text-white px-3 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-white px-3 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
          
          {onAddSet && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onAddSet();
                  onClose();
                }}
                className="w-full bg-gym-dark hover:bg-gym-card-hover text-white py-3 rounded-lg flex items-center justify-center transition-colors"
              >
                Add Set
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditSetModal;
