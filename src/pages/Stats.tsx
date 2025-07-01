// Update imports at the top of the file
import React, { useState, useMemo } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { convertWeightToKg } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useExercise } from '@/contexts/ExerciseContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { HelpCircle, Trash2, Edit, Save, X, Dumbbell, Clock, ListChecks, Repeat, BarChart2, ChevronDown, ChevronsRight, ChevronsLeft, ArchiveRestore, Play, User, Activity } from 'lucide-react';
import StatsHelpPopup from '@/components/ui/StatsHelpPopup';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import StatsCard from '@/components/ui/StatsCard';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import WorkoutStatsGraphPopup from '@/components/ui/WorkoutStatsGraphPopup';
import type { Workout, Exercise } from '@/lib/data';
import { formatCalories, calculateCalories } from '@/lib/formatters';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type WorkoutWithNotes = Workout & { notes?: string };

interface TotalWorkouts {
    number: number;
    totalCalories: number;
    totalTime: number;
    totalSets: number;
    totalReps: number;
}

const Stats = () => {
    const { unitSystem } = useSettings();
    const { workouts, getWorkoutStats, deleteWorkout, updateWorkout, startWorkout, bodyMeasurements } = useWorkout();
    const { getExerciseById } = useExercise();
    const navigate = useNavigate();
    const [showHelp, setShowHelp] = useState(false);
    const [showBodyMetricsHelp, setShowBodyMetricsHelp] = useState(false);
    const [showHealthMetricsHelp, setShowHealthMetricsHelp] = useState(false);
    const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
    const [editedNotes, setEditedNotes] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
    const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<'day' | 'week' | 'month' | 'all'>('all');
    const [openWorkouts, setOpenWorkouts] = useState<Record<string, boolean>>({});

    const latestWeight = useMemo(() => {
        const latestMeasurement = bodyMeasurements
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .find(m => m.weight);
        return latestMeasurement?.weight || 70;
    }, [bodyMeasurements]);

    const displayWeight = useMemo(() => {
        if (unitSystem === 'imperial') {
            return Math.round(latestWeight * 2.20462); // Convert kg to lbs
        }
        return latestWeight;
    }, [latestWeight, unitSystem]);

    const stats = getWorkoutStats();

    const filteredAndSortedWorkouts = useMemo(() => {
        let sorted = [...(workouts as WorkoutWithNotes[])].sort((a, b) => b.startTime - a.startTime);

        if (filterType !== 'all') {
            const now = new Date();
            let fromDate = new Date();
            if (filterType === 'day') {
                fromDate.setHours(0, 0, 0, 0);
            } else if (filterType === 'week') {
                const dayOfWeek = now.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
                fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
                fromDate.setHours(0, 0, 0, 0);
            } else if (filterType === 'month') {
                fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
                fromDate.setHours(0, 0, 0, 0);
            }
            sorted = sorted.filter(workout => new Date(workout.startTime) >= fromDate);
        }

        if (dateRange && dateRange.from) { // Ensure dateRange and from are defined
            const from = dateRange.from;
            const to = dateRange.to ? new Date(dateRange.to) : new Date(from);
            to.setHours(23, 59, 59, 999);
            return sorted.filter(workout => {
                const workoutDate = new Date(workout.startTime);
                return workoutDate >= from && workoutDate <= to;
            });
        }
        return sorted; // Return sorted if no dateRange is applied
    }, [workouts, dateRange, filterType]);

    const getWorkoutType = (workout: Workout) => {
        if (!workout.exercises || workout.exercises.length === 0) return 'General';
        
        const categories = workout.exercises
            .map(id => getExerciseById(id))
            .filter(ex => ex)
            .map(ex => ex.category.trim());
        
        if (categories.length === 0) return 'General';

        const uniqueCategories = [...new Set(categories)];

        if (uniqueCategories.length === 1) {
            return uniqueCategories[0];
        }

        const hasStrength = uniqueCategories.some(c => c === 'Weights' || c === 'Bodyweight');
        const hasCardio = uniqueCategories.some(c => c === 'Cardio' || c === 'Slide Board');

        if (hasStrength && hasCardio) {
            return 'Hybrid';
        }
        if (hasStrength) {
            return 'Strength';
        }
        if (hasCardio) {
            return 'Cardio';
        }
        
        return 'Mixed';
    };

    const handleEdit = (e: React.MouseEvent, workoutId: string, notes: string | undefined) => {
        e.stopPropagation();
        setOpenWorkouts(prev => ({ ...prev, [workoutId]: true })); // Add this line to open the collapsible
        setEditingWorkoutId(workoutId);
        setEditedNotes(notes || '');
    };

    const handleSave = (e: React.MouseEvent, workoutId: string) => {
        e.stopPropagation();
        const workout = (workouts as WorkoutWithNotes[]).find(w => w.id === workoutId);
        if (workout) {
            updateWorkout({ ...workout, notes: editedNotes });
            setEditingWorkoutId(null);
            toast.success("Workout notes updated!");
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingWorkoutId(null);
        setEditedNotes('');
    };

    const handleRerunWorkout = (e: React.MouseEvent, workout: Workout) => {
        e.stopPropagation();
        startWorkout(workout.type, workout.exercises);
        navigate('/workout');
    };
    
    const handleDelete = (e: React.MouseEvent, workoutId: string) => {
        e.stopPropagation();
        setWorkoutToDelete(workoutId);
    };

    const handleConfirmDelete = () => {
        if (workoutToDelete) {
            deleteWorkout(workoutToDelete);
            setWorkoutToDelete(null);
        }
    };

    const handleCleanUp = () => {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - 7); // 1 week ago

        const newOpenStates = {...openWorkouts};
        let changed = false;
        filteredAndSortedWorkouts.forEach(workout => {
            if (new Date(workout.startTime).getTime() < threshold.getTime()) {
                if(newOpenStates[workout.id] !== false) {
                    newOpenStates[workout.id] = false;
                    changed = true;
                }
            }
        });
        setOpenWorkouts(newOpenStates);
        if (changed) {
            toast.info("Older workouts have been collapsed.");
        } else {
            toast.info("No older workouts to collapse.");
        }
    };

    const handleFilterChange = (type: 'day' | 'week' | 'month' | 'all') => {
        setFilterType(type);
        setDateRange(undefined);
        let newOpenStates = { ...openWorkouts };
        const threshold = new Date();
        let collapseMessage = "";

        if (type === 'day') {
            // For 'day', we don't usually auto-collapse further unless specified
            toast.info("Displaying workouts for today.");
            // Optionally, ensure all are expanded for 'day' or keep current states
            // return; // if no collapsing logic for day
        } else if (type === 'week') {
            threshold.setDate(threshold.getDate() - 7);
            collapseMessage = "Older workouts (beyond this week) have been collapsed.";
        } else if (type === 'month') {
            threshold.setMonth(threshold.getMonth() - 1);
            collapseMessage = "Older workouts (beyond this month) have been collapsed.";
        } else { // 'all'
            setOpenWorkouts(prev => {
                const allOpen = {};
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                Object.keys(prev).forEach(id => allOpen[id] = true);
                return allOpen;
            });
            toast.info("Displaying all workouts.");
            return; 
        }

        let changed = false;
        // Apply collapsing logic only if not 'all' and not 'day' (or if 'day' has specific collapse rules)
        if (type === 'week' || type === 'month') {
            filteredAndSortedWorkouts.forEach(workout => {
                if (new Date(workout.startTime).getTime() < threshold.getTime()) {
                    if(newOpenStates[workout.id] !== false) {
                        newOpenStates[workout.id] = false;
                        changed = true;
                    }
                }
            });
            setOpenWorkouts(newOpenStates);
            if (changed) {
                toast.info(collapseMessage);
            } else {
                toast.info(`Displaying workouts for the selected ${type}. No older workouts to collapse.`);
            }
        }
    };

    const handleToggleAll = (expand: boolean) => {
        const newOpenStates: Record<string, boolean> = {};
        filteredAndSortedWorkouts.forEach(workout => {
            newOpenStates[workout.id] = expand;
        });
        setOpenWorkouts(newOpenStates);
        toast.info(expand ? "All workouts expanded." : "All workouts collapsed.");
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [
            h > 0 ? `${h}h` : '',
            m > 0 ? `${m}m` : '',
            s > 0 ? `${s}s` : '',
        ].filter(Boolean).join(' ');
    };

    // Add this calculation for filtered calories before the return statement
    const filteredCalories = useMemo(() => {
        return filteredAndSortedWorkouts.reduce((total, workout) => {
            const durationMinutes = (workout.totalTime || 0) / 60;
            const isCardio = workout.type === 'Cardio' || workout.type === 'Slide Board';
            return total + calculateCalories(durationMinutes, latestWeight, isCardio);
        }, 0);
    }, [filteredAndSortedWorkouts, latestWeight]);

    return (
        <div className="container py-6 space-y-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                <h1 className="text-2xl font-bold">Workout Stats</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/body-metrics')}>
                        <User className="mr-2 h-4 w-4" /> Body Metrics
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setShowHelp(true)} title="Help with Workout Stats">
                        <HelpCircle className="h-6 w-6" />
                    </Button>
                </div>
            </div>
            <StatsHelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} title="Workout Stats Help" />
            
            {/* Calorie Banner */}
            <div className="bg-primary/10 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <div>
                        <span className="font-medium">
                            {filterType === 'all' ? 'Total' : filterType === 'day' ? "Today's" : 
                             filterType === 'week' ? 'This Week\'s' : 'This Month\'s'} Calories Burned: {formatCalories(filteredCalories)}
                        </span>
                        {latestWeight === 70 && (
                            <div className="text-sm text-muted-foreground">
                                (using default weight: {displayWeight}{unitSystem === 'imperial' ? ' lbs' : ' kg'}) - 
                                <Button
                                    variant="link"
                                    className="p-0 h-auto text-sm text-muted-foreground hover:text-primary underline"
                                    onClick={() => navigate('/body-metrics')}
                                >
                                    update BMI
                                </Button>
                                {' '}for more accurate results
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <WorkoutStatsGraphPopup
                isOpen={!!selectedWorkout}
                onClose={() => setSelectedWorkout(null)}
                workout={selectedWorkout}
                getExerciseById={getExerciseById}
            />

             <AlertDialog open={!!workoutToDelete} onOpenChange={(open) => !open && setWorkoutToDelete(null)}>
                <AlertDialogContent className="bg-gym-dark-card border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone. This will permanently delete this workout.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setWorkoutToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard title="Total Workouts" value={stats.totalWorkouts} icon={Dumbbell} />
                <StatsCard title="Total Time" value={formatDuration(stats.totalTime)} icon={Clock} />
                <StatsCard title="Total Sets" value={stats.totalSets} icon={ListChecks} />
                <StatsCard title="Total Reps" value={stats.totalReps} icon={Repeat} />
            </div>

            <div className="card-glass p-4">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h2 className="text-xl font-semibold">Workout History</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="flex items-center gap-1">
                                    <ArchiveRestore className="h-4 w-4" /> Filter ({filterType.charAt(0).toUpperCase() + filterType.slice(1)})
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleFilterChange('day')}>Day</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleFilterChange('week')}>Week</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleFilterChange('month')}>Month</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleFilterChange('all')}>All</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="outline" size="sm" onClick={() => handleToggleAll(true)} className="flex items-center gap-1"><ChevronsRight className="h-4 w-4" /> Expand All</Button>
                        <Button variant="outline" size="sm" onClick={() => handleToggleAll(false)} className="flex items-center gap-1"><ChevronsLeft className="h-4 w-4" /> Collapse All</Button>
                        <DateRangePicker 
                            value={dateRange} 
                            onDateChange={setDateRange} 
                            calendarClassName="p-3 origin-top-right w-96"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    {filteredAndSortedWorkouts.map(workout => {
                        const workoutType = getWorkoutType(workout as Workout);
                        return (
                        <Collapsible 
                            key={workout.id} 
                            className="group bg-gym-darker rounded-lg border border-gray-700 transition-colors hover:border-gym-blue"
                            open={openWorkouts[workout.id]}
                            onOpenChange={(isOpen) => setOpenWorkouts(prev => ({ ...prev, [workout.id]: isOpen }))}
                        >
                            <CollapsibleTrigger className="w-full p-4 text-left">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{workout.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
                                            <span>{format(new Date(workout.startTime), 'MMMM d, yyyy - h:mm a')}</span>
                                            <span className="hidden sm:inline">|</span>
                                            <span>Duration: {formatDuration(workout.totalTime || 0)}</span>
                                            {workoutType && workoutType !== 'General' && (
                                                <>
                                                <span className="hidden sm:inline">|</span>
                                                <span className="font-medium text-gym-blue">{workoutType}</span>
                                                </>
                                            )}
                                            <span className="hidden sm:inline">|</span>
                                            <span>{formatCalories(calculateCalories((workout.totalTime || 0) / 60, 70, workoutType === 'Cardio' || workoutType === 'Slide Board'))}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <Button size="icon" variant="ghost" onClick={(e) => handleRerunWorkout(e, workout as Workout)}><Play className="h-4 w-4 text-green-500" /></Button>
                                        {/* The DropdownMenu below was removed to revert to the previous state */}
                                        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedWorkout(workout as Workout);}}><BarChart2 className="h-4 w-4 text-blue-500" /></Button>
                                        {editingWorkoutId === workout.id ? (
                                            <>
                                                <Button size="icon" variant="ghost" onClick={(e) => handleSave(e, workout.id)}><Save className="h-4 w-4 text-green-500" /></Button>
                                                <Button size="icon" variant="ghost" onClick={handleCancel}><X className="h-4 w-4" /></Button>
                                            </>
                                        ) : (
                                            <Button size="icon" variant="ghost" onClick={(e) => handleEdit(e, workout.id, workout.notes)}><Edit className="h-4 w-4" /></Button>
                                        )}
                                        <Button size="icon" variant="ghost" onClick={(e) => handleDelete(e, workout.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                        <ChevronDown className="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                    </div>
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-4 pb-4 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                                {editingWorkoutId === workout.id ? (
                                    <div className="mt-2">
                                        <Textarea
                                            value={editedNotes}
                                            onChange={(e) => setEditedNotes(e.target.value)}
                                            placeholder="Add workout notes..."
                                            className="bg-gym-dark border-gray-600"
                                        />
                                    </div>
                                ) : (
                                    workout.notes && <p className="mt-2 text-gray-300 whitespace-pre-wrap">{workout.notes}</p>
                                )}

                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-gray-400">
                                            <tr>
                                                <th className="p-2">Exercise</th>
                                                <th className="p-2 text-right">Sets</th>
                                                <th className="p-2 text-right">Reps</th>
                                                <th className="p-2 text-right">Weight</th>
                                                <th className="p-2 text-right">Time</th>
                                                <th className="p-2 text-right">Dist</th>
                                                <th className="p-2 text-right">Incline</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {workout.exercises.map((exerciseId, index) => {
                                                const exercise = getExerciseById(exerciseId);
                                                const setsForExercise = workout.sets.filter(s => s.exerciseId === exerciseId && s.completed);
                                                
                                                if (!exercise) {
                                                    return (
                                                        <tr key={`not-found-${index}-${exerciseId}`} className="border-t border-gray-700">
                                                            <td className="p-2 font-medium text-red-400 italic">Exercise not found (ID: {exerciseId})</td>
                                                            <td className="p-2 text-right">-</td>
                                                            <td className="p-2 text-right">-</td>
                                                            <td className="p-2 text-right">-</td>
                                                            <td className="p-2 text-right">-</td>
                                                            <td className="p-2 text-right">-</td>
                                                            <td className="p-2 text-right">-</td>
                                                        </tr>
                                                    );
                                                }

                                                const totalReps = setsForExercise.reduce((sum, set) => sum + (set.reps || 0), 0);
                                                const avgWeight = setsForExercise.length > 0 && setsForExercise.some(s => s.weight) ? setsForExercise.reduce((sum, set) => sum + (set.weight || 0), 0) / setsForExercise.filter(s => s.weight).length : 0;
                                                const totalTime = setsForExercise.reduce((sum, set) => sum + (set.time || 0), 0);
                                                const totalDistance = setsForExercise.reduce((sum, set) => sum + (set.distance || 0), 0);
                                                
                                                let avgInclineDisplay = '-';
                                                if (exercise.category === 'Slide Board') {
                                                    const inclines = setsForExercise.map(s => s.incline).filter(inc => typeof inc === 'number');
                                                    if (inclines.length > 0) {
                                                        const avgIncline = inclines.reduce((sum, inc) => sum + inc!, 0) / inclines.length;
                                                        avgInclineDisplay = `${avgIncline.toFixed(0)}`; // Display as rounded whole number
                                                    }
                                                }

                                                return (
                                                    <tr key={index} className="border-t border-gray-700">
                                                        <td className="p-2 font-medium">{exercise.name}</td>
                                                        <td className="p-2 text-right">{setsForExercise.length}</td>
                                                        <td className="p-2 text-right">{totalReps || '-'}</td>
                                                        <td className="p-2 text-right">{!isNaN(avgWeight) && avgWeight > 0 ? `${avgWeight.toFixed(1)} lbs` : '-'}</td>
                                                        <td className="p-2 text-right">{totalTime ? formatDuration(totalTime) : '-'}</td>
                                                        <td className="p-2 text-right">{totalDistance ? `${totalDistance.toFixed(2)} mi` : '-'}</td>
                                                        <td className="p-2 text-right">{avgInclineDisplay}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    )})}
                     {filteredAndSortedWorkouts.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No workouts found for the selected date range.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Stats;
 