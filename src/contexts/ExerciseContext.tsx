import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Exercise, getExercises, saveExercises, generateId, parseCSVData as csvToExercises, exercisesToCSV, slideboardExercises, cardioExercises, weightExercises, noEquipmentExercises } from "@/lib/data"; // Changed csvToExercises to parseCSVData and aliased it
import { toast } from "sonner";

const FAVORITES_STORAGE_KEY = "favoriteExercises";

interface ExerciseContextType {
  exercises: Exercise[];
  addExercise: (exercise: Omit<Exercise, "id">) => Exercise;
  updateExercise: (id: string, exercise: Partial<Exercise>) => void;
  deleteExercise: (id: string) => Promise<boolean>;
  deleteAllExercises: () => Promise<boolean>;
  getExerciseById: (id: string) => Exercise | undefined;
  filterExercises: (equipment?: string, category?: string, muscleGroup?: string, searchQuery?: string) => Exercise[];
  uploadExerciseImage: (file: File) => Promise<string>;
  importFromCSV: (csvString: string) => void;
  exportToCSV: () => string;
  reinstallAllExercises: () => void;
  favoriteExercises: string[];
  toggleFavorite: (exerciseId: string) => void;
  reorderFavorites: (reorderedIds: string[]) => void;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export const ExerciseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [favoriteExercises, setFavoriteExercises] = useState<string[]>([]);

  // Load exercises and favorites from localStorage on component mount
  useEffect(() => {
    try {
      const loadedExercises = getExercises();
      const validExercises = loadedExercises.filter(ex => 
        typeof ex.id === 'string' && 
        typeof ex.name === 'string' && 
        typeof ex.category === 'string'
      );
      
      setExercises(validExercises);
      saveExercises(validExercises);
      
      console.log(`Loaded ${validExercises.length} exercises`);
      
      const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (savedFavorites) {
        setFavoriteExercises(JSON.parse(savedFavorites));
      }
      
    } catch (error) {
      console.error("Failed to load exercises or favorites:", error);
      setExercises([]);
      setFavoriteExercises([]);
    }
  }, []);

  const saveFavorites = (favorites: string[]) => {
    setFavoriteExercises(favorites);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  };
  
  const toggleFavorite = useCallback((exerciseId: string) => {
    setFavoriteExercises(prev => {
      const isFavorite = prev.includes(exerciseId);
      let newFavorites;
      if (isFavorite) {
        newFavorites = prev.filter(id => id !== exerciseId);
        toast.info("Removed from favorites");
      } else {
        newFavorites = [...prev, exerciseId];
        toast.success("Added to favorites");
      }
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const reorderFavorites = useCallback((reorderedIds: string[]) => {
    saveFavorites(reorderedIds);
    toast.success("Favorites reordered");
  }, []);

  const addExercise = (exercise: Omit<Exercise, "id">) => {
    const newExercise = { ...exercise, id: generateId() };
    
    setExercises((prev) => {
      const updated = [...prev, newExercise as Exercise];
      saveExercises(updated);
      return updated;
    });
    console.log("Exercise added successfully:", newExercise);
    toast.success("Exercise added successfully");
    return newExercise as Exercise;
  };

  const updateExercise = (id: string, exerciseUpdates: Partial<Exercise>) => {
    console.log("Updating exercise with ID:", id, "with updates:", exerciseUpdates);
    
    setExercises((prev) => {
      // Find the existing exercise first
      const existingExercise = prev.find(ex => ex.id === id);
      
      if (!existingExercise) {
        console.error("Cannot update - exercise not found with ID:", id);
        return prev;
      }
      
      // Create the updated exercise object
      // This ensures we preserve the existing picture/thumbnail URLs if they're not being updated
      const updatedExercise = { 
        ...existingExercise,
        ...exerciseUpdates
      };
      
      // Only if explicitly provided as empty in the updates, clear the URLs
      if (exerciseUpdates.hasOwnProperty('thumbnailUrl') && exerciseUpdates.thumbnailUrl === '') {
        updatedExercise.thumbnailUrl = '';
      }
      
      if (exerciseUpdates.hasOwnProperty('pictureUrl') && exerciseUpdates.pictureUrl === '') {
        updatedExercise.pictureUrl = '';
      }
      
      console.log("Original exercise:", existingExercise);
      console.log("Updated exercise:", updatedExercise);
      
      const updated = prev.map((ex) => ex.id === id ? updatedExercise : ex);
      saveExercises(updated);
      return updated;
    });
    
    console.log("Exercise updated successfully with ID:", id);
    toast.success("Exercise updated successfully");
  };

  const deleteExercise = async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.confirm("Are you sure you want to delete this exercise? This cannot be undone.")) {
        setExercises((prev) => {
          const updated = prev.filter((ex) => ex.id !== id);
          saveExercises(updated);
          return updated;
        });
        toast.success("Exercise deleted successfully");
        resolve(true);
      } else {
        resolve(false);
      }
    });
  };

  const deleteAllExercises = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.confirm("Are you sure you want to delete ALL exercises? This action cannot be undone.")) {
        setExercises([]);
        saveExercises([]);
        // Clear favorites as well
        setFavoriteExercises([]);
        localStorage.removeItem(FAVORITES_STORAGE_KEY);
        toast.success("All exercises deleted successfully");
        resolve(true);
      } else {
        resolve(false);
      }
    });
  };

  const reinstallAllExercises = () => {
    // Combine ALL default exercises from ALL categories - ensure we get all of them
    const defaultExercises = [...slideboardExercises, ...cardioExercises, ...weightExercises, ...noEquipmentExercises];
    
    console.log(`Loading all exercises: Total count: ${defaultExercises.length}`);
    console.log(`Slide Board: ${slideboardExercises.length}, Cardio: ${cardioExercises.length}, Weights: ${weightExercises.length}, No Equipment: ${noEquipmentExercises.length}`);
    
    // Replace existing exercises entirely
    setExercises(defaultExercises);
    saveExercises(defaultExercises);
    
    // Clear favorites since we're reinstalling fresh exercises
    setFavoriteExercises([]);
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    
    toast.success(`Successfully reinstalled ${defaultExercises.length} exercises`);
  };

  const getExerciseById = useCallback((id: string) => {
    return exercises.find((ex) => ex.id === id);
  }, [exercises]);

  const filterExercises = (equipment?: string, category?: string, muscleGroup?: string, searchQuery?: string) => {
    return exercises.filter((ex) => {
      // Special handling for Favorites category
      if (category === "Favorites" && !favoriteExercises.includes(ex.id)) {
        return false;
      }

      const equipmentMatch = !equipment || equipment === "All" || 
        (ex.equipment && ex.equipment === equipment);
      
      // If filtering by favorites, we don't need to match other categories.
      // Otherwise, match against the exercise's category.
      const categoryMatch = !category || category === "All" || category === "Favorites" || ex.category === category;
      
      const muscleGroupMatch = !muscleGroup || muscleGroup === "All" || 
        (ex.muscleGroups && Array.isArray(ex.muscleGroups) && ex.muscleGroups.includes(muscleGroup as any));
      const searchMatch = !searchQuery || ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return equipmentMatch && categoryMatch && muscleGroupMatch && searchMatch;
    });
  };

  const uploadExerciseImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            console.log("File uploaded successfully");
            resolve(event.target.result);
          } else {
            reject(new Error('Failed to read image file'));
          }
        };
        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };
  
  const importFromCSV = (csvString: string) => {
    try {
      const importedExercises = csvToExercises(csvString);
      
      if (importedExercises.length === 0) {
        toast.error("No valid exercises found in the CSV file");
        return;
      }
      
      setExercises((prev) => {
        const updated = [...prev, ...importedExercises];
        saveExercises(updated);
        return updated;
      });
      
      console.log(`Successfully imported ${importedExercises.length} exercises`);
      toast.success(`Successfully imported ${importedExercises.length} exercises`);
    } catch (error) {
      console.error("Error importing exercises from CSV:", error);
      toast.error("Failed to import exercises from CSV");
    }
  };
  
  const exportToCSV = () => {
    return exercisesToCSV(exercises);
  };

  return (
    <ExerciseContext.Provider
      value={{
        exercises,
        addExercise,
        updateExercise,
        deleteExercise,
        deleteAllExercises,
        getExerciseById,
        filterExercises,
        uploadExerciseImage,
        importFromCSV,
        exportToCSV,
        reinstallAllExercises,
        favoriteExercises,
        toggleFavorite,
        reorderFavorites,
      }}
    >
      {children}
    </ExerciseContext.Provider>
  );
};

export const useExercise = () => {
  const context = useContext(ExerciseContext);
  if (context === undefined) {
    throw new Error("useExercise must be used within an ExerciseProvider");
  }
  return context;
};
