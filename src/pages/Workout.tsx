import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, MoreVertical, Trash, Edit, RefreshCw, Save, Plus, Search, ChevronDown } from "lucide-react"; // Added ChevronDown
import { useExercise } from "@/contexts/ExerciseContext";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Exercise, WorkoutSet, SavedWorkoutTemplate } from "@/lib/data";
import { ExerciseCategory } from "@/lib/exerciseTypes";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import IconButton from "@/components/ui/IconButton";
import { formatNumber } from "@/lib/formatters";
import EditSetModal from "@/components/ui/EditSetModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Added DropdownMenu imports

const Workout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { exercises, getExerciseById } = useExercise();
  const { 
    workouts,
    currentWorkout, 
    startWorkout, 
    addSet, 
    completeSet, 
    skipSet, 
    updateSet, 
    endWorkout,
    cancelWorkout,
    navigateToExercise,
    currentExerciseIndex,
    navigateToNextExercise,
    navigateToPreviousExercise,
    saveCustomWorkout,
    savedWorkoutTemplates,
    startSavedWorkout,
    deleteSavedWorkout,
    updateCurrentWorkoutNotes // Add this line
  } = useWorkout();
  
  const searchParams = new URLSearchParams(location.search);
  const exerciseId = searchParams.get("exercise");
  const viewWorkout = searchParams.get("viewWorkout");
  
  const [showActiveWorkout, setShowActiveWorkout] = useState(!!currentWorkout || !!exerciseId);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const workoutTimerRef = useRef<number | null>(null);
  const restTimerRef = useRef<number | null>(null);
  
  const [workoutTime, setWorkoutTime] = useState(0);
  const [restTime, setRestTime] = useState(60);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [lastAddedSetExerciseId, setLastAddedSetExerciseId] = useState<string | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [notes, setNotes] = useState("");
  const [openSetMenu, setOpenSetMenu] = useState<string | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [customWorkoutName, setCustomWorkoutName] = useState("");
  const [editingSet, setEditingSet] = useState<WorkoutSet | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Add this useEffect to load notes from the current workout
  useEffect(() => {
    if (currentWorkout?.notes) {
      setNotes(currentWorkout.notes);
    }
  }, [currentWorkout?.id]);

  // Reset workout time when currentWorkout changes
  useEffect(() => {
    console.log("Current workout changed:", currentWorkout);
    console.log("Show active workout:", showActiveWorkout);
    
    if (currentWorkout) {
      console.log("Setting show active workout to true because currentWorkout exists");
      setShowActiveWorkout(true);
      setWorkoutTime(0); // Reset timer for new workout
    } else {
      console.log("No current workout, keeping showActiveWorkout as is");
    }
  }, [currentWorkout?.id]);

  useEffect(() => {
    if (exerciseId && !currentWorkout) {
      const exercise = getExerciseById(exerciseId);
      if (exercise) {
        startWorkout("Single Exercise", [exerciseId]);
      }
    }
  }, [location.search, getExerciseById, startWorkout, exerciseId]);

  useEffect(() => {
    if (currentWorkout && currentWorkout.exercises.length > 0) {
      const currentExerciseId = currentWorkout.exercises[currentExerciseIndex];
      const exercise = getExerciseById(currentExerciseId);
      
      if (exercise) {
        setCurrentExercise(exercise);
        setActiveExerciseId(currentExerciseId);
        setShowActiveWorkout(true);

        const exerciseSets = currentWorkout.sets.filter(set => set.exerciseId === currentExerciseId);
        if (exerciseSets.length === 0 && lastAddedSetExerciseId !== currentExerciseId) {
          addSet(currentExerciseId, null, exercise.settings);
          setLastAddedSetExerciseId(currentExerciseId);
        }
      }
    }
  }, [currentWorkout, currentExerciseIndex, getExerciseById, addSet, lastAddedSetExerciseId]);
  
  useEffect(() => {
    if (currentWorkout) {
      workoutTimerRef.current = window.setInterval(() => {
        setWorkoutTime((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
      }
    };
  }, [currentWorkout]);
  
  useEffect(() => {
    if (isRestTimerActive && restTime > 0) {
      restTimerRef.current = window.setInterval(() => {
        setRestTime((prev) => {
          if (prev <= 1) {
            setIsRestTimerActive(false);
            clearInterval(restTimerRef.current!);
            toast.success("Rest time complete!");
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isRestTimerActive && restTimerRef.current) {
      clearInterval(restTimerRef.current);
    }
    
    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, [isRestTimerActive, restTime]);

  useEffect(() => {
    if (currentWorkout && currentWorkout.exercises.length > 0) {
      const exerciseId = currentWorkout.exercises[currentExerciseIndex];
      setActiveExerciseId(exerciseId);
      setCurrentExercise(getExerciseById(exerciseId) || null);
    }
  }, [currentExerciseIndex, currentWorkout, getExerciseById]);
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
  
  const handleEditSet = (setId: string) => {
    if (currentWorkout) {
      const setToEdit = currentWorkout.sets.find(set => set.id === setId);
      if (setToEdit) {
        setEditingSet(setToEdit);
        setEditModalOpen(true);
      }
    }
    setOpenSetMenu(null);
  };

  const handleSaveEditedSet = (updatedSet: WorkoutSet) => {
    updateSet(updatedSet.id, updatedSet);
    setEditModalOpen(false);
    setEditingSet(null);
  };

  const handleDeleteSet = (setId: string) => {
    if (window.confirm("Are you sure you want to delete this set?")) {
      skipSet(setId);
      setOpenSetMenu(null);
      if (editModalOpen) {
        setEditModalOpen(false);
        setEditingSet(null);
      }
    }
  };

  const handleViewNotes = () => {
    if (currentExercise) {
      setShowNotesForm(true);
    }
  };

  const handleSaveNotes = () => {
    if (currentWorkout) {
      updateCurrentWorkoutNotes(notes);
      toast.success("Notes saved!");
    }
  };
  
  const handleCompleteSet = (setId: string) => {
    completeSet(setId);
    setIsRestTimerActive(true);
    setOpenSetMenu(null);
  };
  
  const handleAddSet = () => {
    if (activeExerciseId) {
      const lastSet = getCurrentExerciseSets().slice(-1)[0];
      const exerciseSettings = currentExercise?.settings;
      addSet(activeExerciseId, lastSet, exerciseSettings);
      toast.success("Set added");
    }
  };
  
  const handleAddSetAfter = (index: number) => {
    if (activeExerciseId) {
      const sets = getCurrentExerciseSets();
      const exerciseSettings = currentExercise?.settings;
      if (sets.length > 0 && index >= 0 && index < sets.length) {
        const referenceSet = sets[index];
        addSet(activeExerciseId, referenceSet, exerciseSettings);
        toast.success("Set added");
      } else {
        addSet(activeExerciseId, null, exerciseSettings);
        toast.success("Set added");
      }
    }
  };
  
  const handleUpdateSet = (setId: string, field: string, value: number) => {
    const updates: Partial<WorkoutSet> = {};
    
    if (field === "weight") {
      updates.weight = value;
    } else if (field === "reps") {
      updates.reps = value;
    } else if (field === "time") {
      updates.time = value;
    } else if (field === "distance") {
      updates.distance = value;
    } else if (field === "incline") {
      updates.incline = value;
    } else if (field === "duration") {
      updates.duration = value;
    }
    
    updateSet(setId, updates);
  };
  
  const handleEndWorkout = () => {
    endWorkout();
    setShowActiveWorkout(false);
    navigate('/stats');
    toast.success("Workout completed!");
  };

  const handleNextExercise = () => {
    navigateToNextExercise();
  };

  const handlePreviousExercise = () => {
    navigateToPreviousExercise();
  };

  const handleSaveCustomWorkout = () => {
    if (!customWorkoutName.trim()) {
      toast.error("Please enter a name for your workout");
      return;
    }

    if (currentWorkout) {
      saveCustomWorkout(customWorkoutName);
      setSaveModalOpen(false);
      setCustomWorkoutName("");
      toast.success("Workout saved for future use");
    }
  };

  const handleStartWorkout = (type: string, exercises: string[]) => {
    startWorkout(type, exercises);
    if (exercises.length > 0) {
      setShowActiveWorkout(true);
    }
  };

  const handleStartSavedWorkout = (templateId: string) => {
    const template = savedWorkoutTemplates.find(t => t.id === templateId);
    
    if (template) {
      const validExercises = template.exercises.filter(id => id && id.trim() !== '');
      
      if (validExercises.length === 0) {
        toast.error("This saved workout has no valid exercises. Please recreate the workout.");
        return;
      }
      
      startSavedWorkout(templateId);
      setShowActiveWorkout(true);
      
    } else {
      toast.error("Saved workout not found");
    }
  };
  
  const getCurrentExerciseSets = () => {
    if (!currentWorkout || !activeExerciseId) return [];
    return currentWorkout.sets.filter((set) => set.exerciseId === activeExerciseId);
  };

  const getExerciseHistory = () => {
    if (!activeExerciseId) return [];
    
    const history: { date: string; sets: WorkoutSet[] }[] = [];
    
    workouts.forEach(workout => {
      const exerciseSets = workout.sets.filter(set => 
        set.exerciseId === activeExerciseId && set.completed
      );
      
      if (exerciseSets.length > 0) {
        history.push({
          date: new Date(workout.startTime).toLocaleDateString(),
          sets: exerciseSets
        });
      }
    });
    
    return history.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 3);
  };

  const getFilteredWorkouts = () => {
    let filtered = [...savedWorkoutTemplates];
    
    if (selectedCategory !== "All") {
      filtered = filtered.filter(template => template.type === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Function to render saved workout templates
  const renderSavedWorkoutTemplates = () => {
    const filteredTemplates = getFilteredWorkouts();

    if (filteredTemplates.length === 0 && (searchQuery || selectedCategory !== "All")) {
      return <p className="text-muted-foreground text-center py-4">No saved workouts match your filters.</p>;
    }

    if (filteredTemplates.length === 0) {
      return <p className="text-muted-foreground text-center py-4">No saved workouts yet. Create one from an active workout!</p>;
    }

    return filteredTemplates.map((template) => {
      const exercisesInWorkout = template.exercises.map(id => getExerciseById(id)).filter(ex => ex);
      return (
        <div 
          key={template.id} 
          className="p-4 rounded-lg border border-gray-700 bg-gym-card hover:bg-gym-card-hover transition-colors flex justify-between items-center"
        >
          <div onClick={() => handleStartSavedWorkout(template.id)} className="cursor-pointer flex-grow">
            <h3 className="font-medium">{template.name}</h3>
            <div className="flex text-xs text-muted-foreground space-x-3 mt-1">
              <span>{template.type}</span>
              <span>•</span>
              <span>{formatDate(template.createdAt)}</span>
              <span>•</span>
              <span>{exercisesInWorkout.length} exercise{exercisesInWorkout.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Exercises</DropdownMenuLabel>
                {exercisesInWorkout.length > 0 ? (
                  exercisesInWorkout.map((exercise) =>
                    exercise ? (
                      <DropdownMenuItem key={exercise.id} disabled>
                        {exercise.name}
                      </DropdownMenuItem>
                    ) : null
                  )
                ) : (
                  <DropdownMenuItem disabled>No exercises in this workout.</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <IconButton
              Icon={Trash}
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this saved workout?")) {
                  deleteSavedWorkout(template.id);
                }
              }}
              label="Delete" // Changed from tooltip to label
              variant="blue"   // Use variant for styling
              // className="text-blue-500 hover:bg-blue-500/20" // Removed direct className styling for consistency
            />
            <IconButton
              Icon={Clock} 
              onClick={() => {
                handleStartSavedWorkout(template.id);
              }}
              label="Start"  // Changed from tooltip to label
              variant="blue" // Use variant for styling
              // className="text-blue-500 hover:bg-blue-500/20" // Removed direct className styling for consistency
            />
          </div>
        </div>
      );
    });
  };
  
  const renderSet = (set: WorkoutSet, index: number) => {
    if (!currentExercise) return null;
    
    return (
      <div 
        key={set.id} 
        className={`p-4 rounded-lg border ${set.completed ? "bg-gym-dark/50 border-gray-700" : "bg-gym-card border-gray-700"}`}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <h3 className="font-medium">{`Set ${index + 1}: ${formatNumber(set.reps || 0)} reps`}</h3>
            {set.completed && (
              <span className="ml-2 text-xs text-gym-green">✓ Completed</span>
            )}
          </div>
          
          {!set.completed && (
            <div className="relative">
              <button
                className="p-1 hover:bg-gym-dark rounded transition-colors"
                onClick={() => setOpenSetMenu(openSetMenu === set.id ? null : set.id)}
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              
              {openSetMenu === set.id && (
                <div className="absolute right-0 mt-2 w-36 bg-gym-dark border border-gray-700 rounded-lg shadow-lg z-10">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gym-card transition-colors"
                    onClick={() => handleEditSet(set.id)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Set
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gym-card transition-colors"
                    onClick={() => handleDeleteSet(set.id)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Set
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {currentExercise.category === "Weights" && (
            <>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Weight (lbs)</p>
                {set.completed ? (
                  <p>{formatNumber(set.weight || 0)}</p>
                ) : (
                  <div className="flex items-center">
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-l-md border-l border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "weight", Math.max(0, (set.weight || 0) - 5))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="bg-gym-dark h-8 w-16 text-center border-t border-b border-gray-700"
                      value={set.weight || 0}
                      onChange={(e) => handleUpdateSet(set.id, "weight", parseInt(e.target.value) || 0)}
                    />
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-r-md border-r border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "weight", (set.weight || 0) + 5)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reps</p>
                {set.completed ? (
                  <p>{formatNumber(set.reps || 0)}</p>
                ) : (
                  <div className="flex items-center">
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-l-md border-l border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "reps", Math.max(1, (set.reps || 0) - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="bg-gym-dark h-8 w-16 text-center border-t border-b border-gray-700"
                      value={set.reps || 0}
                      onChange={(e) => handleUpdateSet(set.id, "reps", parseInt(e.target.value) || 0)}
                    />
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-r-md border-r border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "reps", (set.reps || 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {currentExercise.category === "Cardio" && (
            <>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Time (min)</p>
                {set.completed ? (
                  <p>{formatNumber(set.time || 0)}</p>
                ) : (
                  <div className="flex items-center">
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-l-md border-l border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "time", Math.max(0, (set.time || 0) - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="bg-gym-dark h-8 w-16 text-center border-t border-b border-gray-700"
                      value={set.time || 0}
                      onChange={(e) => handleUpdateSet(set.id, "time", parseInt(e.target.value) || 0)}
                    />
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-r-md border-r border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "time", (set.time || 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Distance (mi)</p>
                {set.completed ? (
                  <p>{formatNumber(set.distance || 0)}</p>
                ) : (
                  <div className="flex items-center">
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-l-md border-l border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "distance", Math.max(0, (set.distance || 0) - 0.1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      className="bg-gym-dark h-8 w-16 text-center border-t border-b border-gray-700"
                      value={set.distance || 0}
                      onChange={(e) => handleUpdateSet(set.id, "distance", parseFloat(e.target.value) || 0)}
                    />
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-r-md border-r border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "distance", ((set.distance || 0) + 0.1))}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {currentExercise.category === "Slide Board" && (
            <>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Incline</p>
                {set.completed ? (
                  <p>{formatNumber(set.incline || 0)}</p>
                ) : (
                  <div className="flex items-center">
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-l-md border-l border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "incline", Math.max(0, (set.incline || 0) - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="bg-gym-dark h-8 w-16 text-center border-t border-b border-gray-700"
                      value={set.incline || 0}
                      onChange={(e) => handleUpdateSet(set.id, "incline", parseInt(e.target.value) || 0)}
                    />
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-r-md border-r border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "incline", (set.incline || 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reps</p>
                {set.completed ? (
                  <p>{formatNumber(set.reps || 0)}</p>
                ) : (
                  <div className="flex items-center">
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-l-md border-l border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "reps", Math.max(1, (set.reps || 0) - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="bg-gym-dark h-8 w-16 text-center border-t border-b border-gray-700"
                      value={set.reps || 0}
                      onChange={(e) => handleUpdateSet(set.id, "reps", parseInt(e.target.value) || 0)}
                    />
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-r-md border-r border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "reps", (set.reps || 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {currentExercise.category === "No Equipment" && (
            <>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Time (sec)</p>
                {set.completed ? (
                  <p>{formatNumber(set.duration || 0)}</p>
                ) : (
                  <div className="flex items-center">
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-l-md border-l border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "duration", Math.max(0, (set.duration || 0) - 5))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="bg-gym-dark h-8 w-16 text-center border-t border-b border-gray-700"
                      value={set.duration || 0}
                      onChange={(e) => handleUpdateSet(set.id, "duration", parseInt(e.target.value) || 0)}
                    />
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-r-md border-r border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "duration", (set.duration || 0) + 5)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reps</p>
                {set.completed ? (
                  <p>{formatNumber(set.reps || 0)}</p>
                ) : (
                  <div className="flex items-center">
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-l-md border-l border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "reps", Math.max(1, (set.reps || 0) - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="bg-gym-dark h-8 w-16 text-center border-t border-b border-gray-700"
                      value={set.reps || 0}
                      onChange={(e) => handleUpdateSet(set.id, "reps", parseInt(e.target.value) || 0)}
                    />
                    <button
                      className="bg-gym-dark h-8 w-8 flex items-center justify-center rounded-r-md border-r border-t border-b border-gray-700"
                      onClick={() => handleUpdateSet(set.id, "reps", (set.reps || 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          
          {!set.completed && (
            <div className="col-span-2 mt-3">
              <button
                className="w-full bg-gym-green text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
                onClick={() => handleCompleteSet(set.id)}
              >
                COMPLETE SET
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <button
            className="w-full bg-gym-dark hover:bg-gym-card-hover text-white py-2 rounded-lg flex items-center justify-center transition-colors"
            onClick={() => handleAddSetAfter(index)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Set
          </button>
        </div>
      </div>
    );
  };

  const renderHistoryItem = (history: { date: string; sets: WorkoutSet[] }) => {
    if (!currentExercise) return null;
    
    return (
      <div key={history.date} className="mb-4">
        <h4 className="text-sm font-medium mb-2">{history.date}</h4>
        <div className="space-y-2">
          {history.sets.map((set, idx) => (
            <div key={set.id} className="bg-gym-dark/30 p-3 rounded-lg border border-gray-700">
              <p className="text-sm">
                <span className="text-muted-foreground">Set {idx + 1}: </span>
                {currentExercise.category === "Weights" && (
                  <>
                    <span className="font-medium">{formatNumber(set.weight || 0)}</span> lbs × 
                    <span className="font-medium"> {formatNumber(set.reps || 0)}</span> reps
                  </>
                )}
                {currentExercise.category === "Cardio" && (
                  <>
                    <span className="font-medium">{formatNumber(set.time || 0)}</span> min × 
                    <span className="font-medium"> {formatNumber(set.distance || 0)}</span> mi
                  </>
                )}
                {currentExercise.category === "Slide Board" && (
                  <>
                    <span className="font-medium">Incline {formatNumber(set.incline || 0)}</span> × 
                    <span className="font-medium"> {formatNumber(set.reps || 0)}</span> reps
                  </>
                )}
                {currentExercise.category === "No Equipment" && (
                  <>
                    <span className="font-medium">{formatNumber(set.duration || 0)}</span> sec × 
                    <span className="font-medium"> {formatNumber(set.reps || 0)}</span> reps
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  if (showActiveWorkout && currentWorkout && currentExercise) {
    return (
      <div className="page-container page-transition pb-24">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              className="mr-2 text-muted-foreground hover:text-white transition-colors"
              onClick={() => {
                if (window.confirm("End this workout?")) {
                  handleEndWorkout();
                }
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold truncate pr-2">{currentExercise.name}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="p-1 hover:bg-gym-dark rounded transition-colors flex items-center"
              onClick={() => setSaveModalOpen(true)}
            >
              <Save className="h-5 w-5 mr-1" />
              <span className="text-sm hidden md:inline">Save</span>
            </button>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-1 text-muted-foreground" />
              <span className="text-sm">
                {formatTime(workoutTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative w-full aspect-video rounded-lg bg-gym-dark flex items-center justify-center overflow-hidden mb-4">
            {currentExercise.thumbnailUrl || currentExercise.pictureUrl ? (
              <img
                src={currentExercise.thumbnailUrl || currentExercise.pictureUrl}
                alt={currentExercise.name}
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-800">
                <span className="text-xs text-muted-foreground">No image available</span>
              </div>
            )}
          </div>

          {currentWorkout.exercises.length > 1 && (
            <div className="flex justify-between items-center mb-4">
              <button
                className={`p-2 rounded-full ${currentExerciseIndex > 0 ? "bg-gym-blue" : "bg-gym-dark/50"}`}
                onClick={handlePreviousExercise}
                disabled={currentExerciseIndex === 0}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm">
                {currentExerciseIndex + 1} / {currentWorkout.exercises.length}
              </span>
              <button
                className={`p-2 rounded-full ${currentExerciseIndex < currentWorkout.exercises.length - 1 ? "bg-gym-blue" : "bg-gym-dark/50"}`}
                onClick={handleNextExercise}
                disabled={currentExerciseIndex === currentWorkout.exercises.length - 1}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center bg-gym-dark px-4 py-2 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="text-sm mr-2">Rest:</span>
              <span className={`text-sm font-mono ${isRestTimerActive ? "text-gym-green" : ""}`}>
                {formatTime(restTime)}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                className="p-1 hover:bg-gym-card rounded transition-colors"
                onClick={() => {
                  setIsRestTimerActive(!isRestTimerActive);
                }}
              >
                {isRestTimerActive ? (
                  <span className="text-xs bg-gym-red px-2 py-1 rounded">Pause</span>
                ) : (
                  <span className="text-xs bg-gym-green px-2 py-1 rounded">Start</span>
                )}
              </button>
              <button
                className="p-1 hover:bg-gym-card rounded transition-colors"
                onClick={() => setRestTime(60)}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-center space-x-2 mb-4">
            <Button
              variant={showDescription ? "default" : "outline"}
              onClick={() => {
                setShowDescription(!showDescription);
                setShowHistory(false);
                setShowNotes(false);
              }}
            >
              Description
            </Button>
            <Button
              variant={showHistory ? "default" : "outline"}
              onClick={() => {
                setShowHistory(!showHistory);
                setShowDescription(false);
                setShowNotes(false);
              }}
            >
              History
            </Button>
            <Button
              variant={showNotes ? "default" : "outline"}
              onClick={() => {
                setShowNotes(!showNotes);
                setShowDescription(false);
                setShowHistory(false);
              }}
            >
              Notes
            </Button>
          </div>

          {showDescription && (
            <div className="mb-6 p-4 bg-gym-card rounded-lg">
              <h3 className="text-sm font-medium mb-1">Exercise Description:</h3>
              <p className="text-sm text-gray-300">
                {currentExercise.description || currentExercise.notes || "No description available."}
              </p>
            </div>
          )}

          {showHistory && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Previous Workouts</h3>
              {getExerciseHistory().length > 0 ? (
                <div className="bg-gym-card/50 rounded-lg p-4 border border-gray-700">
                  {getExerciseHistory().map(history => renderHistoryItem(history))}
                </div>
              ) : (
                <div className="bg-gym-card/50 rounded-lg p-4 border border-gray-700 text-center text-muted-foreground">
                  <p>No previous history for this exercise</p>
                </div>
              )}
            </div>
          )}

          {showNotes && (
            <div className="mb-6">
              <textarea
                className="w-full h-24 bg-gym-dark border border-gray-700 rounded-lg p-3 text-sm"
                placeholder="Add notes about this exercise..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <button
                className="mt-2 w-full bg-gym-blue text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                onClick={handleSaveNotes}
              >
                Save Notes
              </button>
            </div>
          )}
        </div>
        
        <div className="space-y-4 mb-6">
          {getCurrentExerciseSets().map((set, index) => renderSet(set, index))}
        </div>
        
        <button
          className="w-full bg-gym-dark hover:bg-gym-card-hover text-white py-3 rounded-lg flex items-center justify-center transition-colors mb-4"
          onClick={handleAddSet}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Set
        </button>
        
        {saveModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gym-dark rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Save Custom Workout</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Save this workout to reuse it in the future.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Workout Name</label>
                <input
                  type="text"
                  className="w-full bg-gym-darker border border-gray-700 rounded-lg p-2"
                  placeholder="My Custom Workout"
                  value={customWorkoutName}
                  onChange={(e) => setCustomWorkoutName(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  className="flex-1 bg-gym-card text-white py-2 rounded-lg hover:bg-gym-card-hover transition-colors"
                  onClick={() => setSaveModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-gym-green text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                  onClick={handleSaveCustomWorkout}
                >
                  Save Workout
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-gym-darker border-t border-white/5 flex flex-col space-y-2">
          <button
            onClick={() => {
              if (window.confirm("End this workout and save your progress?")) {
                handleEndWorkout();
              }
            }}
            className="w-full py-3 rounded-lg font-medium bg-gym-blue text-white hover:bg-blue-600 transition-colors"
          >
            End Workout
          </button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to cancel this workout? All progress will be lost.")) {
                cancelWorkout();
              }
            }}
            className="w-full py-3 rounded-lg font-medium bg-gym-red text-white hover:bg-red-600 transition-colors"
          >
            Cancel Workout
          </button>
        </div>

        {editingSet && (
          <EditSetModal 
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            set={editingSet}
            onSave={handleSaveEditedSet}
            onDelete={() => handleDeleteSet(editingSet.id)}
            onAddSet={() => handleAddSet()}
          />
        )}
      </div>
    );
  }
  
  return (
    <div className="page-container page-transition">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Workouts</h1>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate("/create-workout?type=Custom")}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Workout
          </Button>
        </div>
      </div>
      
      {currentWorkout && (
        <div className="mb-6">
          <Button 
            className="w-full bg-primary" 
            onClick={() => setShowActiveWorkout(true)}
          >
            <Clock className="h-5 w-5 mr-2" />
            Continue Current Workout
          </Button>
        </div>
      )}

      <div className="mb-6">
        <div className="flex space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Search workouts" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-1/3">
            <select
              className="bg-gym-dark border border-border text-white text-sm rounded-lg w-full p-2 h-10"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">Category (All)</option>
              <option value="Weights">Category (Weights)</option>
              <option value="Cardio">Category (Cardio)</option>
              <option value="Slide Board">Category (Slide Board)</option>
              <option value="No Equipment">Category (No Equipment)</option>
              <option value="Custom">Category (Custom)</option>
            </select>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-medium mb-4">New Workout</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div 
          className="h-24 flex items-center justify-center cursor-pointer rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] bg-gym-blue/20 border-gym-blue/30 hover:bg-gym-blue/30"
          onClick={() => navigate("/create-workout?type=Weights")}
        >
          <p className="font-medium">Weights</p>
        </div>
        <div 
          className="h-24 flex items-center justify-center cursor-pointer rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] bg-gym-red/20 border-gym-red/30 hover:bg-gym-red/30"
          onClick={() => navigate("/create-workout?type=Cardio")}
        >
          <p className="font-medium">Cardio</p>
        </div>
        <div 
          className="h-24 flex items-center justify-center cursor-pointer rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] bg-gym-green/20 border-gym-green/30 hover:bg-gym-green/30"
          onClick={() => navigate("/create-workout?type=Slide Board")}
        >
          <p className="font-medium">Slide Board</p>
        </div>
        <div 
          className="h-24 flex items-center justify-center cursor-pointer rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] bg-gym-purple/20 border-gym-purple/30 hover:bg-gym-purple/30"
          onClick={() => navigate("/create-workout?type=No Equipment")}
        >
          <p className="font-medium">No Equipment</p>
        </div>
        <div 
          className="card-glass h-24 flex items-center justify-center cursor-pointer hover:bg-gym-card-hover transition-colors col-span-2"
          onClick={() => navigate("/create-workout?type=Custom")}
        >
          <p className="font-medium">Custom Workout</p>
        </div>
      </div>
      
      {savedWorkoutTemplates.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Saved Workouts</h2>
          <div className="space-y-3">
            {renderSavedWorkoutTemplates()} {/* Changed this line to call the new render function */}
          </div>
        </div>
      )}
      
      {workouts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Past Workouts</h2>
          <div className="space-y-3">
            {workouts.slice(0, 5).map((workout) => (
              <div
                key={workout.id}
                className="p-4 rounded-lg border border-gray-700 bg-gym-card hover:bg-gym-card-hover cursor-pointer transition-colors"
                onClick={() => navigate(`/stats?workout=${workout.id}`)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{workout.name}</h3>
                    <div className="flex text-xs text-muted-foreground space-x-3 mt-1">
                      <span>{workout.exercises.length} exercises</span>
                      <span>•</span>
                      <span>{formatDate(workout.startTime)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {workouts.length > 5 && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/stats')}
              >
                View All Workouts
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Workout;