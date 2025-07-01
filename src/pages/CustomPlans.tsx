
import React, { useState, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  X, 
  Save,
  Filter,
  ClipboardList,
  HelpCircle,
  Info,
  Eye,
  Trash,
  Edit,
  Dumbbell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useExercise } from "@/contexts/ExerciseContext";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate, useSearchParams } from "react-router-dom";
import ExerciseFilters from "@/components/ui/ExerciseFilters";
import CustomPlansHelpPopup from "@/components/ui/CustomPlansHelpPopup";
import { ExerciseCategory } from "@/lib/exerciseTypes";

interface Exercise {
  id: string; // Unique ID for React key
  exerciseId: string; // The real ID from the exercise library
  name: string;
  category?: string;
  sets?: string;
  reps?: string;
  weight?: string;
  distance?: string;
  time?: string;
  incline?: string;
}

interface Day {
  id: string;
  name: string;
  expanded: boolean;
  exercises: Exercise[];
  workouts?: { id: string; name: string }[];
}

interface Plan {
  id: string;
  name: string;
  days: Day[];
}

const CustomPlans = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { saveCustomPlan, customPlans, deleteCustomPlan, updateCustomPlan, startWorkout, savedWorkoutTemplates } = useWorkout();
  const { exercises, filterExercises } = useExercise();
  const [planName, setPlanName] = useState("");
  const [days, setDays] = useState<Day[]>([
    {
      id: "day1",
      name: "Day 1",
      expanded: true,
      exercises: [],
      workouts: []
    }
  ]);
  const [exerciseFilter, setExerciseFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState("All");
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [plansDialogOpen, setPlansDialogOpen] = useState(false);
  const [viewDayPlanOpen, setViewDayPlanOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [addWorkoutDialogOpen, setAddWorkoutDialogOpen] = useState(false);
  const [currentDayForWorkout, setCurrentDayForWorkout] = useState<string | null>(null);
  const dayColors = ['border-gym-blue/60', 'border-gym-green/60', 'border-gym-purple/60', 'border-gym-red/60'];

  useEffect(() => {
    if (searchParams.get("showPlans") === "true") {
      setPlansDialogOpen(true);
      // Clean up the URL by removing the query parameter
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("showPlans");
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const getInputFields = (category: string | undefined) => {
    const fields = [
      { key: 'sets', name: 'sets', label: 'Sets', placeholder: 'e.g., 3', tooltip: 'Number of sets' },
      { key: 'reps', name: 'reps', label: 'Reps', placeholder: 'e.g., 10', tooltip: 'Number of reps' }
    ];
  
    switch (category) {
      case 'Weights':
        fields.push({ key: 'weight', name: 'weight', label: 'Weight', placeholder: 'e.g., 50', tooltip: 'Weight in lbs/kg' });
        break;
      case 'Cardio':
        fields.splice(0, fields.length); // Remove default fields
        fields.push(
          { key: 'time', name: 'time', label: 'Time', placeholder: 'e.g., 30', tooltip: 'Duration in minutes' },
          { key: 'distance', name: 'distance', label: 'Distance', placeholder: 'e.g., 5', tooltip: 'Distance in miles/km' },
          { key: 'incline', name: 'incline', label: 'Incline', placeholder: 'e.g., 2', tooltip: 'Incline level' }
        );
        break;
      case 'Slide Board':
        fields.push({ key: 'time', name: 'time', label: 'Time', placeholder: 'e.g., 60s', tooltip: 'Duration per set' });
        break;
    }

    return fields;
  };

  const handleAddDay = () => {
    const newDay: Day = {
      id: generateId(),
      name: `Day ${days.length + 1}`,
      expanded: true,
      exercises: [],
      workouts: []
    };
    setDays([...days, newDay]);
  };

  const handleDayNameChange = (dayId: string, name: string) => {
    setDays(days.map(day => 
      day.id === dayId ? { ...day, name } : day
    ));
  };

  const handleToggleDay = (dayId: string) => {
    setDays(days.map(day => 
      day.id === dayId ? { ...day, expanded: !day.expanded } : day
    ));
  };

  const handleAddExercise = (dayId: string) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: [
            ...day.exercises,
            {
              id: generateId(),
              exerciseId: "",
              name: "",
              sets: "",
              reps: "",
              weight: "",
              distance: "",
              time: "",
              incline: "",
              category: undefined,
            }
          ]
        };
      }
      return day;
    }));
  };

  const handleRemoveExercise = (dayId: string, exerciseId: string) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: day.exercises.filter(ex => ex.id !== exerciseId)
        };
      }
      return day;
    }));
  };

  const handleExerciseChange = (dayId: string, exerciseId: string, field: keyof Exercise, value: string) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: day.exercises.map(ex => {
            if (ex.id === exerciseId) {
              // Special handling when an exercise is selected from the dropdown
              if (field === 'name') {
                const selectedExercise = exercises.find(e => e.name === value);
                if (selectedExercise) {
                  const exerciseWithDefaults = selectedExercise as any;
                  return {
                    ...ex,
                    id: ex.id,
                    exerciseId: exerciseWithDefaults.id,
                    name: exerciseWithDefaults.name,
                    category: exerciseWithDefaults.category,
                    sets: exerciseWithDefaults.defaultSets?.toString() ?? '',
                    reps: exerciseWithDefaults.defaultReps?.toString() ?? '',
                    weight: exerciseWithDefaults.defaultWeight?.toString() ?? '',
                    distance: exerciseWithDefaults.defaultDistance?.toString() ?? '',
                    time: exerciseWithDefaults.defaultTime?.toString() ?? '',
                    incline: exerciseWithDefaults.defaultIncline?.toString() ?? '',
                  };
                }
              }
              // For all other field updates
              return {
                ...ex,
                [field]: value
              };
            }
            return ex;
          })
        };
      }
      return day;
    }));
  };

  const handleAddWorkout = (dayId: string) => {
    setCurrentDayForWorkout(dayId);
    setAddWorkoutDialogOpen(true);
  };

  const handleSelectWorkoutTemplate = (templateId: string) => {
    if (!currentDayForWorkout) return;
    
    const template = savedWorkoutTemplates.find(t => t.id === templateId);
    if (!template) {
      toast.error("Workout template not found");
      return;
    }

    // Convert workout template exercises to plan exercises
    const workoutExercises: Exercise[] = template.exercises.map(exerciseId => {
      const exercise = exercises.find(ex => ex.id === exerciseId);
      return {
        id: generateId(),
        exerciseId: exercise?.id || "",
        name: exercise?.name || "Unknown Exercise",
        sets: "3", // Default values
        reps: "10",
        weight: ""
      };
    });

    setDays(days.map(day => {
      if (day.id === currentDayForWorkout) {
        return {
          ...day,
          exercises: [...day.exercises, ...workoutExercises],
          workouts: [...(day.workouts || []), { id: generateId(), name: template.name }]
        };
      }
      return day;
    }));

    setAddWorkoutDialogOpen(false);
    setCurrentDayForWorkout(null);
    toast.success(`Added workout "${template.name}" to day plan`);
  };

  const handleViewDayPlan = (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    if (day) {
      setSelectedDay(day);
      setViewDayPlanOpen(true);
    }
  };

  const handleSaveDayPlan = (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    if (day) {
      toast.success(`Day plan "${day.name}" saved`);
    }
  };

  const handleSavePlan = () => {
    if (!planName.trim()) {
      toast.error("Please enter a plan name");
      return;
    }

    const hasExercises = days.some(day => day.exercises.length > 0);
    if (!hasExercises) {
      toast.error("Please add at least one exercise to your plan");
      return;
    }

    try {
      const cleanedDays = days.map(day => ({
        id: day.id,
        name: day.name,
        exercises: day.exercises,
        workouts: day.workouts || []
      }));

      if (editingPlan) {
        updateCustomPlan(editingPlan, {
          name: planName,
          days: cleanedDays,
          createdAt: Date.now()
        });
        setEditingPlan(null);
      } else {
        saveCustomPlan({
          name: planName,
          days: cleanedDays,
        });
      }
      
      toast.success(`Plan ${editingPlan ? 'updated' : 'saved'} successfully!`);
      
      setPlanName("");
      setDays([{
        id: generateId(),
        name: "Day 1",
        expanded: true,
        exercises: [],
        workouts: []
      }]);
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error(`Failed to save plan: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDeletePlan = (planId: string) => {
    try {
      if (window.confirm("Are you sure you want to delete this plan?")) {
        deleteCustomPlan(planId);
        toast.success("Plan deleted successfully!");
        
        if (editingPlan === planId) {
          setEditingPlan(null);
          setPlanName("");
          setDays([{
            id: generateId(),
            name: "Day 1",
            expanded: true,
            exercises: [],
            workouts: []
          }]);
        }
      }
    } catch (error) {
      toast.error(`Failed to delete plan: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleEditPlan = (plan) => {
    try {
      setEditingPlan(plan.id);
      setPlanName(plan.name);
      
      const formattedDays = plan.days.map(day => ({
        ...day,
        expanded: true
      }));
      
      setDays(formattedDays);
      setPlansDialogOpen(false);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      toast.info("Plan loaded for editing");
    } catch (error) {
      toast.error(`Failed to load plan for editing: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const getFilteredExercises = () => {
    return filterExercises(
      equipmentFilter === "All" ? undefined : equipmentFilter,
      categoryFilter === "All" ? undefined : categoryFilter,
      muscleGroupFilter === "All" ? undefined : muscleGroupFilter,
      searchQuery
    );
  };

  const handlePerformWorkout = (day: Day) => {
    if (day.exercises.length === 0) {
      toast.error("Cannot perform workout: no exercises in this day plan");
      return;
    }

    try {
      const planOverrides = day.exercises
        .filter(ex => ex.exerciseId) // Only include exercises that have been selected from the list
        .map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          distance: ex.distance,
          time: ex.time,
          incline: ex.incline,
        }));
      
      const exerciseIds = planOverrides.map(p => p.exerciseId);

      if (exerciseIds.length === 0) {
        toast.error("No valid exercises found in your plan for this workout.");
        return;
      }
      
      startWorkout(`${day.name} Workout`, exerciseIds, planOverrides);
      
      setPlansDialogOpen(false);
      setViewDayPlanOpen(false);
      
      toast.success(`Started workout from ${day.name}`);
      navigate("/workout");
    } catch (error) {
      toast.error(`Failed to start workout: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="page-container page-transition pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Custom Plans</h1>
        </div>
        <div className="flex items-center flex-wrap justify-end gap-2 w-full md:w-auto">
          <Button 
            variant="outline"
            onClick={() => setPlansDialogOpen(true)}
          >
            <ClipboardList />
            My Plans
          </Button>
          <Button 
            className="bg-gym-green text-white" 
            onClick={handleSavePlan}
          >
            <Save />
            {editingPlan ? "Update Plan" : "Save Plan"}
          </Button>
          {editingPlan && (
            <Button
              variant="destructive"
              onClick={() => {
                setEditingPlan(null);
                setPlanName("");
                setDays([{
                  id: generateId(),
                  name: "Day 1",
                  expanded: true,
                  exercises: [],
                  workouts: []
                }]);
              }}
            >
              Cancel Editing
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setHelpDialogOpen(true)}>
            <HelpCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <CustomPlansHelpPopup isOpen={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} />

      <Dialog open={plansDialogOpen} onOpenChange={setPlansDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Custom Plans</DialogTitle>
            <DialogDescription>
              Here are all the custom workout plans you've created.
            </DialogDescription>
          </DialogHeader>
          
          {customPlans && customPlans.length > 0 ? (
            <div className="grid gap-4 py-4">
              {customPlans.map((plan) => (
                <Card key={plan.id} className="bg-gym-darker border-gray-700">
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      Created {new Date(plan.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {plan.days.map((day) => (
                        <div key={day.id} className="border border-gray-700 rounded-md p-3">
                          <div className="font-medium mb-2 flex justify-between items-center">
                            <span>{day.name}</span>
                            <Button
                              variant="perform"
                              size="sm"
                              onClick={() => handlePerformWorkout({...day, expanded: false})}
                            >
                              <Dumbbell className="h-3 w-3 mr-1" />
                              Perform
                            </Button>
                          </div>
                          {day.exercises.length > 0 ? (
                            <ul className="space-y-1 text-sm">
                              {day.exercises.map((ex) => (
                                <li key={ex.id} className="flex items-center justify-between">
                                  <span>{ex.name}</span>
                                  <span className="text-gray-400">
                                    {ex.sets} sets × {ex.reps} reps {ex.weight && `@ ${ex.weight}`}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-400">No exercises</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Plan
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-400">You haven't created any custom plans yet.</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlansDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDayPlanOpen} onOpenChange={setViewDayPlanOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDay?.name} Plan</DialogTitle>
            <DialogDescription>
              Here are the details for this day's plan.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDay && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Exercises</h3>
                {selectedDay.exercises.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDay.exercises.map((exercise, index) => (
                      <div key={exercise.id} className="bg-gym-dark p-3 rounded-md">
                        <p className="font-medium">{exercise.name || "Unnamed Exercise"}</p>
                        <div className="text-sm text-gray-400 mt-1">
                          {exercise.sets} sets × {exercise.reps} reps 
                          {exercise.weight && ` @ ${exercise.weight}`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No exercises added</p>
                )}
              </div>
              
              {selectedDay.workouts && selectedDay.workouts.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Workouts</h3>
                  <div className="space-y-2">
                    {selectedDay.workouts.map((workout) => (
                      <div key={workout.id} className="bg-gym-dark p-3 rounded-md">
                        <p>{workout.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button
                className="w-full bg-gym-green text-white"
                onClick={() => handlePerformWorkout(selectedDay)}
              >
                <Dumbbell className="h-4 w-4 mr-2" />
                Perform Workout
              </Button>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDayPlanOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addWorkoutDialogOpen} onOpenChange={setAddWorkoutDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Saved Workout</DialogTitle>
            <DialogDescription>
              Select a saved workout template to add all its exercises to this day.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {savedWorkoutTemplates && savedWorkoutTemplates.length > 0 ? (
              <div className="space-y-2">
                {savedWorkoutTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleSelectWorkoutTemplate(template.id)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-400">
                        {template.exercises.length} exercises • {template.type}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No saved workout templates found.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Create and save workouts first to use them here.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddWorkoutDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="card-glass p-4 mb-6">
        <CardHeader className="p-2 pt-0">
          <CardTitle className="text-lg">Plan Details</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pb-0">
            <label htmlFor="planName" className="block text-sm font-medium mb-1">
              Plan Name
            </label>
            <Input
              id="planName"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g., My Awesome 5-Day Split"
              className="bg-gym-darker border-gray-700"
            />
        </CardContent>
      </Card>
      
      <Card className="card-glass p-4 mb-6">
        <CardHeader className="p-2 pt-0">
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2"/>
            Filter Exercises
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pb-0">
          <ExerciseFilters
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            equipmentFilter={equipmentFilter}
            onEquipmentFilterChange={setEquipmentFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            muscleGroupFilter={muscleGroupFilter}
            onMuscleGroupFilterChange={setMuscleGroupFilter}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {days.map((day, index) => (
          <div key={day.id} className={`card-glass p-4 rounded-lg border-l-4 ${dayColors[index % dayColors.length]}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 w-2/3">
                <Input
                  value={day.name}
                  onChange={(e) => handleDayNameChange(day.id, e.target.value)}
                  placeholder="Day Name"
                  className="bg-transparent border-0 text-xl font-bold p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSaveDayPlan(day.id)}
                      >
                        <Save />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save Day Plan (feature coming soon)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleDay(day.id)}
                >
                  {day.expanded ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  )}
                </Button>
              </div>
            </div>

            {!day.expanded && day.exercises.length > 0 && (
              <div className="mb-4 pl-3 border-l-2 border-gray-700">
                <ul className="text-sm text-gray-400">
                  {day.exercises.slice(0, 3).map((ex, idx) => (
                    <li key={ex.id} className="mb-1">
                      {ex.name || "Unnamed exercise"}
                      {ex.sets && ex.reps && (
                        <span className="ml-2">({ex.sets} × {ex.reps})</span>
                      )}
                    </li>
                  ))}
                  {day.exercises.length > 3 && (
                    <li>+{day.exercises.length - 3} more exercises</li>
                  )}
                </ul>
              </div>
            )}

            {day.expanded && (
              <div className="space-y-3">
                {day.exercises.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No exercises added yet. Start by adding an exercise or a full workout.</p>
                ) : (
                  day.exercises.map((exercise) => {
                    const fields = getInputFields(exercise.category);
                    return (
                    <div key={exercise.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-12 md:col-span-5">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Select
                                  value={exercise.name || undefined}
                                  onValueChange={(value) => handleExerciseChange(day.id, exercise.id, 'name', value)}
                                >
                                  <SelectTrigger className="bg-gym-darker border-gray-700">
                                    <SelectValue placeholder="Select exercise" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getFilteredExercises().map((ex) => (
                                      <SelectItem key={ex.id} value={ex.name || ex.id}>
                                        {ex.name || "Unnamed Exercise"}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Select an exercise from the list</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      
                      <div className="col-span-12 md:col-span-6">
                        <div className="flex flex-wrap gap-2">
                          {fields.map(field => (
                            <div key={field.key} className="flex-1 min-w-[80px]">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Input
                                      value={(exercise[field.key as keyof Exercise] || '')}
                                      onChange={(e) => handleExerciseChange(day.id, exercise.id, field.key as keyof Exercise, e.target.value)}
                                      placeholder={field.placeholder}
                                      className="bg-gym-darker border-gray-700 w-full"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{field.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="col-span-12 md:col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExercise(day.id, exercise.id)}
                          className="text-red-500 hover:text-red-400 p-2"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  )})
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddExercise(day.id)}
                  >
                    <Plus/>
                    Add Exercise
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddWorkout(day.id)}
                  >
                    <Plus/>
                    Add Workout
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDayPlan(day.id)}
                  >
                    <Eye />
                    Show Daily Plan
                  </Button>
                </div>
                
                {day.workouts && day.workouts.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Workouts</h4>
                    <div className="space-y-2">
                      {day.workouts.map(workout => (
                        <div key={workout.id} className="bg-gym-darker p-3 rounded-md flex justify-between items-center">
                          <span>{workout.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Button
        className="w-full mt-6 bg-gym-blue text-white"
        onClick={handleAddDay}
      >
        <Plus />
        Add Day
      </Button>
    </div>
  );
};

export default CustomPlans;
