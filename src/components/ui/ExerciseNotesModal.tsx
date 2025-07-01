
import React from "react";
import { X } from "lucide-react";

interface ExerciseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
}

const ExerciseNotesModal = ({ isOpen, onClose, notes }: ExerciseNotesModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-gym-dark border border-border rounded-lg w-11/12 max-w-md mx-auto p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Exercise Notes</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {notes ? (
            <p className="text-gray-300 whitespace-pre-wrap">{notes}</p>
          ) : (
            <p className="text-gray-400 italic">No notes available for this exercise.</p>
          )}
        </div>
        
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseNotesModal;
