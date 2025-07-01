[33mcommit 995bbae82d2f95ccadfe353629848a2468035850[m[33m ([m[1;36mHEAD[m[33m, [m[1;32mbackup-pre-further-changes[m[33m)[m
Author: RickB54 <rberube54@gmail.com>
Date:   Wed Jun 18 20:43:28 2025 -0400

    Implemented scheduling flow improvements and help icon

[1mdiff --git a/src/components/ui/WorkoutTypeCard.tsx b/src/components/ui/WorkoutTypeCard.tsx[m
[1mindex 9479609..cbb7cb4 100644[m
[1m--- a/src/components/ui/WorkoutTypeCard.tsx[m
[1m+++ b/src/components/ui/WorkoutTypeCard.tsx[m
[36m@@ -38,20 +38,20 @@[m [mconst WorkoutTypeCard = ({[m
     <div[m
       onClick={onClick}[m
       className={cn([m
[31m-        "p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02]",[m
[32m+[m[32m        "p-2 rounded-lg border backdrop-blur-sm transition-all duration-300 flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02]", // Reduced padding from p-3 to p-2, rounded-xl to rounded-lg[m
         colorVariants[color],[m
         className[m
       )}[m
     >[m
       <div[m
         className={cn([m
[31m-          "w-10 h-10 rounded-full flex items-center justify-center mb-1",[m
[32m+[m[32m          "w-8 h-8 rounded-full flex items-center justify-center mb-1", // Reduced icon container from w-10 h-10 to w-8 h-8[m
           iconColorVariants[color][m
         )}[m
       >[m
[31m-        <Icon className="h-5 w-5 text-white" />[m
[32m+[m[32m        <Icon className="h-4 w-4 text-white" /> {/* Reduced icon size from h-5 w-5 to h-4 w-4 */}[m
       </div>[m
[31m-      <span className="font-medium text-sm">{title}</span>[m
[32m+[m[32m      <span className="font-medium text-xs">{title}</span> {/* Reduced font size from text-sm to text-xs */}[m
     </div>[m
   );[m
 };[m
[1mdiff --git a/src/contexts/WorkoutContext.tsx b/src/contexts/WorkoutContext.tsx[m
[1mindex 6361fe1..e578c71 100644[m
[1m--- a/src/contexts/WorkoutContext.tsx[m
[1m+++ b/src/contexts/WorkoutContext.tsx[m
[36m@@ -105,6 +105,7 @@[m [minterface WorkoutContextType {[m
   skipSet: (setId: string) => void;[m
   updateSet: (setId: string, updates: Partial<WorkoutSet>) => void;[m
   updateWorkout: (updatedWorkout: any) => void;[m
[32m+[m[32m  updateCurrentWorkoutNotes: (notes: string) => void; // Added this line[m
   getWorkoutStats: () => {[m
     totalWorkouts: number;[m
     totalTime: number;[m
[36m@@ -163,6 +164,19 @@[m [mexport const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({[m
     return saved ? JSON.parse(saved) : [];[m
   });[m
 [m
[32m+[m[32m  // Function to update notes for the current workout[m
[32m+[m[32m  const updateCurrentWorkoutNotes = (notes: string) => {[m
[32m+[m[32m    if (currentWorkout) {[m
[32m+[m[32m      setCurrentWorkout(prevWorkout => {[m
[32m+[m[32m        if (!prevWorkout) return null;[m
[32m+[m[32m        const updatedWorkout = { ...prevWorkout, notes };[m
[32m+[m[32m        // Also update localStorage for persistence during the workout[m
[32m+[m[32m        localStorage.setItem('currentWorkout', JSON.stringify(updatedWorkout));[m
[32m+[m[32m        return updatedWorkout;[m
[32m+[m[32m      });[m
[32m+[m[32m    }[m
[32m+[m[32m  };[m
[32m+[m
   useEffect(() => {[m
     const loadedWorkouts = getWorkouts();[m
     setWorkouts(loadedWorkouts);[m
[36m@@ -262,7 +276,7 @@[m [mexport const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({[m
   const endWorkout = () => {[m
     if (currentWorkout) {[m
       const endedWorkout = {[m
[31m-        ...currentWorkout,[m
[32m+[m[32m        ...currentWorkout, // Notes will be part of currentWorkout[m
         endTime: Date.now(),[m
         totalTime: Math.floor((Date.now() - currentWorkout.startTime) / 1000),[m
       };[m
[36m@@ -459,21 +473,19 @@[m [mexport const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({[m
   };[m
 [m
   const saveWorkoutTemplate = (name: string, exerciseIds: string[], type: ExerciseCategory | "Custom") => {[m
[31m-    const template: SavedWorkoutTemplate = {[m
[32m+[m[32m    const newTemplate: SavedWorkoutTemplate = {[m
       id: generateId(),[m
[31m-      name: name.trim(),[m
[32m+[m[32m      name,[m
       exercises: exerciseIds,[m
[31m-      type: type,[m
[31m-      createdAt: Date.now()[m
[32m+[m[32m      type,[m
[32m+[m[32m      createdAt: Date.now(),[m
     };[m
[31m-[m
[31m-    console.log("Saving workout template:", template);[m
[31m-[m
     setSavedWorkoutTemplates(prev => {[m
[31m-      const updated = [template, ...prev];[m
[32m+[m[32m      const updated = [newTemplate, ...prev];[m
       saveSavedWorkoutTemplates(updated);[m
       return updated;[m
     });[m
[32m+[m[32m    toast.success(`Template "${name}" saved!`);[m
   };[m
 [m
   const deleteSavedWorkout = (templateId: string) => {[m
[36m@@ -621,13 +633,14 @@[m [mexport const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({[m
         skipSet,[m
         updateSet,[m
         updateWorkout,[m
[31m-        getWorkoutStats,[m
[32m+[m[32m        updateCurrentWorkoutNotes, // This was correctly added[m
[32m+[m[32m        getWorkoutStats, // This was already here[m
         navigateToExercise,[m
         currentExerciseIndex,[m
         navigateToNextExercise,[m
         navigateToPreviousExercise,[m
         saveCustomWorkout,[m
[31m-        saveWorkoutTemplate,[m
[32m+[m[32m        saveWorkoutTemplate, // Add saveWorkoutTemplate here[m
         deleteSavedWorkout,[m
         deleteWorkout,[m
         addBodyMeasurement,[m
[1mdiff --git a/src/lib/data.ts b/src/lib/data.ts[m
[1mindex 385084a..2b8ce68 100644[m
[1m--- a/src/lib/data.ts[m
[1m+++ b/src/lib/data.ts[m
[36m@@ -107,6 +107,7 @@[m [mexport interface Workout {[m
   endTime?: number;[m
   totalTime?: number;[m
   type: RelaxedExerciseCategory | "Custom"; // Changed from ExerciseCategory[m
[32m+[m[32m  notes?: string; // Added notes property here[m
 }[m
 [m
 export interface SavedWorkoutTemplate {[m
[1mdiff --git a/src/pages/MyCalendar.tsx b/src/pages/MyCalendar.tsx[m
[1mindex d530850..c28340d 100644[m
[1m--- a/src/pages/MyCalendar.tsx[m
[1m+++ b/src/pages/MyCalendar.tsx[m
[36m@@ -94,6 +94,8 @@[m [mconst MyCalendar = () => {[m
   const [editingWorkout, setEditingWorkout] = useState<ScheduledWorkout | null>(null);[m
   const [showEditComingSoon, setShowEditComingSoon] = useState(false);[m
   const [selectedExercises, setSelectedExercises] = useState<string[]>([]);[m
[32m+[m[32m  const [exerciseSelectionCompleted, setExerciseSelectionCompleted] = useState(false); // New state[m
[32m+[m[32m  const [isScheduleHelpOpen, setIsScheduleHelpOpen] = useState(false); // New state for the new help popup[m
 [m
   const { workouts, savedWorkoutTemplates, customPlans, startWorkout, startSavedWorkout } = useWorkout();[m
   const navigate = useNavigate();[m
[36m@@ -296,6 +298,10 @@[m [mconst MyCalendar = () => {[m
   const openScheduleDialog = (date: Date) => {[m
     setSchedulingDate(date);[m
     setIsDialogOpen(true);[m
[32m+[m[32m    setExerciseSelectionCompleted(false); // Reset on new dialog open[m
[32m+[m[32m    setWorkoutType("Weights"); // Default or reset[m
[32m+[m[32m    setSelectedExercises([]);[m
[32m+[m[32m    setPendingWorkout(null);[m
   };[m
 [m
   const handlePerformWorkout = (workout: ScheduledWorkout) => {[m
[36m@@ -603,103 +609,118 @@[m [mconst MyCalendar = () => {[m
 [m
   // Function to schedule a workout[m
   const handleScheduleDialogSubmit = () => {[m
[31m-    if (!schedulingDate) return;[m
[31m-[m
[31m-    const typesWithPredefinedExercises = ["Custom", "Plan", "Existing"];[m
[31m-    if (typesWithPredefinedExercises.includes(workoutType)) {[m
[31m-        const workoutData: Omit<ScheduledWorkout, 'id'> = {[m
[31m-            date: schedulingDate,[m
[31m-            workoutType,[m
[31m-            time: workoutTime,[m
[31m-            templateId: workoutType === "Custom" ? selectedTemplateId : undefined,[m
[31m-            planId: workoutType === "Plan" ? selectedPlanId : undefined,[m
[31m-            existingWorkoutId: workoutType === "Existing" ? selectedExistingWorkoutId : undefined,[m
[31m-        };[m
[31m-[m
[31m-        if (workoutType === "Existing" && selectedExistingWorkoutId) {[m
[31m-            const selected = workouts.find(w => w.id === selectedExistingWorkoutId);[m
[31m-            if (selected) {[m
[31m-                (workoutData as ScheduledWorkout).workoutType = `Existing: ${selected.name}`;[m
[31m-            }[m
[31m-        }[m
[31m-        [m
[31m-        if (editingWorkout) {[m
[31m-            const updatedWorkout: ScheduledWorkout = { ...editingWorkout, ...workoutData, date: schedulingDate, time: workoutTime };[m
[31m-            if (workoutType === "Existing" && selectedExistingWorkoutId) {[m
[31m-                const selected = workouts.find(w => w.id === selectedExistingWorkoutId);[m
[31m-                if (selected) updatedWorkout.workoutType = `Existing: ${selected.name}`;[m
[31m-            } else {[m
[31m-                updatedWorkout.workoutType = workoutType;[m
[31m-            }[m
[32m+[m[32m    if (!schedulingDate || !pendingWorkout) return;[m
 [m
[31m-            setScheduledWorkouts(prev => prev.map(w => w.id === editingWorkout.id ? updatedWorkout : w));[m
[31m-            toast.success(`Workout updated for ${format(schedulingDate, 'MMMM do')}`);[m
[31m-        } else {[m
[31m-            const newWorkout: ScheduledWorkout = { ...workoutData, id: Math.random().toString(36).substring(2, 15), date: schedulingDate };[m
[31m-            setScheduledWorkouts(prev => [...prev, newWorkout]);[m
[31m-            toast.success(`Workout scheduled for ${format(schedulingDate, 'MMMM do')}`);[m
[31m-        }[m
[32m+[m[32m    // This function is now called AFTER exercises are selected (if applicable)[m
[32m+[m[32m    // or directly if the workout type doesn't need exercise selection (Custom, Plan, Existing)[m
 [m
[31m-        setIsDialogOpen(false);[m
[31m-        return;[m
[31m-    }[m
[31m-    [m
[31m-    const workoutToSchedule: PendingWorkout = {[m
[31m-      id: editingWorkout ? editingWorkout.id : undefined,[m
[32m+[m[32m    const workoutData: Omit<ScheduledWorkout, 'id'> = {[m
       date: schedulingDate,[m
[31m-      workoutType,[m
[32m+[m[32m      workoutType: pendingWorkout.workoutType,[m
       time: workoutTime,[m
[31m-      exercises: editingWorkout ? editingWorkout.exercises : [][m
[32m+[m[32m      templateId: pendingWorkout.workoutType === "Custom" ? selectedTemplateId : undefined,[m
[32m+[m[32m      planId: pendingWorkout.workoutType === "Plan" ? selectedPlanId : undefined,[m
[32m+[m[32m      existingWorkoutId: pendingWorkout.workoutType === "Existing" ? selectedExistingWorkoutId : undefined,[m
[32m+[m[32m      exercises: pendingWorkout.exercises,[m
     };[m
[31m-    [m
[31m-    setPendingWorkout(workoutToSchedule);[m
[31m-    setSelectedExercises(editingWorkout?.exercises || []); [m
[31m-    setSearchQuery("");[m
[31m-    [m
[31m-    if (workoutType === "No Equipment") {[m
[31m-      setEquipmentFilter("None");[m
[31m-      setCategoryFilter("No Equipment");[m
[31m-    } else if (workoutType === "Slide Board") {[m
[31m-      setEquipmentFilter("Slide Board");[m
[31m-      setCategoryFilter("Slide Board");[m
[31m-    } else if (workoutType === "Weights") {[m
[31m-      setEquipmentFilter("All");[m
[31m-      setCategoryFilter("Weights");[m
[31m-    } else if (workoutType === "Cardio") {[m
[31m-      setEquipmentFilter("All");[m
[31m-      setCategoryFilter("Cardio");[m
[32m+[m
[32m+[m[32m    if (pendingWorkout.workoutType === "Existing" && selectedExistingWorkoutId) {[m
[32m+[m[32m      const selected = workouts.find(w => w.id === selectedExistingWorkoutId);[m
[32m+[m[32m      if (selected) {[m
[32m+[m[32m        (workoutData as ScheduledWorkout).workoutType = `Existing: ${selected.name}`;[m
[32m+[m[32m      }[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    if (editingWorkout && pendingWorkout.id === editingWorkout.id) {[m
[32m+[m[32m      const updatedWorkout: ScheduledWorkout = {[m[41m [m
[32m+[m[32m        ...editingWorkout,[m[41m [m
[32m+[m[32m        ...workoutData,[m[41m [m
[32m+[m[32m        date: schedulingDate,[m[41m [m
[32m+[m[32m        time: workoutTime,[m[41m [m
[32m+[m[32m        workoutType: workoutData.workoutType, // Ensure this is updated[m
[32m+[m[32m        exercises: selectedExercises // Ensure exercises from selector are used for edits too[m
[32m+[m[32m      };[m
[32m+[m[32m      setScheduledWorkouts(prev => prev.map(w => w.id === editingWorkout.id ? updatedWorkout : w));[m
[32m+[m[32m      toast.success(`Workout updated for ${format(schedulingDate, 'MMMM do')}`);[m
     } else {[m
[31m-      setEquipmentFilter("All");[m
[31m-      setCategoryFilter("All");[m
[32m+[m[32m      const newWorkout: ScheduledWorkout = {[m[41m [m
[32m+[m[32m        ...(workoutData as Omit<ScheduledWorkout, 'id' | 'exercises'>), // Cast to avoid type issues if exercises is already there[m
[32m+[m[32m        id: Math.random().toString(36).substring(2, 15),[m[41m [m
[32m+[m[32m        date: schedulingDate,[m[41m [m
[32m+[m[32m        exercises: selectedExercises[m[41m [m
[32m+[m[32m      };[m
[32m+[m[32m      setScheduledWorkouts(prev => [...prev, newWorkout]);[m
[32m+[m[32m      toast.success(`Workout scheduled for ${format(newWorkout.date, 'MMMM do')}`);[m
     }[m
 [m
[31m-    setMuscleGroupFilter("All");[m
     setIsDialogOpen(false);[m
[31m-    setIsExerciseSelectorOpen(true);[m
[32m+[m[32m    setEditingWorkout(null);[m
[32m+[m[32m    setPendingWorkout(null);[m
[32m+[m[32m    setExerciseSelectionCompleted(false);[m
   };[m
 [m
[31m-  const handleAddExercisesToScheduledWorkout = () => {[m
[31m-    if (!pendingWorkout) return;[m
[32m+[m[32m  const handleWorkoutTypeSelect = (type: string) => {[m
[32m+[m[32m    setWorkoutType(type);[m
[32m+[m[32m    const typesRequiringExerciseSelection = ["Weights", "Cardio", "Slide Board", "No Equipment"];[m
 [m
[31m-    if (pendingWorkout.id) {[m
[31m-        setScheduledWorkouts(prev => prev.map(w => [m
[31m-            w.id === pendingWorkout.id [m
[31m-            ? { ...w, exercises: selectedExercises, workoutType: pendingWorkout.workoutType, time: pendingWorkout.time, date: pendingWorkout.date } [m
[31m-            : w[m
[31m-        ));[m
[31m-        toast.success(`Workout updated for ${format(pendingWorkout.date, 'MMMM do')}`);[m
[32m+[m[32m    if (editingWorkout) { // If editing, prepare pending workout immediately[m
[32m+[m[32m        setPendingWorkout({[m
[32m+[m[32m            id: editingWorkout.id,[m
[32m+[m[32m            date: editingWorkout.date,[m
[32m+[m[32m            workoutType: type, // Use the new type[m
[32m+[m[32m            time: editingWorkout.time,[m
[32m+[m[32m            exercises: editingWorkout.exercises[m
[32m+[m[32m        });[m
[32m+[m[32m        setSelectedExercises(editingWorkout.exercises || []);[m
[32m+[m[32m    } else {[m
[32m+[m[32m        setPendingWorkout({[m
[32m+[m[32m            date: schedulingDate!,[m
[32m+[m[32m            workoutType: type,[m
[32m+[m[32m            time: "", // Time will be set later[m
[32m+[m[32m            exercises: [][m
[32m+[m[32m        });[m
[32m+[m[32m        setSelectedExercises([]);[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    if (typesRequiringExerciseSelection.includes(type)) {[m
[32m+[m[32m      // Set filters based on workout type before opening exercise selector[m
[32m+[m[32m      if (type === "No Equipment") {[m
[32m+[m[32m        setEquipmentFilter("None");[m
[32m+[m[32m        setCategoryFilter("No Equipment");[m
[32m+[m[32m      } else if (type === "Slide Board") {[m
[32m+[m[32m        setEquipmentFilter("Slide Board");[m
[32m+[m[32m        setCategoryFilter("Slide Board");[m
[32m+[m[32m      } else if (type === "Weights") {[m
[32m+[m[32m        setEquipmentFilter("All");[m
[32m+[m[32m        setCategoryFilter("Weights");[m
[32m+[m[32m      } else if (type === "Cardio") {[m
[32m+[m[32m        setEquipmentFilter("All");[m
[32m+[m[32m        setCategoryFilter("Cardio");[m
[32m+[m[32m      } else {[m
[32m+[m[32m        setEquipmentFilter("All");[m
[32m+[m[32m        setCategoryFilter("All");[m
[32m+[m[32m      }[m
[32m+[m[32m      setMuscleGroupFilter("All");[m
[32m+[m[32m      setSearchQuery("");[m
[32m+[m[32m      setIsExerciseSelectorOpen(true);[m
[32m+[m[32m      // Dialog will remain open, but content will change after exercise selection[m
     } else {[m
[31m-        const newWorkout: ScheduledWorkout = {[m
[31m-          ...pendingWorkout,[m
[31m-          id: Math.random().toString(36).substring(2, 15),[m
[31m-          exercises: selectedExercises,[m
[31m-        };[m
[31m-        setScheduledWorkouts(prev => [...prev, newWorkout]);[m
[31m-        toast.success(`Workout scheduled for ${format(newWorkout.date, 'MMMM do')}`);[m
[32m+[m[32m      // For types like Custom, Plan, Existing, no immediate exercise selection needed here.[m
[32m+[m[32m      // The main dialog's conditional inputs will show.[m
[32m+[m[32m      setExerciseSelectionCompleted(true); // Mark as completed to show time/schedule button[m
     }[m
[32m+[m[32m  };[m
[32m+[m
[32m+[m[32m  const handleAddExercisesToScheduledWorkout = () => {[m
[32m+[m[32m    if (!pendingWorkout) return;[m
 [m
[32m+[m[32m    // Update the pending workout with selected exercises[m
[32m+[m[32m    setPendingWorkout(prev => prev ? { ...prev, exercises: selectedExercises } : null);[m
[32m+[m[41m    [m
     setIsExerciseSelectorOpen(false);[m
[31m-    setPendingWorkout(null);[m
[32m+[m[32m    setExerciseSelectionCompleted(true); // Mark exercise selection as complete[m
[32m+[m[32m    // Now the main dialog (isDialogOpen) should show time and schedule button[m
[32m+[m[32m    // setIsDialogOpen(true) should already be true or re-assert if needed.[m
   }[m
 [m
   const handleDeleteWorkout = () => {[m
[36m@@ -805,29 +826,58 @@[m [mconst MyCalendar = () => {[m
               setSelectedTemplateId("");[m
               setSelectedPlanId("");[m
               setSelectedExistingWorkoutId("");[m
[32m+[m[32m              setPendingWorkout(null);[m
[32m+[m[32m              setExerciseSelectionCompleted(false);[m
[32m+[m[32m              setSelectedExercises([]);[m
[32m+[m[32m              setIsScheduleHelpOpen(false); // Close help if dialog closes[m
           }[m
       }}>[m
         <DialogContent className="sm:max-w-2xl">[m
[31m-          <DialogHeader>[m
[31m-            <DialogTitle>{editingWorkout ? 'Edit Scheduled Workout' : 'Schedule a Workout'}</DialogTitle>[m
[31m-            <DialogDescription>[m
[31m-              {schedulingDate && `For ${format(schedulingDate, 'EEEE, MMMM do, yyyy')}`}[m
[31m-            </DialogDescription>[m
[32m+[m[32m          <DialogHeader className="flex flex-row justify-between items-center">[m
[32m+[m[32m            <div>[m
[32m+[m[32m              <DialogTitle>{editingWorkout ? 'Edit Scheduled Workout' : 'Schedule a Workout'}</DialogTitle>[m
[32m+[m[32m              <DialogDescription>[m
[32m+[m[32m                {schedulingDate && `For ${format(schedulingDate, 'EEEE, MMMM do, yyyy')}`}[m
[32m+[m[32m              </DialogDescription>[m
[32m+[m[32m            </div>[m
[32m+[m[32m            <Button variant="ghost" size="icon" onClick={() => setIsScheduleHelpOpen(true)}>[m
[32m+[m[32m              <HelpCircle className="h-5 w-5 text-muted-foreground" />[m
[32m+[m[32m            </Button>[m
           </DialogHeader>[m
           [m
[32m+[m[32m          {isScheduleHelpOpen && ([m
[32m+[m[32m            <Alert variant="default" className="mt-2 mb-2">[m
