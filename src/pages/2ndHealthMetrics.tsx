// Final version - 20231027
import React, { useState, useEffect, useCallback } from 'react';
import { useWorkout, HealthMetric } from '@/contexts/WorkoutContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const SecondHealthMetricsPage: React.FC = () => {
  const { healthMetrics, addHealthMetric, updateHealthMetric } = useWorkout();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMetricId, setCurrentMetricId] = useState<string | null>(null);

  const [sleepDurationHours, setSleepDurationHours] = useState<string>('');
  const [sleepQualityRating, setSleepQualityRating] = useState<string>('');
  const [waterIntakeMl, setWaterIntakeMl] = useState<string>('');
  const [waterIntakeUnit, setWaterIntakeUnit] = useState<'ml' | 'fl oz'>('ml');
  const [stressLevelRating, setStressLevelRating] = useState<string>('');
  const [stepsTaken, setStepsTaken] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [caloriesBurned, setCaloriesBurned] = useState<string>('');
  const [calorieIntake, setCalorieIntake] = useState<string>('');
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState<string>('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState<string>('');
  const [glucose, setGlucose] = useState<string>('');
  const [glucoseUnit, setGlucoseUnit] = useState<'mg/dL' | 'mmol/L'>('mg/dL');
  const [notes, setNotes] = useState<string>('');

  const resetForm = useCallback(() => {
    setSleepDurationHours('');
    setSleepQualityRating('');
    setWaterIntakeMl('');
    setStressLevelRating('');
    setStepsTaken('');
    setHeartRate('');
    setCaloriesBurned('');
    setCalorieIntake('');
    setBloodPressureSystolic('');
    setBloodPressureDiastolic('');
    setGlucose('');
    setNotes('');
    setCurrentMetricId(null);
  }, []);

  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const existingMetric = healthMetrics.find(hm => hm.date === dateString);

    if (existingMetric) {
      setSleepDurationHours(existingMetric.sleepDurationHours?.toString() || '');
      setSleepQualityRating(existingMetric.sleepQualityRating?.toString() || '');
      setWaterIntakeMl(existingMetric.waterIntakeMl?.toString() || '');
      setStressLevelRating(existingMetric.stressLevelRating?.toString() || '');
      setStepsTaken(existingMetric.stepsTaken?.toString() || '');
      setHeartRate(existingMetric.heartRate?.toString() || '');
      setCaloriesBurned(existingMetric.caloriesBurned?.toString() || '');
      setCalorieIntake(existingMetric.calorieIntake?.toString() || '');
      setBloodPressureSystolic(existingMetric.bloodPressureSystolic?.toString() || '');
      setBloodPressureDiastolic(existingMetric.bloodPressureDiastolic?.toString() || '');
      setGlucose(existingMetric.glucose?.toString() || '');
      setNotes(existingMetric.notes || '');
      setCurrentMetricId(existingMetric.id);
    } else {
      resetForm();
    }
  }, [selectedDate, healthMetrics, resetForm]);

  const handleSave = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    
    let waterIntakeFinal = waterIntakeMl ? parseInt(waterIntakeMl) : undefined;
    if (waterIntakeUnit === 'fl oz' && waterIntakeFinal) {
      waterIntakeFinal = Math.round(waterIntakeFinal * 29.5735);
    }

    let glucoseFinal = glucose ? parseFloat(glucose) : undefined;
    if (glucoseUnit === 'mmol/L' && glucoseFinal) {
        glucoseFinal = Math.round(glucoseFinal * 18.0182);
    }

    const metricData: Omit<HealthMetric, 'id' | 'workoutId'> = {
      date: dateString,
      sleepDurationHours: sleepDurationHours ? parseFloat(sleepDurationHours) : undefined,
      sleepQualityRating: sleepQualityRating ? parseInt(sleepQualityRating) : undefined,
      waterIntakeMl: waterIntakeFinal,
      stressLevelRating: stressLevelRating ? parseInt(stressLevelRating) : undefined,
      stepsTaken: stepsTaken ? parseInt(stepsTaken) : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined,
      caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : undefined,
      calorieIntake: calorieIntake ? parseInt(calorieIntake) : undefined,
      bloodPressureSystolic: bloodPressureSystolic ? parseInt(bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: bloodPressureDiastolic ? parseInt(bloodPressureDiastolic) : undefined,
      glucose: glucoseFinal, 
      notes: notes,
    };

    if (currentMetricId) {
      updateHealthMetric(currentMetricId, metricData);
    } else {
      addHealthMetric(metricData);
    }
    toast({ title: "Success", description: "Health metrics have been saved." });
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Comprehensive Health Metrics</h1>
      
      <div className="mb-4">
        <Label htmlFor="metric-date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <Label htmlFor="sleep-duration">Sleep Duration (hours)</Label>
          <Input id="sleep-duration" type="number" value={sleepDurationHours} onChange={(e) => setSleepDurationHours(e.target.value)} placeholder="e.g., 7.5" />
        </div>
        <div>
          <Label htmlFor="sleep-quality">Sleep Quality (1-5)</Label>
          <Input id="sleep-quality" type="number" value={sleepQualityRating} onChange={(e) => setSleepQualityRating(e.target.value)} placeholder="1 (Poor) - 5 (Excellent)" min="1" max="5" />
        </div>
        <div>
          <Label htmlFor="water-intake">Water Intake</Label>
          <div className="flex gap-2">
            <Input id="water-intake" type="number" value={waterIntakeMl} onChange={(e) => setWaterIntakeMl(e.target.value)} placeholder="e.g., 2000" className="flex-grow" />
            <Select value={waterIntakeUnit} onValueChange={(value: 'ml' | 'fl oz') => setWaterIntakeUnit(value)}>
                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="fl oz">fl oz</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="stress-level">Stress Level (1-5)</Label>
          <Input id="stress-level" type="number" value={stressLevelRating} onChange={(e) => setStressLevelRating(e.target.value)} placeholder="1 (Low) - 5 (High)" min="1" max="5" />
        </div>
        <div>
          <Label htmlFor="steps-taken">Daily Steps</Label>
          <Input id="steps-taken" type="number" value={stepsTaken} onChange={(e) => setStepsTaken(e.target.value)} placeholder="e.g., 10000" />
        </div>
        <div>
          <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
          <Input id="heart-rate" type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} placeholder="e.g., 60" />
        </div>
        <div>
          <Label htmlFor="calories-burned">Calories Burned (kcal)</Label>
          <Input id="calories-burned" type="number" value={caloriesBurned} onChange={(e) => setCaloriesBurned(e.target.value)} placeholder="e.g., 500" />
        </div>
        <div>
          <Label htmlFor="calorie-intake">Calorie Intake (kcal)</Label>
          <Input id="calorie-intake" type="number" value={calorieIntake} onChange={(e) => setCalorieIntake(e.target.value)} placeholder="e.g., 2000" />
        </div>
        <div>
          <Label htmlFor="bp-systolic">Blood Pressure (Systolic mmHg)</Label>
          <Input id="bp-systolic" type="number" value={bloodPressureSystolic} onChange={(e) => setBloodPressureSystolic(e.target.value)} placeholder="e.g., 120" />
        </div>
        <div>
          <Label htmlFor="bp-diastolic">Blood Pressure (Diastolic mmHg)</Label>
          <Input id="bp-diastolic" type="number" value={bloodPressureDiastolic} onChange={(e) => setBloodPressureDiastolic(e.target.value)} placeholder="e.g., 80" />
        </div>
        <div>
          <Label htmlFor="glucose">Glucose</Label>
          <div className="flex gap-2">
            <Input id="glucose" type="number" value={glucose} onChange={(e) => setGlucose(e.target.value)} placeholder="e.g., 90" className="flex-grow" />
            <Select value={glucoseUnit} onValueChange={(value: 'mg/dL' | 'mmol/L') => setGlucoseUnit(value)}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mg/dL">mg/dL</SelectItem>
                  <SelectItem value="mmol/L">mmol/L</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="notes">General Notes</Label>
        <Textarea
          placeholder="Enter general notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
        />
      </div>

      <Button onClick={handleSave} className="w-full mt-4 bg-green-500 hover:bg-green-600">
        Save All Health Data
      </Button>
    </div>
  );
};

export default SecondHealthMetricsPage;