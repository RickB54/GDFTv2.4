import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import {
  Workout,
  WorkoutSet,
  getWorkouts,
  saveWorkouts,
  generateId,
  getSavedWorkoutTemplates,
  saveSavedWorkoutTemplates,
  SavedWorkoutTemplate,
  WorkoutPlanOverride
} from "@/lib/data";
import { ExerciseCategory } from "@/lib/exerciseTypes";
import { toast } from "sonner";
import { calculateCalories, formatCalories } from "@/lib/formatters";

interface WorkoutProviderProps {
  children: ReactNode;
}

export interface HealthMetric {
  id: string;
  workoutId?: string;
  date: string;
  sleepDurationHours?: number;
  sleepQualityRating?: number;
  waterIntakeMl?: number;
  stressLevelRating?: number;
  stepsTaken?: number;
  heartRate?: number;
  caloriesBurned?: number;
  calorieIntake?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  glucose?: number;
  notes?: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  height?: number;
  neck?: number;
  shoulders?: number;
  chest?: number;
  lats?: number;
  upperBack?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  triceps?: number;
  forearms?: number;
  thighs?: number;
  calves?: number;
}

export interface PlanExercise {
  id: string;
  exerciseId: string;
  name: string;
  category?: string;
  // Weights
  sets?: string;
  reps?: string;
  weight?: string;
  // Cardio
  distance?: string;
  time?: string;
  incline?: string;
}

export interface PlanDay {
  id: string;
  name: string;
  exercises: PlanExercise[];
}

export interface CustomPlan {
  id: string;
  name: string;
  days: PlanDay[];
  createdAt: number;
}

interface WorkoutContextType {
  workouts: Workout[];
  currentWorkout: Workout | null;
  savedWorkoutTemplates: SavedWorkoutTemplate[];
  customPlans: CustomPlan[];
  bodyMeasurements: BodyMeasurement[];
  healthMetrics: HealthMetric[];
  startWorkout: (type: string, exerciseIds: string[], planOverrides?: WorkoutPlanOverride[]) => void;
  startSavedWorkout: (templateId: string) => void;
  endWorkout: () => void;
  cancelWorkout: () => void;
  addSet: (exerciseId: string, previousSet?: WorkoutSet | null, exerciseSettings?: any) => string | null | undefined;
  completeSet: (setId: string) => void;
  skipSet: (setId: string) => void;
  updateSet: (setId: string, updates: Partial<WorkoutSet>) => void;
  updateWorkout: (updatedWorkout: any) => void;
  updateCurrentWorkoutNotes: (notes: string) => void;
  getWorkoutStats: () => {
    totalWorkouts: number;
    totalTime: number;
    totalSets: number;
    totalReps: number;
  };
  navigateToExercise: (exerciseId: string) => void;
  currentExerciseIndex: number;
  navigateToNextExercise: () => void;
  navigateToPreviousExercise: () => void;
  saveCustomWorkout: (name: string) => void;
  saveWorkoutTemplate: (name: string, exerciseIds: string[], type: ExerciseCategory | "Custom") => void;
  deleteSavedWorkout: (templateId: string) => void;
  deleteWorkout: (workoutId: string) => void;
  addBodyMeasurement: (measurement: Omit<BodyMeasurement, "id">) => void;
  updateBodyMeasurement: (id: string, updates: Partial<BodyMeasurement>) => void;
  deleteBodyMeasurement: (id: string) => void;
  getBodyMeasurements: () => BodyMeasurement[];
  addHealthMetric: (metric: Omit<HealthMetric, "id">) => void;
  updateHealthMetric: (id: string, updates: Partial<HealthMetric>) => void;
  deleteHealthMetric: (id: string) => void;
  getHealthMetrics: () => HealthMetric[];
  saveCustomPlan: (plan: Omit<CustomPlan, "id" | "createdAt">) => void;
  updateCustomPlan: (planId: string, updates: Partial<CustomPlan>) => void;
  deleteCustomPlan: (planId: string) => void;
  getCustomPlans: () => CustomPlan[];
  deleteStatsData: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [showFinishWorkoutConfirmation, setShowFinishWorkoutConfirmation] = useState(false);
  const [showStartWorkoutConfirmation, setShowStartWorkoutConfirmation] = useState(false);
  const [pendingWorkout, setPendingWorkout] = useState<SavedWorkoutTemplate | null>(null);
  const currentWorkoutRef = useRef(currentWorkout);

  useEffect(() => {
    currentWorkoutRef.current = currentWorkout;
  }, [currentWorkout]);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [savedWorkoutTemplates, setSavedWorkoutTemplates] = useState<SavedWorkoutTemplate[]>([]);
  const [workoutPlanOverrides, setWorkoutPlanOverrides] = useState<WorkoutPlanOverride[] | null>(null);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>(() => {
    const saved = localStorage.getItem('bodyMeasurements');
    return saved ? JSON.parse(saved) : [];
  });
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>(() => {
    const saved = localStorage.getItem('healthMetrics');
    return saved ? JSON.parse(saved) : [];
  });
  const [customPlans, setCustomPlans] = useState<CustomPlan[]>(() => {
    const saved = localStorage.getItem('customPlans');
    return saved ? JSON.parse(saved) : [];
  });

  // Function to update notes for the current workout
  const updateCurrentWorkoutNotes = (notes: string) => {
    if (currentWorkout) {
      setCurrentWorkout(prevWorkout => {
        if (!prevWorkout) return null;
        const updatedWorkout = { ...prevWorkout, notes };
        // Also update localStorage for persistence during the workout
        localStorage.setItem('currentWorkout', JSON.stringify(updatedWorkout));
        return updatedWorkout;
      });
    }
  };

  useEffect(() => {
    const loadedWorkouts = getWorkouts();
    setWorkouts(loadedWorkouts);
    
    const loadedTemplates = getSavedWorkoutTemplates();
    setSavedWorkoutTemplates(loadedTemplates);
  }, []);

  useEffect(() => {
    localStorage.setItem('bodyMeasurements', JSON.stringify(bodyMeasurements));
  }, [bodyMeasurements]);

  useEffect(() => {
    localStorage.setItem('healthMetrics', JSON.stringify(healthMetrics));
  }, [healthMetrics]);

  useEffect(() => {
    localStorage.setItem('customPlans', JSON.stringify(customPlans));
  }, [customPlans]);

  const startWorkout = useCallback((type: string, exerciseIds: string[], planOverrides?: WorkoutPlanOverride[], workoutName?: string) => {
    if (currentWorkoutRef.current) {
      const confirmation = window.confirm("An active workout is in progress. Are you sure you want to start a new one? This will end the current workout.");
      if (!confirmation) {
        return;
      }
    }

    const validExerciseIds = exerciseIds.filter(id => id && id.trim() !== '');
    if (validExerciseIds.length === 0) {
      toast.error("No valid exercises to start a workout.");
      return;
    }

    const newWorkout: Workout = {
      id: generateId(),
      name: workoutName || (type === "Custom" ? "Custom Workout" : `${type} Workout`),
      exercises: validExerciseIds,
      sets: [],
      startTime: Date.now(),
      type: type as ExerciseCategory | "Custom",
      workoutPlanOverrides: planOverrides,
    };

    setCurrentWorkout(newWorkout);
    setWorkoutPlanOverrides(planOverrides || null);
    setCurrentExerciseIndex(0);
    toast.success(`Started ${newWorkout.name}`);
  }, []);

  const startSavedWorkout = (templateId: string) => {
    const template = savedWorkoutTemplates.find(t => t.id === templateId);
    if (template) {
      console.log("Starting saved workout template:", template);
      const validExercises = template.exercises.filter(id => id && id.trim() !== '');
      
      if (validExercises.length === 0) {
        toast.error("This saved workout has no valid exercises");
        return;
      }
      
      startWorkout(template.type, validExercises, template.workoutPlanOverrides, template.name);
    } else {
      toast.error("Saved workout not found");
    }
  };

  const endWorkout = useCallback(() => {
    if (currentWorkoutRef.current) {
      const endedWorkout = {
        ...currentWorkoutRef.current,
        endTime: Date.now(),
        totalTime: Math.floor((Date.now() - (currentWorkoutRef.current.startTime || 0)) / 1000),
      };

      setWorkouts((prev) => {
        const updated = [endedWorkout, ...prev];
        saveWorkouts(updated);
        return updated;
      });

      setCurrentWorkout(null);
      setWorkoutPlanOverrides(null);
      toast.success("Workout completed");
    }
  }, []);

  const cancelWorkout = useCallback(() => {
    if (currentWorkoutRef.current) {
      setCurrentWorkout(null);
      setWorkoutPlanOverrides(null);
      toast.info("Workout cancelled");
    }
  }, []);

  const addSet = useCallback((exerciseId: string, previousSet: WorkoutSet | null = null, exerciseSettings: any = null): string | null | undefined => {
    let newSetId: string | null = null;
    setCurrentWorkout((prev) => {
      if (!prev) {
        console.error("Cannot add set: No current workout");
        return null;
      }

      const newSet: WorkoutSet = {
        id: generateId(),
        exerciseId,
        completed: false,
        timestamp: Date.now(),
      };
      newSetId = newSet.id;

      const planOverride = workoutPlanOverrides?.find(p => p.exerciseId === exerciseId);

      // Priority order: previousSet values > plan overrides > exerciseSettings > defaults
      if (previousSet) {
        // Use previous set values (user has already made changes in this session)
        if (previousSet.weight !== undefined) newSet.weight = previousSet.weight;
        if (previousSet.reps !== undefined) newSet.reps = previousSet.reps;
        if (previousSet.time !== undefined) newSet.time = previousSet.time;
        if (previousSet.distance !== undefined) newSet.distance = previousSet.distance;
        if (previousSet.incline !== undefined) newSet.incline = previousSet.incline;
        if (previousSet.duration !== undefined) newSet.duration = previousSet.duration;
      } else if (planOverride) {
        // Use plan override values from Custom Plan
        if (planOverride.weight) newSet.weight = Number(planOverride.weight);
        if (planOverride.reps) newSet.reps = Number(planOverride.reps);
        if (planOverride.time) newSet.time = Number(planOverride.time);
        if (planOverride.distance) newSet.distance = Number(planOverride.distance);
        if (planOverride.incline) newSet.incline = Number(planOverride.incline);
      } else if (exerciseSettings) {
        // Use exercise settings for first set
        if (exerciseSettings.weight !== undefined) newSet.weight = exerciseSettings.weight;
        if (exerciseSettings.reps !== undefined) newSet.reps = exerciseSettings.reps;
        if (exerciseSettings.time !== undefined) newSet.time = exerciseSettings.time;
        if (exerciseSettings.distance !== undefined) newSet.distance = exerciseSettings.distance;
        if (exerciseSettings.incline !== undefined) newSet.incline = exerciseSettings.incline;
        if (exerciseSettings.duration !== undefined) newSet.duration = exerciseSettings.duration;
      }

      const updatedWorkout = {
        ...prev,
        sets: [...prev.sets, newSet],
      };

      console.log("Added new set:", newSet);
      console.log("Updated workout sets:", updatedWorkout.sets);
      return updatedWorkout;
    });

    return newSetId;
  }, [workoutPlanOverrides]);

  const completeSet = useCallback((setId: string) => {
    if (currentWorkoutRef.current) {
      setCurrentWorkout((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sets: prev.sets.map((set) =>
            set.id === setId ? { ...set, completed: true } : set
          ),
        };
      });
      toast.success("Set completed!");
    }
  }, []);

  const skipSet = useCallback((setId: string) => {
    if (currentWorkoutRef.current) {
      setCurrentWorkout((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sets: prev.sets.filter((set) => set.id !== setId),
        };
      });
      toast.info("Set skipped");
    }
  }, []);

  const updateSet = useCallback((setId: string, updates: Partial<WorkoutSet>) => {
    if (currentWorkoutRef.current) {
      setCurrentWorkout((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sets: prev.sets.map((set) =>
            set.id === setId ? { ...set, ...updates } : set
          ),
        };
      });
    }
  }, []);

  const updateWorkout = useCallback((updatedWorkout: any) => {
    setWorkouts(prev => {
      const updated = prev.map(workout => 
        workout.id === updatedWorkout.id ? updatedWorkout : workout
      );
      saveWorkouts(updated);
      return updated;
    });
  }, []);

  const navigateToExercise = useCallback((exerciseId: string) => {
    if (currentWorkoutRef.current) {
      const index = currentWorkoutRef.current.exercises.findIndex(id => id === exerciseId);
      if (index !== -1) {
        setCurrentExerciseIndex(index);
      }
    }
  }, []);

  const navigateToNextExercise = useCallback(() => {
    if (currentWorkoutRef.current && currentExerciseIndex < currentWorkoutRef.current.exercises.length - 1) {
      setCurrentExerciseIndex(prevIndex => prevIndex + 1);
    }
  }, [currentExerciseIndex]);

  const navigateToPreviousExercise = useCallback(() => {
    if (currentWorkoutRef.current && currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prevIndex => prevIndex - 1);
    }
  }, [currentExerciseIndex]);

  const saveCustomWorkout = useCallback((name: string) => {
    if (!currentWorkoutRef.current) {
      toast.error("No active workout to save. Please start a workout first.");
      return;
    }

    // Only save if there are valid exercises
    if (currentWorkoutRef.current.exercises.length === 0) {
      toast.error("Cannot save workout with no exercises");
      return;
    }

    const template: SavedWorkoutTemplate = {
      id: generateId(),
      name: name.trim(),
      exercises: [...currentWorkoutRef.current.exercises],
      type: currentWorkoutRef.current.type,
      createdAt: Date.now(),
      workoutPlanOverrides: workoutPlanOverrides || undefined
    };

    console.log("Saving workout template:", template);

    setSavedWorkoutTemplates(prev => {
      const updated = [template, ...prev];
      saveSavedWorkoutTemplates(updated);
      return updated;
    });
    
    // Cancel the current workout after saving
    setCurrentWorkout(null);
    
    toast.success(`Workout "${name}" saved successfully`);
  }, [workoutPlanOverrides]);

  const saveWorkoutTemplate = useCallback((name: string, exerciseIds: string[], type: ExerciseCategory | "Custom") => {
    const newTemplate: SavedWorkoutTemplate = {
      id: generateId(),
      name,
      exercises: exerciseIds,
      type,
      createdAt: Date.now(),
    };
    setSavedWorkoutTemplates(prev => {
      const updated = [newTemplate, ...prev];
      saveSavedWorkoutTemplates(updated);
      return updated;
    });
    toast.success(`Template "${name}" saved!`);
  }, []);

  const deleteSavedWorkout = useCallback((templateId: string) => {
    setSavedWorkoutTemplates(prev => {
      const updated = prev.filter(t => t.id !== templateId);
      saveSavedWorkoutTemplates(updated);
      return updated;
    });
    toast.success("Workout template deleted");
  }, []);

  const deleteWorkout = useCallback((workoutId: string) => {
    setWorkouts(prev => {
      const updated = prev.filter(w => w.id !== workoutId);
      saveWorkouts(updated);
      return updated;
    });
    toast.success("Workout deleted");
  }, []);

  const getWorkoutStats = useCallback(() => {
    // Get the most recent body measurement to find the user's weight
    const latestMeasurement = bodyMeasurements
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .find(m => m.weight);

    // Default to 70kg if no weight measurement is found
    const weightKg = latestMeasurement?.weight || 70;

    const stats = workouts.reduce(
      (stats, workout) => {
        stats.totalWorkouts += 1;
        stats.totalTime += workout.totalTime || 0;
        stats.totalSets += workout.sets.filter((set) => set.completed).length;
        stats.totalReps += workout.sets
          .filter((set) => set.completed && set.reps)
          .reduce((sum, set) => sum + (set.reps || 0), 0);
        
        // Calculate calories for this workout
        if (workout.totalTime) {
          const durationMinutes = workout.totalTime / 60;
          const isCardio = workout.type === 'Cardio' || workout.type === 'Slide Board';
          
          // Find the weight measurement closest to the workout date
          const workoutDate = new Date(workout.startTime);
          const closestMeasurement = bodyMeasurements
            .filter(m => m.weight && new Date(m.date) <= workoutDate)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          
          // Use the closest historical weight or default to current weight
          const historicalWeight = closestMeasurement?.weight || weightKg;
          
          stats.totalCalories += calculateCalories(durationMinutes, historicalWeight, isCardio);
        }
        
        return stats;
      },
      { totalWorkouts: 0, totalTime: 0, totalSets: 0, totalReps: 0, totalCalories: 0 }
    );

    return stats;
  }, [workouts, bodyMeasurements]);

  const addBodyMeasurement = useCallback((measurement: Omit<BodyMeasurement, "id">) => {
    const newMeasurement: BodyMeasurement = {
      ...measurement,
      id: generateId()
    };
    
    setBodyMeasurements(prev => [newMeasurement, ...prev]);
    toast.success("Body measurement added");
  }, []);

  const updateBodyMeasurement = useCallback((id: string, updates: Partial<BodyMeasurement>) => {
    setBodyMeasurements(prev => 
      prev.map(measurement => 
        measurement.id === id ? { ...measurement, ...updates } : measurement
      )
    );
    toast.success("Body measurement updated");
  }, []);

  const deleteBodyMeasurement = useCallback((id: string) => {
    setBodyMeasurements(prev => prev.filter(m => m.id !== id));
    toast.success("Body measurement deleted");
  }, []);

  const getBodyMeasurements = useCallback(() => {
    return bodyMeasurements;
  }, [bodyMeasurements]);

  const addHealthMetric = useCallback((metric: Omit<HealthMetric, "id">) => {
    const newMetric: HealthMetric = {
      ...metric,
      id: generateId(),
    };
    setHealthMetrics(prev => [newMetric, ...prev]);
    toast.success("Health metric added");
  }, []);

  const updateHealthMetric = useCallback((id: string, updates: Partial<HealthMetric>) => {
    setHealthMetrics(prev => 
      prev.map(metric => 
        metric.id === id ? { ...metric, ...updates } : metric
      )
    );
    toast.success("Health metric updated");
  }, []);

  const deleteHealthMetric = useCallback((id: string) => {
    setHealthMetrics(prev => prev.filter(m => m.id !== id));
    toast.success("Health metric deleted");
  }, []);

  const getHealthMetrics = useCallback(() => {
    return healthMetrics;
  }, [healthMetrics]);

  const saveCustomPlan = useCallback((plan: Omit<CustomPlan, "id" | "createdAt">) => {
    const newPlan: CustomPlan = {
      ...plan,
      id: generateId(),
      createdAt: Date.now(),
    };
    setCustomPlans(prev => [newPlan, ...prev]);
    toast.success("Custom plan saved");
  }, []);

  const updateCustomPlan = useCallback((planId: string, updates: Partial<CustomPlan>) => {
    setCustomPlans(prev => 
      prev.map(plan => 
        plan.id === planId ? { ...plan, ...updates } : plan
      )
    );
    toast.success("Custom plan updated");
  }, []);

  const deleteCustomPlan = useCallback((planId: string) => {
    setCustomPlans(prev => prev.filter(p => p.id !== planId));
    toast.success("Custom plan deleted");
  }, []);

  const getCustomPlans = useCallback(() => {
    return customPlans;
  }, [customPlans]);

  const deleteStatsData = useCallback(() => {
    setWorkouts([]);
    setBodyMeasurements([]);
    setHealthMetrics([]);
    setCustomPlans([]);
    localStorage.removeItem('workouts');
    localStorage.removeItem('bodyMeasurements');
    localStorage.removeItem('healthMetrics');
    localStorage.removeItem('customPlans');
    toast.success('All stats data has been deleted.');
  }, []);

  const contextValue = {
    workouts,
    currentWorkout,
    savedWorkoutTemplates,
    customPlans,
    bodyMeasurements,
    healthMetrics,
    startWorkout,
    startSavedWorkout,
    endWorkout,
    cancelWorkout,
    addSet,
    completeSet,
    skipSet,
    updateSet,
    updateWorkout,
    updateCurrentWorkoutNotes,
    getWorkoutStats,
    navigateToExercise,
    currentExerciseIndex,
    navigateToNextExercise,
    navigateToPreviousExercise,
    saveCustomWorkout,
    saveWorkoutTemplate,
    deleteSavedWorkout,
    deleteWorkout,
    addBodyMeasurement,
    updateBodyMeasurement,
    deleteBodyMeasurement,
    getBodyMeasurements,
    addHealthMetric,
    updateHealthMetric,
    deleteHealthMetric,
    getHealthMetrics,
    saveCustomPlan,
    updateCustomPlan,
    deleteCustomPlan,
    getCustomPlans,
    deleteStatsData,
  };

  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};
