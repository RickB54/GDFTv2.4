
import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { format } from 'date-fns';
import type { Workout } from '@/lib/data';
// The Exercise type is not exported from the context, so we use `any` here as a workaround to fix the build error.
// import type { Exercise } from '@/contexts/ExerciseContext';

interface WorkoutStatsGraphPopupProps {
    isOpen: boolean;
    onClose: () => void;
    workout: Workout | null;
    getExerciseById: (id: string) => any;
}

const chartConfig = {
  sets: { label: "Sets", color: "hsl(var(--chart-1))" },
  reps: { label: "Reps", color: "hsl(var(--chart-2))" },
  weight: { label: "Avg. Weight (lbs)", color: "hsl(var(--chart-3))" },
  time: { label: "Time (s)", color: "hsl(var(--chart-4))" },
  distance: { label: "Distance (mi)", color: "hsl(var(--chart-5))" },
  incline: { label: "Incline", color: "hsl(var(--chart-6))" }, // Assuming a chart-6 variable exists for color
};

const WorkoutStatsGraphPopup = ({ isOpen, onClose, workout, getExerciseById }: WorkoutStatsGraphPopupProps) => {

    const { weightChartData, cardioChartData } = useMemo(() => {
        const weightData: any[] = [];
        const cardioData: any[] = [];

        if (!workout) return { weightChartData: [], cardioChartData: [] };

        workout.exercises.forEach(exerciseId => {
            const exercise = getExerciseById(exerciseId);
            if (!exercise) return;

            const setsForExercise = workout.sets.filter(s => s.exerciseId === exerciseId);
            if(setsForExercise.length === 0) return;

            const totalReps = setsForExercise.reduce((sum, set) => sum + (set.reps || 0), 0);
            const setsWithWeight = setsForExercise.filter(s => s.weight);
            const avgWeight = setsWithWeight.length > 0 ? setsWithWeight.reduce((sum, set) => sum + (set.weight || 0), 0) / setsWithWeight.length : 0;
            const totalTime = setsForExercise.reduce((sum, set) => sum + (set.time || 0), 0);
            const totalDistance = setsForExercise.reduce((sum, set) => sum + (set.distance || 0), 0);
            
            let avgIncline = 0;
            if (exercise.category === 'Slide Board') {
                const setsWithIncline = setsForExercise.filter(s => typeof s.incline === 'number');
                if (setsWithIncline.length > 0) {
                    avgIncline = setsWithIncline.reduce((sum, set) => sum + (set.incline || 0), 0) / setsWithIncline.length;
                }
            }

            const exerciseData: any = {
                name: exercise.name,
                sets: setsForExercise.length,
                reps: totalReps,
                weight: parseFloat(avgWeight.toFixed(1)),
                time: totalTime,
                distance: parseFloat(totalDistance.toFixed(2)),
            };

            if (exercise.category === 'Slide Board' && avgIncline > 0) {
                exerciseData.incline = Math.round(avgIncline);
            }

            const hasWeightMetrics = exerciseData.reps > 0 || exerciseData.weight > 0 || exerciseData.incline > 0;
            const hasCardioMetrics = exerciseData.time > 0 || exerciseData.distance > 0;

            if (hasWeightMetrics) {
                weightData.push(exerciseData);
            }
            if (hasCardioMetrics) {
                cardioData.push(exerciseData);
            }

            // If an exercise only has sets, add it to the weight chart.
            if (!weightData.includes(exerciseData) && !cardioData.includes(exerciseData) && exerciseData.sets > 0) {
                weightData.push(exerciseData);
            }
        });
        return { weightChartData: weightData, cardioChartData: cardioData };
    }, [workout, getExerciseById]);

    if (!workout) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl bg-gym-dark-card border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-white text-2xl">{workout.name}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {format(new Date(workout.startTime), 'MMMM d, yyyy - h:mm a')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-8 py-4 max-h-[70vh] overflow-y-auto">
                    {weightChartData.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Weight Training Stats</h3>
                            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                                <BarChart data={weightChartData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" tickLine={false} tickMargin={10} angle={-45} textAnchor="end" height={80} stroke="white" />
                                    <YAxis yAxisId="left" stroke="white" />
                                    <YAxis yAxisId="right" orientation="right" stroke="white" />
                                    <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
                                    <Legend />
                                    <Bar dataKey="reps" fill={chartConfig.reps.color} radius={4} yAxisId="left" />
                                    <Bar dataKey="weight" fill={chartConfig.weight.color} radius={4} yAxisId="right" />
                                    <Bar dataKey="sets" fill={chartConfig.sets.color} radius={4} yAxisId="left" />
                                    {/* Add Incline bar only if there's incline data in the set for this chart type */}
                                    {weightChartData.some(d => d.incline > 0) && (
                                        <Bar dataKey="incline" fill={chartConfig.incline.color} radius={4} yAxisId="left" />
                                    )}
                                </BarChart>
                            </ChartContainer>
                        </div>
                    )}
                    {cardioChartData.length > 0 && (
                        <div>
                             <h3 className="text-lg font-semibold text-white mb-4">Cardio Stats</h3>
                             <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                                <BarChart data={cardioChartData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)"/>
                                    <XAxis dataKey="name" tickLine={false} tickMargin={10} angle={-45} textAnchor="end" height={80} stroke="white" />
                                    <YAxis yAxisId="left" label={{ value: 'Time (s)', angle: -90, position: 'insideLeft', fill: 'white' }} stroke="white" />
                                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Distance (mi)', angle: 90, position: 'insideRight', fill: 'white' }} stroke="white" />
                                    <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(255,255,255,0.1)' }}/>
                                    <Legend />
                                    <Bar dataKey="time" fill={chartConfig.time.color} radius={4} yAxisId="left" />
                                    <Bar dataKey="distance" fill={chartConfig.distance.color} radius={4} yAxisId="right" />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default WorkoutStatsGraphPopup;
