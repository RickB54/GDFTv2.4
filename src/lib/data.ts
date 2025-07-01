import { v4 as uuidv4 } from 'uuid';
import { ExerciseCategory } from './exerciseTypes'; // Import ExerciseCategory

// Original types (we'll keep them for reference or if they are used elsewhere, 
// but the Exercise interface will use the new relaxed types)
export type ExerciseCategoryOriginal = "Weights" | "Cardio" | "Slide Board" | "No Equipment" | "Custom";
export type EquipmentOriginal = "Barbell" | "Dumbbell" | "Bodyweight" | "Machine" | "Kettlebell" | 
  "Resistance Band" | "Cable" | "Slide Board" | "Treadmill" | 
  "Bike" | "Rower" | "Elliptical" | "Jump Rope" | "None";

export type MuscleGroupOriginal =
  | "Chest"
  | "Shoulders"
  | "Triceps"
  | "Biceps"
  | "Forearms"
  | "Quadriceps"
  | "Hamstrings"
  | "Glutes"
  | "Calves"
  | "Abdominals"
  | "Back"
  | "Cardiovascular"
  | "Adductors"
  | "Abs"
  | "Legs"
  | "Full Body"
  | "Core"
  | "Upper Back"
  | "Inner Thigh"
  | "Outer Thigh"
  | "Lats"
  | "Obliques"
  | "Traps"
  | "Front Deltoids"
  | "Rear Deltoids"
  | "Arms"
  | "Lower Back"
  | "Hip Flexors"
  | "Lower Abs"
  | "Upper Chest";

// Relaxed override for ExerciseCategory, Equipment, and MuscleGroup types
// This allows plural forms to be used without type errors

// Extend the existing types with string to allow any string (including plurals)
export type RelaxedExerciseCategory = ExerciseCategoryOriginal | (string & {});
export type RelaxedEquipment = EquipmentOriginal | (string & {});
export type RelaxedMuscleGroup = MuscleGroupOriginal | (string & {});

export interface WeightSettings {
  sets: number;
  reps: number;
  weight: number;
}

export interface CardioSettings {
  time: number;
  distance: number;
}

export interface SlideboardSettings {
  incline: number;
  sets: number;
  reps: number;
}

export interface NoEquipmentSettings {
  time: number;
  sets: number;
  reps: number;
}

export type ExerciseSettings = WeightSettings | CardioSettings | SlideboardSettings | NoEquipmentSettings;

export interface Exercise {
  id: string;
  name: string;
  category: RelaxedExerciseCategory; // Changed from ExerciseCategory
  muscleGroups: RelaxedMuscleGroup[]; // Changed from MuscleGroup[]
  equipment: RelaxedEquipment; // Changed from Equipment;
  settings: ExerciseSettings;
  notes?: string;
  thumbnailUrl?: string;
  description?: string;
  pictureUrl?: string;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  weight?: number;
  reps?: number;
  time?: number;
  distance?: number;
  incline?: number;
  duration?: number;
  completed: boolean;
  timestamp: number;
}

export interface Workout {
  id: string;
  name: string;
  exercises: string[];
  sets: WorkoutSet[];
  startTime: number;
  endTime?: number;
  totalTime?: number;
  type: ExerciseCategory | "Custom"; // Use ExerciseCategory
  notes?: string; // Added notes property here
  workoutPlanOverrides?: WorkoutPlanOverride[];
}

export interface SavedWorkoutTemplate {
  id: string;
  name: string;
  exercises: string[];
  type: ExerciseCategory | "Custom"; // Use ExerciseCategory
  createdAt: number;
  workoutPlanOverrides?: WorkoutPlanOverride[];
}

export interface WorkoutPlanOverride {
  exerciseId: string;
  sets?: string;
  reps?: string;
  weight?: string;
  distance?: string;
  time?: string;
  incline?: string;
}

const sampleWorkouts: Workout[] = [];
const sampleTemplates: SavedWorkoutTemplate[] = [];

export const generateId = (): string => {
  return uuidv4();
};

export const getExercises = (): Exercise[] => {
  try {
    const stored = localStorage.getItem('exercises');
    // Combine all exercise arrays if nothing is in storage
    if (!stored) {
      const defaultExercises = [...slideboardExercises, ...cardioExercises, ...weightExercises, ...noEquipmentExercises];
      return defaultExercises;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error getting exercises:', error);
    // Return all default exercises if there's an error
    return [...slideboardExercises, ...cardioExercises, ...weightExercises, ...noEquipmentExercises];
  }
};

export const saveExercises = (exercises: Exercise[]): void => {
  try {
    localStorage.setItem('exercises', JSON.stringify(exercises));
  } catch (error) {
    console.error('Error saving exercises:', error);
  }
};

export const getWorkouts = (): Workout[] => {
  try {
    const stored = localStorage.getItem('workouts');
    return stored ? JSON.parse(stored) : sampleWorkouts;
  } catch (error) {
    console.error('Error getting workouts:', error);
    return sampleWorkouts;
  }
};

export const saveWorkouts = (workouts: Workout[]): void => {
  try {
    localStorage.setItem('workouts', JSON.stringify(workouts));
  } catch (error) {
    console.error('Error saving workouts:', error);
  }
};

export const getSavedWorkoutTemplates = (): SavedWorkoutTemplate[] => {
  try {
    const stored = localStorage.getItem('savedWorkoutTemplates');
    return stored ? JSON.parse(stored) : sampleTemplates;
  } catch (error) {
    console.error('Error getting workout templates:', error);
    return sampleTemplates;
  }
};

export const saveSavedWorkoutTemplates = (templates: SavedWorkoutTemplate[]): void => {
  try {
    localStorage.setItem('savedWorkoutTemplates', JSON.stringify(templates));
  } catch (error) {
    console.error('Error saving workout templates:', error);
  }
};

export const exercisesToCSV = (exercises: Exercise[]): string => {
  const headers = [
    'Name',
    'Category',
    'Muscle Groups',
    'Equipment',
    'Notes',
    'Description',
    'Picture URL'
  ].join(',');
  
  const rows = exercises.map(ex => {
    return [
      `"${ex.name?.replace(/"/g, '""') || ''}"`,
      `"${ex.category || ''}"`,
      `"${Array.isArray(ex.muscleGroups) ? ex.muscleGroups.join(', ') : ''}"`,
      `"${ex.equipment || ''}"`,
      `"${ex.notes?.replace(/"/g, '""') || ''}"`,
      `"${ex.description?.replace(/"/g, '""') || ''}"`,
      `"${ex.pictureUrl?.replace(/"/g, '""') || ex.thumbnailUrl?.replace(/"/g, '""') || ''}"`
    ].join(',');
  });
  
  return [headers, ...rows].join('\n');
};

export const parseCSVData = (csvText: string): Exercise[] => {
  try {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1).map(line => {
      // Basic CSV parsing: handles commas within quoted fields
      const values: string[] = [];
      let currentValue = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue); // Add the last value
      
      // Strip quotes
      const cleanValues = values.map(val => {
        if (val.startsWith('"') && val.endsWith('"')) {
          return val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        return val;
      });
      
      // Map to exercise object
      const [name, category, muscleGroupsStr, equipment, notes, description, pictureUrl] = cleanValues;
      const muscleGroups = muscleGroupsStr ? muscleGroupsStr.split(',').map(g => g.trim()) as RelaxedMuscleGroup[] : []; // Changed to RelaxedMuscleGroup
      
      // Create default settings based on category
      let settings: ExerciseSettings;
      switch (category as RelaxedExerciseCategory) { // Changed to RelaxedExerciseCategory
        case 'Weights':
          settings = { sets: 3, reps: 10, weight: 40 };
          break;
        case 'Cardio':
          settings = { time: 30, distance: 2 };
          break;
        case 'Slide Board':
          settings = { incline: 4, sets: 3, reps: 10 };
          break;
        case 'No Equipment':
        default:
          settings = { time: 60, sets: 3, reps: 10 };
          break;
      }
      
      return {
        id: generateId(),
        name,
        category: category as RelaxedExerciseCategory, // Changed to RelaxedExerciseCategory
        muscleGroups,
        equipment: equipment as RelaxedEquipment, // Changed to RelaxedEquipment
        settings,
        notes,
        description,
        thumbnailUrl: pictureUrl,
        pictureUrl: pictureUrl
      };
    });
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
};

export const slideboardExercises: Exercise[] = [
  {
    id: generateId(),
    name: "#1 Leg Pull",
    category: "Slide Board",
    muscleGroups: ["Core", "Legs"],
    equipment: "Slide Board",
    description: "Lie on your back on the slide board with your legs extended and feet on the reformer. Engage your core and pull your knees toward your chest, sliding your feet along the board. Keep your movements controlled to avoid jerking. Exhale as you pull in, and inhale as you extend your legs back out. This targets your core while engaging your legs for stability.",
    pictureUrl: "https://i.imgur.com/KRP2fbM.png",
    settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
  },
  {
    id: generateId(),
    name: "#2 Arm Pullover",
    category: "Slide Board",
    muscleGroups: ["Arms", "Core"],
    equipment: "Slide Board",
    description: "Lie on your back on the slide board with your arms extended overhead, holding the reformer bar. Engage your core and pull your arms down toward your hips in a smooth arc, keeping them straight. Slide your hands along the board as you move. Inhale as you return your arms overhead, maintaining control. This works your arms and core for stability.",
    pictureUrl: "https://i.imgur.com/JyFSW9N.png",
    settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
  },
  {
    id: generateId(),
    name: "#3 Butterfly",
    category: "Slide Board",
    muscleGroups: ["Chest", "Arms"],
    equipment: "Slide Board",
    description: "Sit on the slide board facing the reformer, holding the straps with both hands. Start with your arms extended out to the sides, then pull them inward in a wide arc, as if hugging a large ball, until your hands meet in front of your chest. Keep your elbows slightly bent and shoulders relaxed. Exhale as you pull in, and inhale as you open your arms back out. This targets your chest and arms.",
    pictureUrl: "https://i.imgur.com/rRdbWHP.png",
    settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
  },
  {
  id: generateId(),
  name: "#4 Seated Row",
  category: "Slide Board",
  muscleGroups: ["Back", "Arms"],
  equipment: "Slide Board",
  description: "Sit on the slide board facing the reformer with your legs extended and feet braced. Hold the straps with both hands, arms extended forward. Pull your elbows back, sliding your hands toward your waist, squeezing your shoulder blades together. Keep your back straight and core engaged throughout. Inhale as you extend your arms back out, maintaining control.",
  pictureUrl: "https://i.imgur.com/ciFuVIm.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#8 Cardio Pull",
  category: "Slide Board",
  muscleGroups: ["Cardiovascular", "Core"],
  equipment: "Slide Board",
  description: "Stand on the slide board with one foot on the reformer, holding the straps with both hands. Pull the straps toward your waist in a quick, rhythmic motion, engaging your core for stability. Alternate pulling with each arm to increase your heart rate. Keep your movements fast but controlled, breathing steadily. This boosts cardiovascular endurance while working your core.",
  pictureUrl: "https://i.imgur.com/7HPxGFA.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#10 Surfer",
  category: "Slide Board",
  muscleGroups: ["Full Body", "Core"],
  equipment: "Slide Board",
  description: "Stand on the slide board in a squat position, feet shoulder-width apart, facing sideways like a surfer. Hold the reformer bar for balance and shift your weight side to side, sliding your feet along the board. Rotate your torso as if paddling on a surfboard, engaging your core. Keep your knees bent and movements fluid. This works your full body with a focus on core stability.",
  pictureUrl: "https://i.imgur.com/FCOFO8E.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#11 Seated Bench Press",
  category: "Slide Board",
  muscleGroups: ["Chest", "Arms"],
  equipment: "Slide Board",
  description: "Sit on the slide board facing the reformer, holding the straps with both hands at chest level. Push your arms forward, extending them fully while sliding your hands along the board. Keep your shoulders down and chest lifted, exhaling as you press. Inhale as you return your hands to the starting position, maintaining control. This targets your chest and arms.",
  pictureUrl: "https://i.imgur.com/rY1wAkr.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#12 Hip Abduction",
  category: "Slide Board",
  muscleGroups: ["Outer Thigh", "Glutes"],
  equipment: "Slide Board",
  description: "Lie on your side on the slide board with your legs stacked and the bottom leg on the reformer. Lift your top leg upward, sliding it along the board, keeping it straight. Engage your glutes and outer thigh as you lift, exhaling on the way up. Inhale as you lower your leg back down with control. This strengthens your outer thighs and glutes.",
  pictureUrl: "https://i.imgur.com/n9A63em.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#13 Seated Curls",
  category: "Slide Board",
  muscleGroups: ["Biceps", "Arms"],
  equipment: "Slide Board",
  description: "Sit on the slide board facing the reformer, holding the straps with your palms up, arms extended. Bend your elbows to curl your hands toward your shoulders, sliding along the board. Keep your upper arms stationary and exhale as you curl. Inhale as you extend your arms back out, maintaining a slow, controlled motion. This targets your biceps and arms.",
  pictureUrl: "https://i.imgur.com/rZBPP7j.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#14 Tricep Extension",
  category: "Slide Board",
  muscleGroups: ["Triceps", "Arms"],
  equipment: "Slide Board",
  description: "Sit on the slide board facing away from the reformer, holding the straps with your arms overhead, elbows bent. Extend your arms upward, sliding your hands along the board, keeping your elbows close to your head. Exhale as you extend, feeling your triceps engage. Inhale as you bend your elbows to return to the starting position. This isolates your triceps and arms.",
  pictureUrl: "https://i.imgur.com/drGzCn1.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#15 Twister",
  category: "Slide Board",
  muscleGroups: ["Core", "Obliques"],
  equipment: "Slide Board",
  description: "Sit on the slide board with your knees bent, feet on the reformer, holding the straps. Twist your torso to one side, sliding your feet along the board, engaging your obliques. Return to the center and twist to the other side, keeping your core tight. Exhale with each twist, and move in a controlled rhythm. This works your core and obliques for rotational strength.",
  pictureUrl: "https://i.imgur.com/3SEKWGP.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#16 Hip Thigh Extension",
  category: "Slide Board",
  muscleGroups: ["Glutes", "Hamstrings"],
  equipment: "Slide Board",
  description: "Lie on your stomach on the slide board with your legs extended, feet on the reformer. Bend your knees to pull your heels toward your glutes, sliding along the board. Engage your glutes and hamstrings as you pull, exhaling on the effort. Inhale as you extend your legs back out, keeping the movement smooth. This targets your glutes and hamstrings.",
  pictureUrl: "https://i.imgur.com/JC3ojsQ.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#17 Pull Up",
  category: "Slide Board",
  muscleGroups: ["Back", "Arms"],
  equipment: "Slide Board",
  description: "Lie on your back on the slide board, holding the straps with your arms extended overhead. Pull your hands toward your chest, sliding along the board, as if performing a pull-up, engaging your back. Keep your elbows close to your body and exhale as you pull. Inhale as you extend your arms back overhead, maintaining control. This strengthens your back and arms.",
  pictureUrl: "https://i.imgur.com/ilzdIeL.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#18 Front Press",
  category: "Slide Board",
  muscleGroups: ["Chest", "Shoulders"],
  equipment: "Slide Board",
  description: "Stand on the slide board facing the reformer, holding the straps at chest height. Push your arms forward, extending them fully while sliding your hands along the board. Keep your shoulders down and core engaged, exhaling as you press. Inhale as you return your arms to the starting position, moving slowly. This targets your chest and shoulders.",
  pictureUrl: "https://i.imgur.com/vkZuf8u.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#19 Front Deltoid Raises",
  category: "Slide Board",
  muscleGroups: ["Front Deltoids", "Shoulders"],
  equipment: "Slide Board",
  description: "Stand on the slide board facing the reformer, holding the straps with your arms down. Raise your arms straight in front of you to shoulder height, sliding along the board. Keep your movements controlled and exhale as you lift. Inhale as you lower your arms back down, avoiding any swinging. This isolates your front deltoids and shoulders.",
  pictureUrl: "https://i.imgur.com/leYA7pf.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#20 Side Deltoid Raises",
  category: "Slide Board",
  muscleGroups: ["Shoulders", "Arms"],
  equipment: "Slide Board",
  description: "Stand on the slide board facing the reformer, holding the straps with your arms at your sides. Lift your arms out to the sides to shoulder height, sliding along the board, keeping them straight. Exhale as you raise, engaging your shoulders. Inhale as you lower your arms back down, maintaining control. This targets your shoulders and arms.",
  pictureUrl: "https://i.imgur.com/vYzPdYY.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#21 Rear Deltoid Raises",
  category: "Slide Board",
  muscleGroups: ["Rear Deltoids", "Back"],
  equipment: "Slide Board",
  description: "Stand on the slide board facing away from the reformer, holding the straps with your arms down. Bend forward slightly and lift your arms out to the sides, sliding along the board, focusing on your rear deltoids. Exhale as you lift, squeezing your shoulder blades together. Inhale as you lower your arms, keeping the motion smooth. This works your rear deltoids and back.",
  pictureUrl: "https://i.imgur.com/hJwqLU0.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#22 Laying Curls",
  category: "Slide Board",
  muscleGroups: ["Biceps", "Arms"],
  equipment: "Slide Board",
  description: "Lie on your back on the slide board, holding the straps with your palms up, arms extended by your sides. Curl your hands toward your shoulders, sliding along the board, keeping your elbows close to your body. Exhale as you curl, engaging your biceps. Inhale as you extend your arms back out, moving slowly. This isolates your biceps and arms.",
  pictureUrl: "https://i.imgur.com/RrBCQBX.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#23 Pulley Ab Crunch",
  category: "Slide Board",
  muscleGroups: ["Abs", "Core"],
  equipment: "Slide Board",
  description: "Kneel on the slide board facing the reformer, holding the straps with both hands near your forehead. Crunch forward, pulling your elbows toward your knees, sliding your body along the board. Engage your abs and exhale as you crunch. Inhale as you return to the starting position, keeping your core tight. This targets your abs and core.",
  pictureUrl: "https://i.imgur.com/3KSBK7t.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#24 Seated High Pull",
  category: "Slide Board",
  muscleGroups: ["Back", "Shoulders"],
  equipment: "Slide Board",
  description: "Sit on the slide board facing the reformer, holding the straps with your arms extended. Pull your hands toward your chin, elbows flaring out, sliding along the board, engaging your upper back. Exhale as you pull, keeping your shoulders down. Inhale as you extend your arms back out, maintaining a steady pace. This strengthens your back and shoulders.",
  pictureUrl: "https://i.imgur.com/mrFYvML.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#25 One Leg Squat",
  category: "Slide Board",
  muscleGroups: ["Quadriceps", "Glutes"],
  equipment: "Slide Board",
  description: "Stand on the slide board on one leg, with the other leg lifted, holding the reformer for balance. Lower into a squat on your standing leg, sliding your foot along the board, keeping your knee over your ankle. Exhale as you squat, engaging your glutes. Inhale as you stand back up, maintaining control. This works your quadriceps and glutes.",
  pictureUrl: "https://i.imgur.com/ZBH628K.png",
  settings: { incline: 0, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#26 Toe Raises",
  category: "Slide Board",
  muscleGroups: ["Calves", "Legs"],
  equipment: "Slide Board",
  description: "Stand on the slide board with your feet flat, holding the reformer for balance. Lift your heels off the board, sliding your toes along the surface, rising onto the balls of your feet. Exhale as you lift, engaging your calves. Inhale as you lower your heels back down, keeping the motion controlled. This targets your calves and legs.",
  pictureUrl: "https://i.imgur.com/IH0YGKF.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#27 Lunges",
  category: "Slide Board",
  muscleGroups: ["Quadriceps", "Glutes"],
  equipment: "Slide Board",
  description: "Stand on the slide board with one foot forward, the other on the reformer, holding the bar for balance. Slide your back foot backward into a lunge, lowering your back knee toward the board. Keep your front knee over your ankle and exhale as you lunge. Inhale as you slide back to the starting position, engaging your glutes. This works your quadriceps and glutes.",
  pictureUrl: "https://i.imgur.com/bseXvG3.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#28 Hamstring Pull",
  category: "Slide Board",
  muscleGroups: ["Hamstrings", "Glutes"],
  equipment: "Slide Board",
  description: "Lie on your back on the slide board with your heels on the reformer, legs extended. Pull your heels toward your glutes, sliding along the board, lifting your hips slightly. Engage your hamstrings and exhale as you pull. Inhale as you extend your legs back out, keeping your movements smooth. This targets your hamstrings and glutes.",
  pictureUrl: "https://i.imgur.com/q14LPWv.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#29 Inner Thigh Pull",
  category: "Slide Board",
  muscleGroups: ["Inner Thigh", "Adductors"],
  equipment: "Slide Board",
  description: "Lie on your side on the slide board with your bottom leg on the reformer, top leg bent and resting in front. Pull your bottom leg upward, sliding it along the board, engaging your inner thigh. Exhale as you pull, keeping your core stable. Inhale as you lower your leg back down, maintaining control. This strengthens your inner thighs and adductors.",
  pictureUrl: "https://i.imgur.com/Udj4quG.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#30 Kneeling Kickbacks",
  category: "Slide Board",
  muscleGroups: ["Glutes", "Hamstrings"],
  equipment: "Slide Board",
  description: "Kneel on the slide board with your hands on the reformer for support, one leg extended back. Slide your extended leg further back, lifting it slightly, engaging your glutes. Exhale as you kick back, keeping your core tight. Inhale as you return your leg to the starting position, moving slowly. This targets your glutes and hamstrings.",
  pictureUrl: "https://i.imgur.com/VZW4K3T.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#31 Side Bends",
  category: "Slide Board",
  muscleGroups: ["Obliques", "Core"],
  equipment: "Slide Board",
  description: "Stand on the slide board with your feet on the reformer, holding the bar for balance. Bend your torso to one side, sliding your hand down your leg, engaging your obliques. Exhale as you bend, keeping your core tight. Inhale as you return to the center, then repeat on the other side. This works your obliques and core.",
  pictureUrl: "https://i.imgur.com/nZUM7rv.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#32 Twisting Squat",
  category: "Slide Board",
  muscleGroups: ["Quadriceps", "Core"],
  equipment: "Slide Board",
  description: "Stand on the slide board with your feet shoulder-width apart, holding the reformer bar. Lower into a squat, then twist your torso to one side as you stand, sliding your feet along the board. Exhale as you twist, engaging your core. Inhale as you return to the center and squat again, then twist to the other side. This targets your quadriceps and core.",
  pictureUrl: "https://i.imgur.com/z3v3L9r.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#33 Tennis Backhand",
  category: "Slide Board",
  muscleGroups: ["Arms", "Core"],
  equipment: "Slide Board",
  description: "Stand on the slide board facing sideways, holding the strap with one hand like a tennis racket. Swing your arm across your body in a backhand motion, sliding your feet along the board, engaging your core. Exhale as you swing, keeping your movements controlled. Inhale as you return to the starting position, then repeat. This works your arms and core.",
  pictureUrl: "https://i.imgur.com/AVSjXhb.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#34 Laying High Pull",
  category: "Slide Board",
  muscleGroups: ["Back", "Shoulders"],
  equipment: "Slide Board",
  description: "Lie on your stomach on the slide board, holding the straps with your arms extended forward. Pull your hands toward your chin, elbows flaring out, sliding along the board, engaging your upper back. Exhale as you pull, keeping your shoulders down. Inhale as you extend your arms back out, maintaining control. This strengthens your back and shoulders.",
  pictureUrl: "https://i.imgur.com/DOLfwtk.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#35 Groin Stretch",
  category: "Slide Board",
  muscleGroups: ["Inner Thigh", "Adductors"],
  equipment: "Slide Board",
  description: "Sit on the slide board with your legs spread wide, feet on the reformer. Slide your feet outward as far as comfortable, feeling a stretch in your inner thighs, and hold the position. Keep your back straight and breathe deeply, exhaling as you deepen the stretch. Gently slide your feet back together to release. This stretches your inner thighs and adductors.",
  pictureUrl: "https://i.imgur.com/Hw4xttH.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#36 Hurdle Stretch",
  category: "Slide Board",
  muscleGroups: ["Hamstrings", "Glutes"],
  equipment: "Slide Board",
  description: "Sit on the slide board with one leg extended forward on the reformer, the other bent back like a hurdler. Slide your extended leg forward, keeping it straight, to feel a stretch in your hamstrings. Lean slightly forward, exhaling as you stretch, keeping your back straight. Hold for a moment, then switch legs and repeat. This stretches your hamstrings and glutes.",
  pictureUrl: "https://i.imgur.com/uqk4LU2.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
},
{
  id: generateId(),
  name: "#37, 38, 39 Leg extensions",
  category: "Slide Board ",
  muscleGroups: ["Quadriceps", "Legs"],
  equipment: "Slide Board ",
  description: "Sit on the slide board with your legs extended, feet on the reformer. Slide your feet forward, extending your legs fully, engaging your quadriceps. Exhale as you extend, keeping your core tight. Inhale as you bend your knees slightly to return, maintaining control. This targets your quadriceps and legs for strength. ",
  pictureUrl: "https://i.imgur.com/URQe2L2.png",
  settings: { incline: 4, sets: 3, reps: 10 } as SlideboardSettings,
}
];
export const weightExercises: Exercise[] = [
  {
    id: generateId(),
    name: "Bench Press",
    category: "Weights",
    muscleGroups: ["Chest", "Arms"],
    equipment: "Barbell",
    description: "Lie on a bench with a barbell above your chest, hands shoulder-width apart. Lower the bar to your chest, keeping your elbows at a 45-degree angle, then press it back up, exhaling as you push. Keep your feet flat on the ground and core engaged for stability. Avoid bouncing the bar off your chest. This builds strength in your chest and arms.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 80 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Dumbbell Curls",
    category: "Weights",
    muscleGroups: ["Biceps", "Arms"],
    equipment: "Dumbbells",
    description: "Stand with a dumbbell in each hand, palms facing forward, arms at your sides. Curl the weights toward your shoulders, keeping your elbows close to your body, exhaling as you lift. Lower the dumbbells back down slowly, inhaling as you go. Avoid swinging your body to maintain proper form. This targets your biceps and arms.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 30 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Deadlifts",
    category: "Weights",
    muscleGroups: ["Back", "Legs", "Core"],
    equipment: "Barbell",
    description: "Stand with feet hip-width apart, barbell on the ground in front of you. Bend at your hips and knees to grip the bar, keeping your back straight. Lift the bar by straightening your hips and knees, exhaling as you stand. Lower the bar back down with control, inhaling. Keep the bar close to your body to avoid strain. This strengthens your back, legs, and core.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 80 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Squats",
    category: "Weights",
    muscleGroups: ["Legs", "Glutes"],
    equipment: "Barbell",
    description: "Stand with a barbell across your upper back, feet shoulder-width apart. Lower your body by bending your knees and hips, keeping your chest up and back straight. Push back up to standing, exhaling as you rise. Inhale as you lower. Keep your knees in line with your toes. This builds leg and glute strength.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 80 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Overhead Press",
    category: "Weights",
    muscleGroups: ["Shoulders", "Arms"],
    equipment: "Barbell",
    description: "Stand with a barbell at chest height, hands slightly wider than shoulder-width. Press the bar overhead until your arms are fully extended, exhaling as you push. Lower the bar back to your chest, inhaling as you go. Keep your core engaged to avoid arching your back. This strengthens your shoulders and arms.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Bent-Over Rows",
    category: "Weights",
    muscleGroups: ["Back", "Arms"],
    equipment: "Barbell",
    description: "Stand with a barbell, hinge at your hips, and keep your back straight. Pull the bar toward your lower chest, squeezing your shoulder blades, exhaling as you pull. Lower the bar back down, inhaling as you go. Keep your core engaged to protect your back. This targets your back and arms.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Lunges",
    category: "Weights",
    muscleGroups: ["Legs", "Glutes"],
    equipment: "Dumbbells",
    description: "Hold a dumbbell in each hand, step forward with one leg, and lower your back knee toward the ground. Push back to standing, exhaling as you rise. Alternate legs or complete one side at a time. Keep your front knee over your ankle. This strengthens your legs and glutes.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Tricep Dips",
    category: "Weights",
    muscleGroups: ["Triceps", "Arms"],
    equipment: "Bench",
    description: "Sit on a bench with hands gripping the edge, legs extended. Slide off the bench and lower your body by bending your elbows, then push back up, exhaling as you rise. Keep your shoulders relaxed and core engaged. This targets your triceps and arms.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Kettlebell Swings",
    category: "Weights",
    muscleGroups: ["Glutes", "Core"],
    equipment: "Kettlebells",
    description: "Stand with feet shoulder-width apart, holding a kettlebell with both hands. Hinge at your hips and swing the kettlebell to chest height, using your glutes to power the movement. Let it swing back down, inhaling as it descends. Exhale as you swing up. This builds glute and core strength.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Dumbbell Shoulder Press",
    category: "Weights",
    muscleGroups: ["Shoulders", "Arms"],
    equipment: "Dumbbells",
    description: "Sit or stand with a dumbbell in each hand at shoulder height. Press the weights overhead until your arms are extended, exhaling as you push. Lower back to shoulder height, inhaling as you go. Keep your core engaged to avoid arching your back. This strengthens your shoulders and arms.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Barbell Hip Thrusts",
    category: "Weights",
    muscleGroups: ["Glutes", "Hamstrings"],
    equipment: "Barbell",
    description: "Sit on the ground with a barbell across your hips, upper back against a bench. Drive through your heels to lift your hips until your body forms a straight line, exhaling as you lift. Lower back down, inhaling. Keep your core engaged. This targets your glutes and hamstrings.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Lat Pulldowns",
    category: "Weights",
    muscleGroups: ["Back", "Arms"],
    equipment: "Pull-Up Bar",
    description: "Sit at a lat pulldown machine, grip the bar wider than shoulder-width. Pull the bar to your upper chest, squeezing your shoulder blades, exhaling as you pull. Return to the starting position, inhaling as you extend. Keep your core engaged to avoid leaning back. This strengthens your back and arms.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Dumbbell Rows",
    category: "Weights",
    muscleGroups: ["Back", "Arms"],
    equipment: "Dumbbells",
    description: "Place one hand and knee on a bench, holding a dumbbell in the other hand. Pull the dumbbell toward your hip, squeezing your shoulder blade, exhaling as you pull. Lower back down, inhaling. Keep your back straight. This targets your back and arms.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Chest Flys",
    category: "Weights",
    muscleGroups: ["Chest", "Arms"],
    equipment: "Dumbbells",
    description: "Lie on a bench with a dumbbell in each hand, arms extended above your chest. Lower the weights out to the sides in a wide arc, keeping a slight bend in your elbows, inhaling as you lower. Bring the weights back together, exhaling as you press. This strengthens your chest and arms.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Goblet Squats",
    category: "Weights",
    muscleGroups: ["Legs", "Glutes"],
    equipment: "Dumbbells",
    description: "Hold a dumbbell close to your chest with both hands, feet shoulder-width apart. Lower into a squat, keeping your chest up and knees over toes, inhaling as you lower. Push back up to standing, exhaling as you rise. This targets your legs and glutes.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Romanian Deadlifts",
    category: "Weights",
    muscleGroups: ["Hamstrings", "Glutes"],
    equipment: "Barbell",
    description: "Stand with a barbell, feet hip-width apart. Hinge at your hips to lower the bar toward the ground, keeping your back straight and legs slightly bent. Lift back up, exhaling as you stand. Keep the bar close to your legs. This strengthens your hamstrings and glutes.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 60 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Pull-Ups",
    category: "Weights",
    muscleGroups: ["Back", "Arms"],
    equipment: "Pull-Up Bar",
    description: "Hang from a pull-up bar with palms facing away, hands shoulder-width apart. Pull your body up until your chin is over the bar, exhaling as you lift. Lower back down with control, inhaling as you descend. Keep your core engaged. This builds back and arm strength.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Dumbbell Lateral Raises",
    category: "Weights",
    muscleGroups: ["Shoulders"],
    equipment: "Dumbbells",
    description: "Stand with a dumbbell in each hand, arms at your sides. Raise the weights out to the sides to shoulder height, keeping a slight bend in your elbows, exhaling as you lift. Lower back down, inhaling. Avoid shrugging your shoulders. This targets your shoulders.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Barbell Shrugs",
    category: "Weights",
    muscleGroups: ["Shoulders", "Back"],
    equipment: "Barbell",
    description: "Stand holding a barbell with hands shoulder-width apart. Shrug your shoulders toward your ears, exhaling as you lift, then lower back down, inhaling. Keep your arms straight and avoid rolling your shoulders. This strengthens your upper back and shoulders.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Incline Bench Press",
    category: "Weights",
    muscleGroups: ["Chest", "Arms"],
    equipment: "Barbell",
    description: "Lie on an incline bench with a barbell above your chest. Lower the bar to your upper chest, keeping elbows at a 45-degree angle, then press back up, exhaling as you push. Keep your core engaged. This targets your upper chest and arms.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 80 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Kettlebell Goblet Clean",
    category: "Weights",
    muscleGroups: ["Full Body", "Core"],
    equipment: "Kettlebells",
    description: "Stand with feet shoulder-width apart, holding a kettlebell. Pull the kettlebell to chest height, flipping it to rest against your forearm, exhaling as you lift. Lower back down, inhaling. Keep your core engaged for stability. This works your full body and core.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Dumbbell Front Raises",
    category: "Weights",
    muscleGroups: ["Shoulders"],
    equipment: "Dumbbells",
    description: "Stand with a dumbbell in each hand, palms facing down. Raise the weights to shoulder height in front of you, keeping arms straight, exhaling as you lift. Lower back down, inhaling. Avoid swinging the weights. This targets your shoulders.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Seated Cable Rows",
    category: "Weights",
    muscleGroups: ["Back", "Arms"],
    equipment: "Resistance Bands",
    description: "Sit at a cable machine with feet braced, holding the handle. Pull the handle toward your lower chest, squeezing your shoulder blades, exhaling as you pull. Return to the starting position, inhaling. Keep your back straight. This strengthens your back and arms.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Dumbbell Step-Ups",
    category: "Weights",
    muscleGroups: ["Legs", "Glutes"],
    equipment: "Dumbbells",
    description: "Hold a dumbbell in each hand, step onto a bench with one foot, and push up to stand. Step back down, alternating legs. Exhale as you step up, inhale as you step down. Keep your core engaged. This targets your legs and glutes.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Arnold Press",
    category: "Weights",
    muscleGroups: ["Shoulders", "Arms"],
    equipment: "Dumbbells",
    description: "Sit or stand with dumbbells at chest height, palms facing you. Press the weights overhead while rotating your palms to face forward, exhaling as you push. Lower back down, rotating palms inward, inhaling. This strengthens your shoulders and arms.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Barbell Lunges",
    category: "Weights",
    muscleGroups: ["Legs", "Glutes"],
    equipment: "Barbell",
    description: "Place a barbell across your upper back, step forward into a lunge, and lower your back knee toward the ground. Push back to standing, exhaling as you rise. Alternate legs. Keep your core engaged. This targets your legs and glutes.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Dumbbell Pullover",
    category: "Weights",
    muscleGroups: ["Chest", "Back"],
    equipment: "Dumbbells",
    description: "Lie on a bench with a dumbbell held above your chest with both hands. Lower the weight over your head in an arc, inhaling as you lower. Pull it back to the starting position, exhaling as you lift. This targets your chest and back.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Farmer's Carry",
    category: "Weights",
    muscleGroups: ["Full Body", "Core"],
    equipment: "Dumbbells",
    description: "Hold a heavy dumbbell in each hand, walk a set distance while keeping your posture upright and core engaged. Breathe steadily as you walk. Avoid leaning to one side. This builds full-body strength and core stability.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Dumbbell Thrusters",
    category: "Weights",
    muscleGroups: ["Full Body", "Legs"],
    equipment: "Dumbbells",
    description: "Hold dumbbells at shoulder height, squat down, then push up through your heels while pressing the weights overhead. Exhale as you press, inhale as you squat. Keep your core engaged. This works your full body and legs.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
  {
    id: generateId(),
    name: "Weighted Plank",
    category: "Weights",
    muscleGroups: ["Core", "Full Body"],
    equipment: "Medicine Ball",
    description: "Place a weight plate or medicine ball on your back while in a plank position. Hold the plank, keeping your body straight and core engaged, breathing steadily. Avoid sagging your hips. This strengthens your core and full body.",
    pictureUrl: "https://i.imgur.com/7Hptjkc.png",
    settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
  },
// Area A
{
  id: "area-a-machine-1",
  name: "CFA MTS Triceps Extension",
  category: "Weights",
  muscleGroups: ["Triceps"],
  equipment: "Machine",
  description: "Area A: Sit with your back against the pad, grip the handles, and extend your arms downward to target the triceps. Pause, then return slowly.",
  pictureUrl: "https://i.imgur.com/JFHWnTq.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-a-machine-2",
  name: "CFA MTS Biceps Curl",
  category: "Weights",
  muscleGroups: ["Biceps"],
  equipment: "Machine",
  description: "Area A: Sit with your back straight and grasp the handles. Curl your arms upward toward your shoulders, squeeze the biceps, then lower under control.",
  pictureUrl: "https://i.imgur.com/zsmZowi.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-a-machine-3",
  name: "CFA Cybex Eagle Row",
  category: "Weights",
  muscleGroups: ["Back", "Biceps"],
  equipment: "Machine",
  description: "Area A: Sit with chest against the pad, grip the handles, and pull them toward your torso. Squeeze your shoulder blades, then return slowly.",
  pictureUrl: "https://i.imgur.com/euwZt5k.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-a-machine-4",
  name: "CFA Cybex Eagle Overhand Press",
  category: "Weights",
  muscleGroups: ["Shoulders", "Triceps"],
  equipment: "Machine",
  description: "Area A: Sit upright, grip the handles with an overhand grip. Press the handles upward above your head. Return slowly without locking elbows.",
  pictureUrl: "https://i.imgur.com/TPbGegA.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-a-machine-5",
  name: "CFA Cybex Eagle Chest Press",
  category: "Weights",
  muscleGroups: ["Chest", "Triceps"],
  equipment: "Machine",
  description: "Area A: Sit with back against pad, grip handles and press forward until arms are extended. Return with control to starting position.",
  pictureUrl: "https://i.imgur.com/pkFuwC7.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-a-machine-6",
  name: "CFA Cybex Eagle Arm Curl",
  category: "Weights",
  muscleGroups: ["Biceps"],
  equipment: "Machine",
  description: "Area A: Sit with upper arms resting on pad. Grasp handles and curl toward shoulders. Squeeze, then lower with control.",
  pictureUrl: "https://i.imgur.com/0fqdN45.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-a-machine-7",
  name: "CFA Cybex Eagle Abdominal",
  category: "Weights",
  muscleGroups: ["Abs"],
  equipment: "Machine",
  description: "Area A: Sit and adjust the pad. Hold handles or pad and crunch forward by contracting your abs. Return slowly to start.",
  pictureUrl: "https://i.imgur.com/0IFfGt3.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},

// Area B
{
  id: "area-b-machine-1",
  name: "CFB MTS Decline Press",
  category: "Weights",
  muscleGroups: ["Lower Chest", "Triceps"],
  equipment: "Machine",
  description: "Area B: Sit and press the handles downward and forward. Focus on squeezing the lower chest. Return with control.",
  pictureUrl: "https://i.imgur.com/UF3rIqk.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-b-machine-2",
  name: "CFB MTS Incline Press",
  category: "Weights",
  muscleGroups: ["Upper Chest", "Shoulders"],
  equipment: "Machine",
  description: "Area B: Sit back, grip handles at chest height, press up and slightly forward. Squeeze at the top, lower slowly.",
  pictureUrl: "https://i.imgur.com/6ti9vCu.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-b-machine-3",
  name: "CFB MTS Shoulder Press",
  category: "Weights",
  muscleGroups: ["Shoulders", "Triceps"],
  equipment: "Machine",
  description: "Area B: Sit with back against the pad, grip handles at shoulder height. Press upward and return under control.",
  pictureUrl: "https://i.imgur.com/5OCfdpS.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},

// Area C
{
  id: "area-c-machine-1",
  name: "CFC MTS Row",
  category: "Weights",
  muscleGroups: ["Back"],
  equipment: "Machine",
  description: "Area C: Sit with chest against the pad, grip handles. Pull toward your sides, squeezing shoulder blades, return slowly.",
  pictureUrl: "https://i.imgur.com/K4a0ono.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-c-machine-2",
  name: "CFC MTS High Row",
  category: "Weights",
  muscleGroups: ["Upper Back", "Lats"],
  equipment: "Machine",
  description: "Area C: Grip the handles high and wide, pull downward and back to activate upper lats and rear delts. Return slowly.",
  pictureUrl: "https://i.imgur.com/ZbtgrFc.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-c-machine-3",
  name: "CFC MTS Front Pulldown",
  category: "Weights",
  muscleGroups: ["Lats", "Biceps"],
  equipment: "Machine",
  description: "Area C: Sit with bar overhead. Pull the handles down to shoulder level while squeezing the back, then return under control.",
  pictureUrl: "https://i.imgur.com/FC1OkzS.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},

// Area D
{
  id: "area-d-machine-1",
  name: "CFD MTS Abdominal Crunch",
  category: "Weights",
  muscleGroups: ["Abs"],
  equipment: "Machine",
  description: "Area D: Sit with chest against pad and grip handles. Contract abs to crunch forward. Slowly return with control.",
  pictureUrl: "https://i.imgur.com/BZXC951.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-d-machine-2",
  name: "CFD Cybex Torso Rotation",
  category: "Weights",
  muscleGroups: ["Obliques"],
  equipment: "Machine",
  description: "Area D: Sit and rotate your torso against resistance, squeezing your obliques. Return slowly and repeat other side.",
  pictureUrl: "https://i.imgur.com/1D4hsCM.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},

// Area E
{
  id: "area-e-machine-1",
  name: "CFE Precor Rear Delt / Pec Fly",
  category: "Weights",
  muscleGroups: ["Rear Delts", "Chest"],
  equipment: "Machine",
  description: "Area E: For rear delts, face the machine and pull handles back. For pec fly, face away and bring handles together. Use slow, controlled motion.",
  pictureUrl: "https://i.imgur.com/ovP5gqU.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-e-machine-2",
  name: "CFE Precor Prone Leg Curl",
  category: "Weights",
  muscleGroups: ["Hamstrings"],
  equipment: "Machine",
  description: "Area E: Lie face down on the pad. Position ankles under the roller. Curl your legs toward your glutes, then return slowly.",
  pictureUrl: "https://i.imgur.com/yoUYhsd.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-e-machine-3",
  name: "CFE Squat",
  category: "Weights",
  muscleGroups: ["Quads", "Glutes"],
  equipment: "Machine",
  description: "Area E: Position yourself under the pad or on platform, lower into squat with control, push up through heels to return.",
  pictureUrl: "https://i.imgur.com/AG75IEV.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},

// Area F
{
  id: "area-f-machine-1",
  name: "CFF Cybex Eagle Leg Press",
  category: "Weights",
  muscleGroups: ["Quads", "Glutes", "Hamstrings"],
  equipment: "Machine",
  description: "Area F: Sit with feet on platform, push through heels to extend legs. Avoid locking knees. Return slowly to start.",
  pictureUrl: "https://i.imgur.com/uAALthL.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-f-machine-2",
  name: "CFF TechnoGym Chest Incline",
  category: "Weights",
  muscleGroups: ["Chest", "Shoulders"],
  equipment: "Machine",
  description: "Area F: Sit with back against pad and handles at shoulder height. Press forward and upward, then return slowly.",
  pictureUrl: "https://i.imgur.com/cxeHHyY.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-f-machine-3",
  name: "CFF TechnoGym Upper Back",
  category: "Weights",
  muscleGroups: ["Upper Back", "Lats"],
  equipment: "Machine",
  description: "Area F: Sit and grip handles. Pull downward and back while squeezing shoulder blades. Return under control.",
  pictureUrl: "https://i.imgur.com/DL0WauR.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "area-f-machine-4",
  name: "CFF TechnoGym Pulldown",
  category: "Weights",
  muscleGroups: ["Back"],
  equipment: "Machine",
  description: "Area F: Sit with bar overhead, exhale pulling down to upper chest. Inhale return under control. Keep chest up and elbows close to body.",
  pictureUrl: "https://i.imgur.com/hNjhmqZ.jpg",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
  {
  id: "machine-1",
  name: "Hammer Strength MTS Row",
  category: "Weights",
  muscleGroups: ["Back", "Biceps"],
  equipment: "Machine",
  description: "A machine-based exercise targeting the upper and middle back, emphasizing a strong pull with the handles.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-2",
  name: "Hammer Strength MTS Pull",
  category: "Weights",
  muscleGroups: ["Back", "Biceps"],
  equipment: "Machine",
  description: "A machine exercise designed for developing back thickness and width, utilizing an overhead or angled pulling motion.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-3",
  name: "Matrix Cable Machine",
  category: "Weights",
  muscleGroups: ["Full Body"],
  equipment: "Machine",
  description: "Represents the range of exercises performable on a Matrix Cable Machine, allowing for adjustable resistance and movement patterns.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-4",
  name: "Hammer Strength MTS Biceps Curl",
  category: "Weights",
  muscleGroups: ["Biceps"],
  equipment: "Machine",
  description: "A machine-based exercise specifically designed to isolate and build strength in the biceps.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-5",
  name: "Hammer Strength MTS Shoulder Press",
  category: "Weights",
  muscleGroups: ["Shoulders", "Triceps"],
  equipment: "Machine",
  description: "A machine-assisted overhead press that targets the shoulder muscles, providing stability and controlled movement.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-6",
  name: "Hammer Strength MTS Triceps Extension",
  category: "Weights",
  muscleGroups: ["Triceps"],
  equipment: "Machine",
  description: "A machine-based exercise designed to isolate and strengthen the triceps muscles through an extension movement.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-7",
  name: "Hammer Strength MTS High Row",
  category: "Weights",
  muscleGroups: ["Back", "Biceps"],
  equipment: "Machine",
  description: "A machine-based rowing exercise with a high pull angle, focusing on developing the upper back and lats.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-8",
  name: "Chest Press Machine",
  category: "Weights",
  muscleGroups: ["Chest", "Shoulders", "Triceps"],
  equipment: "Machine",
  description: "Sit with your back flat against the pad. Grasp the handles with an overhand grip, and push forward until your arms are almost fully extended, without locking the elbows. Exhale as you press. Slowly return to the starting position, inhaling. This targets the pectoral muscles, anterior deltoids, and triceps.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-9",
  name: "Pectoral Fly Machine",
  category: "Weights",
  muscleGroups: ["Chest"],
  equipment: "Machine",
  description: "Sit with your back flat against the pad. Grasp the handles or place forearms on pads. Bring the handles together in a hugging motion, squeezing your chest muscles. Exhale during the squeeze. Slowly return to the start position, feeling a stretch in your chest, inhaling. This isolates the pectoral muscles.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-10",
  name: "Rear Delt Fly Machine",
  category: "Weights",
  muscleGroups: ["Shoulders", "Back"],
  equipment: "Machine",
  description: "Adjust the machine handles for rear deltoid flyes (usually facing the machine or handles moving backward). Grasp the handles and, keeping your arms mostly straight with a slight bend in the elbows, pull the handles back and outward, squeezing your shoulder blades together. Exhale as you pull. Slowly return to the starting position, inhaling. This targets the posterior deltoids, rhomboids, and mid-trapezius.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-11",
  name: "Lat Pulldown Machine",
  category: "Weights",
  muscleGroups: ["Back", "Biceps"],
  equipment: "Machine",
  description: "Sit at the machine, adjusting the knee pad for stability. Grasp the bar with a wide overhand grip. Pull the bar down towards your upper chest, squeezing your shoulder blades together and down. Exhale as you pull. Keep your torso upright. Slowly return the bar to the starting position, inhaling. This strengthens the latissimus dorsi, biceps, and other back muscles.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-12",
  name: "Seated Row Machine",
  category: "Weights",
  muscleGroups: ["Back", "Biceps"],
  equipment: "Machine",
  description: "Sit at the machine with your chest against the pad (if available) and feet braced. Grasp the handles. Pull the handles towards your lower chest/upper abdomen, squeezing your shoulder blades together. Exhale as you pull. Keep your back straight. Slowly return to the starting position, inhaling. This works the lats, rhomboids, traps, and biceps.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-13",
  name: "Leg Extension Machine",
  category: "Weights",
  muscleGroups: ["Quadriceps"],
  equipment: "Machine",
  description: "Sit on the machine with your back against the pad and shins under the roller pad. Adjust the pad so it's just above your ankles. Extend your legs to lift the weight until your legs are straight but not locked. Exhale as you extend. Squeeze your quads at the top. Slowly lower the weight back to the starting position, inhaling. This isolates the quadriceps muscles.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-14",
  name: "Seated Leg Curl Machine",
  category: "Weights",
  muscleGroups: ["Hamstrings"],
  equipment: "Machine",
  description: "Sit on the machine, adjusting the back pad and lap pad for a snug fit. Place the back of your lower legs on top of the padded lever. Curl your legs down and back as far as possible, exhaling and squeezing your hamstrings. Hold briefly. Slowly return to the starting position, inhaling. This targets the hamstring muscles.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-15",
  name: "Leg Press Machine",
  category: "Weights",
  muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
  equipment: "Machine",
  description: "Sit on the machine with your back and head resting against the padded support. Place your feet on the footplate about shoulder-width apart. Push the platform away by extending your knees and hips. Exhale as you press. Do not lock your knees. Slowly lower the platform by bending your knees and hips, inhaling, until your knees are at about a 90-degree angle. This works the quads, glutes, and hamstrings.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-16",
  name: "Hip Adduction Machine",
  category: "Weights",
  muscleGroups: ["Inner Thighs"],
  equipment: "Machine",
  description: "Sit on the machine with your legs placed inside the pads. Adjust the starting position so the pads are open. Squeeze your legs together against the resistance of the pads. Exhale as you squeeze. Hold the contraction briefly. Slowly return to the starting position by allowing your legs to open, inhaling. This targets the adductor muscles of the inner thighs.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-17",
  name: "Hip Abduction Machine",
  category: "Weights",
  muscleGroups: ["Outer Thighs", "Glutes"],
  equipment: "Machine",
  description: "Sit on the machine with your legs placed outside the pads. Adjust the starting position so the pads are close together. Push your legs outward against the resistance of the pads. Exhale as you push. Hold the contraction briefly. Slowly return to the starting position by allowing your legs to come together, inhaling. This targets the gluteus medius, minimus, and TFL (outer hips/thighs).",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-18",
  name: "Torso Rotation Machine",
  category: "Weights",
  muscleGroups: ["Obliques", "Core"],
  equipment: "Machine",
  description: "Sit on the machine, securing yourself. Grasp the handles or position your arms against the pads. Rotate your torso to one side against the resistance, exhaling. Keep the movement controlled and focus on your obliques. Slowly return to the center, inhaling, and then rotate to the other side. This strengthens the oblique muscles.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-19",
  name: "Back Extension Machine",
  category: "Weights",
  muscleGroups: ["Lower Back", "Glutes", "Hamstrings"],
  equipment: "Machine",
  description: "Sit on the machine with your back against the roller pad. Secure your legs. Lean backward against the resistance, extending your spine. Exhale as you extend. Focus on using your lower back, glutes, and hamstrings. Slowly return to the starting position, inhaling. Avoid overextending your back.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-20",
  name: "Assisted Pull-up Machine",
  category: "Weights",
  muscleGroups: ["Back", "Biceps", "Shoulders"],
  equipment: "Machine",
  description: "Set the desired assistance weight (less weight means more of your bodyweight). Kneel or stand on the assistance platform and grasp the pull-up handles with an overhand grip. Pull your body upwards until your chin is over the bar, exhaling. Squeeze your back muscles. Slowly lower yourself back to the starting position, inhaling. This works the lats, biceps, and shoulders.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-21",
  name: "Assisted Dip Machine",
  category: "Weights",
  muscleGroups: ["Triceps", "Chest", "Shoulders"],
  equipment: "Machine",
  description: "Set the desired assistance weight. Kneel or stand on the assistance platform and grasp the dip bars with a neutral grip. Press down to extend your arms, lifting your body, exhaling. Lean slightly forward to engage more chest, or stay upright for more triceps. Slowly lower yourself until your elbows are at about 90 degrees, inhaling. This targets triceps, chest, and shoulders.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-22",
  name: "Abdominal Crunch Machine",
  category: "Weights",
  muscleGroups: ["Abs", "Core"],
  equipment: "Machine",
  description: "Sit on the machine, placing your feet under the pads or flat on the floor. Grasp the handles or position your arms/chest against the upper pad. Curl your upper body forward and down, contracting your abdominal muscles. Exhale as you crunch. Slowly return to the starting position, inhaling. This targets the rectus abdominis and obliques.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-23",
  name: "Cable Triceps Pushdown",
  category: "Weights",
  muscleGroups: ["Triceps"],
  equipment: "Machine",
  description: "Stand facing a high cable pulley with an attachment (e.g., straight bar, rope). Grasp the attachment with an overhand grip (or neutral for rope). Keeping your elbows tucked close to your sides, extend your arms downward until they are fully straight, squeezing your triceps. Exhale as you push down. Slowly return to the starting position, inhaling. This isolates the triceps.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-24",
  name: "Cable Biceps Curl",
  category: "Weights",
  muscleGroups: ["Biceps", "Forearms"],
  equipment: "Machine",
  description: "Stand facing a low cable pulley with an attachment (e.g., straight bar, EZ bar, handle). Grasp the attachment with an underhand grip. Keeping your elbows tucked close to your sides, curl the attachment upward towards your shoulders, squeezing your biceps. Exhale as you curl. Slowly lower the attachment back to the starting position, inhaling. This targets the biceps.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
},
{
  id: "machine-25",
  name: "Standing Calf Raise Machine",
  category: "Weights",
  muscleGroups: ["Calves"],
  equipment: "Machine",
  description: "Position yourself in the machine with the pads resting on your shoulders and the balls of your feet on the edge of the platform, heels hanging off. Rise up onto the balls of your feet, extending your ankles as high as possible. Exhale as you rise. Squeeze your calf muscles at the top. Slowly lower your heels below the level of the platform, feeling a stretch in your calves, inhaling. This targets the gastrocnemius and soleus.",
  pictureUrl: "https://i.imgur.com/3rVPURt.png",
  settings: { sets: 3, reps: 10, weight: 40 } as WeightSettings,
} 
];

export const cardioExercises: Exercise[] = [
  {
    id: generateId(),
    name: "Treadmill Run",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "Treadmill",
    description: "Set the treadmill to a challenging speed and run at a steady pace, keeping your arms relaxed and swinging naturally. Maintain an upright posture and land lightly on your feet, breathing deeply and rhythmically. Increase the incline slightly for added intensity if desired. Focus on a consistent stride to build endurance. This improves cardiovascular health and leg strength.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 20, distance: 3 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Brisk Walking",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Walk at a brisk pace outdoors or on a treadmill, swinging your arms naturally to increase your heart rate. Keep your steps quick and consistent, breathing deeply as you move. Maintain an upright posture and avoid slouching. Add hills or increase your speed for more challenge. This improves cardiovascular health and leg endurance.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 30, distance: 2 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Elliptical Training",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Full Body"],
    equipment: "Elliptical",
    description: "Use the elliptical machine at a steady pace, engaging both your arms and legs to move the handles and pedals. Keep your posture upright and core engaged, breathing steadily as you work. Adjust the resistance or incline for added intensity. Focus on smooth, controlled movements. This provides a low-impact, full-body cardio workout.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 30, distance: 2 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Jump Rope",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "Jump Rope",
    description: "Jump rope at a steady pace, keeping your elbows close to your sides and wrists flicking the rope. Land softly on the balls of your feet, breathing rhythmically. Maintain an upright posture and avoid hunching. Increase speed or add tricks for intensity. This boosts cardiovascular fitness and leg endurance.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 15, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Cycling",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "Stationary Bike",
    description: "Ride a stationary bike at a challenging pace, keeping your core engaged and posture upright. Adjust resistance to simulate hills or sprints. Breathe deeply and maintain a smooth pedaling rhythm. This improves cardiovascular health and leg strength with low impact.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 30, distance: 3 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Rowing",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Full Body"],
    equipment: "Rowing Machine",
    description: "Use a rowing machine, driving through your legs, leaning back slightly, and pulling the handle to your chest. Return by extending your arms and bending your knees. Exhale as you pull, inhale as you return. Keep movements smooth to avoid strain. This works your full body and cardio system.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 20, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Stair Climbing",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "Stair Climber",
    description: "Use a stair climber or climb actual stairs at a steady pace, keeping your posture upright and core engaged. Hold the rails lightly for balance, not support. Breathe deeply and maintain a consistent rhythm. This boosts cardiovascular fitness and leg strength.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 20, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "High Knees",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Run in place, lifting your knees to hip height with each step, pumping your arms for momentum. Keep your core engaged and land softly on your feet. Exhale with each knee lift, breathing rhythmically. This increases heart rate and leg endurance.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Burpees",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Full Body"],
    equipment: "None",
    description: "From standing, squat down, place hands on the ground, jump back to a plank, do a pushup, then jump forward and leap up. Exhale as you jump up, inhale as you squat. Keep movements quick but controlled. This is a full-body cardio exercise.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Mountain Climbers",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Core"],
    equipment: "None",
    description: "Start in a plank position, rapidly alternate bringing your knees toward your chest, as if running horizontally. Keep your core engaged and hips stable, breathing quickly. Move at a steady pace to elevate your heart rate. This works your core and cardiovascular system.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Sprint Intervals",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Sprint at maximum effort for 20-30 seconds, then walk or jog slowly for 60 seconds. Repeat for several rounds, keeping your posture upright and arms pumping. Breathe deeply during recovery. This improves cardiovascular fitness and leg power.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Box Jumps",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "Box",
    description: "Stand in front of a sturdy box, jump onto it with both feet, landing softly, then step or jump back down. Exhale as you jump, inhale as you land. Keep your core engaged and knees slightly bent on landing. This boosts cardio and leg strength.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Skater Jumps",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Jump laterally to one side, landing on one foot while bringing the other leg behind you, then jump to the other side. Swing your arms for balance, exhaling with each jump. Keep movements quick and controlled. This improves cardio and leg agility.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Battle Ropes",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Arms"],
    equipment: "Resistance Bands",
    description: "Hold a battle rope in each hand, squat slightly, and alternate slamming the ropes to the ground in a wave motion. Keep your core engaged and move quickly, breathing steadily. This elevates your heart rate and works your arms and core.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Shadow Boxing",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Arms"],
    equipment: "None",
    description: "Throw punches in the air, moving your feet and bobbing side to side, as if sparring. Keep your core engaged and punches quick, breathing with each strike. Add jabs, crosses, and hooks for variety. This boosts cardio and arm endurance.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Tuck Jumps",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Jump straight up, tucking your knees toward your chest, then land softly. Exhale as you jump, inhale as you land. Keep your core engaged and movements explosive. This increases heart rate and leg power.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Lateral Shuffles",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Squat slightly and shuffle side to side, keeping your feet low to the ground and core engaged. Move quickly, breathing steadily, and stay light on your feet. This improves cardio and lateral agility.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Kickboxing Drills",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Full Body"],
    equipment: "None",
    description: "Perform a series of kicks, punches, and knee strikes in a fast-paced sequence, moving around as if sparring. Keep your core engaged and breathe with each strike. This boosts cardio and full-body coordination.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Fast Feet",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Run in place as fast as possible, keeping your feet low to the ground and arms pumping. Stay light on your feet, breathing quickly. Maintain an upright posture. This elevates your heart rate and improves leg speed.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Power Skips",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Skip forward, driving one knee high while pushing off with the other foot, swinging your opposite arm for momentum. Exhale with each skip, landing softly. This boosts cardio and leg power.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Medicine Ball Slams",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Full Body"],
    equipment: "Medicine Ball",
    description: "Hold a medicine ball overhead, squat slightly, and slam it to the ground with force, exhaling as you slam. Pick it up and repeat, keeping your core engaged. Move quickly to elevate your heart rate. This works your full body and cardio system.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Incline Treadmill Walk",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "Treadmill",
    description: "Set the treadmill to a steep incline and walk at a brisk pace, keeping your posture upright and arms swinging. Breathe deeply and maintain a steady rhythm. This increases cardio intensity and leg endurance.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 30, distance: 2 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Side-to-Side Hops",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Hop side to side over an imaginary line, landing softly on one foot before hopping to the other. Keep your core engaged and arms moving for balance, exhaling with each hop. This improves cardio and leg agility.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Rowing Sprints",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Full Body"],
    equipment: "Rowing Machine",
    description: "Row at maximum effort for 30 seconds, driving through your legs and pulling the handle quickly, then rest for 30 seconds. Repeat for several rounds, breathing deeply. This boosts cardio and full-body strength.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 15, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Cycle Sprints",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "Stationary Bike",
    description: "Pedal at maximum effort for 20-30 seconds on a stationary bike, then pedal slowly for 60 seconds. Repeat for several rounds, keeping your core engaged. This improves cardio and leg power.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 15, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Jumping Lunges",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Start in a lunge, jump up, and switch legs in mid-air, landing in a lunge on the opposite side. Exhale as you jump, keeping your core engaged. Move quickly but land softly. This boosts cardio and leg strength.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Broad Jumps",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Squat down, then jump forward as far as possible, landing softly with knees bent. Exhale as you jump, inhale as you land. Turn around and repeat. Keep your core engaged. This improves cardio and leg power.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Squat Jumps",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Squat down, then jump straight up explosively, reaching for the ceiling. Land softly, exhaling as you jump, inhaling as you squat. Keep your core engaged and knees over toes. This boosts cardio and leg strength.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 10, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Step Aerobics",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "Box",
    description: "Step up and down on a sturdy platform in a rhythmic pattern, swinging your arms for momentum. Keep your posture upright and core engaged, breathing steadily. Add arm movements for intensity. This improves cardio and leg endurance.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 15, distance: 0 } as CardioSettings,
  },
  {
    id: generateId(),
    name: "Zumba Dance",
    category: "Cardio",
    muscleGroups: ["Cardiovascular", "Full Body"],
    equipment: "None",
    description: "Follow a Zumba routine with fast-paced dance moves, incorporating salsa, hip-hop, and other styles. Keep your core engaged and move to the beat, breathing steadily. This boosts cardio and full-body coordination.",
    pictureUrl: "https://i.imgur.com/aiCPY1q.png",
    settings: { time: 20, distance: 0 } as CardioSettings,
  }
];

export const noEquipmentExercises: Exercise[] = [
  {
    id: generateId(),
    name: "Pushups",
    category: "No Equipment",
    muscleGroups: ["Chest", "Arms"],
    equipment: "None",
    description: "Start in a plank position with your hands shoulder-width apart, body in a straight line. Lower your chest toward the ground by bending your elbows, then push back up, exhaling as you press. Keep your core engaged and avoid sagging your hips. Inhale as you lower, maintaining control. This strengthens your chest and arms.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Plank Shoulder Taps",
    category: "No Equipment",
    muscleGroups: ["Core", "Shoulders"],
    equipment: "None",
    description: "Hold a plank position on your hands, then lift one hand to tap the opposite shoulder, keeping your hips stable. Alternate sides, exhaling with each tap, and maintain a straight body line. Engage your core to prevent twisting. Repeat for 30-60 seconds. This works your core and shoulders.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Jumping Jacks",
    category: "No Equipment",
    muscleGroups: ["Cardiovascular", "Full Body"],
    equipment: "None",
    description: "Stand with feet together and arms at your sides. Jump your feet out to the sides while raising your arms overhead, exhaling as you jump. Jump back to the starting position, inhaling as you return. Keep your movements quick and controlled, landing softly to avoid joint strain. This boosts cardiovascular fitness and engages the whole body.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Bodyweight Squats",
    category: "No Equipment",
    muscleGroups: ["Legs", "Glutes"],
    equipment: "None",
    description: "Stand with feet shoulder-width apart, toes slightly out. Lower your body by bending your knees and hips, keeping your chest up and back straight. Push back up to standing, exhaling as you rise. Inhale as you lower. Keep your knees in line with your toes. This strengthens your legs and glutes.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Lunges",
    category: "No Equipment",
    muscleGroups: ["Legs", "Glutes"],
    equipment: "None",
    description: "Step forward with one leg, lowering your back knee toward the ground while keeping your front knee over your ankle. Push back to standing, exhaling as you rise. Alternate legs or complete one side at a time. Keep your core engaged. This targets your legs and glutes.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Plank",
    category: "No Equipment",
    muscleGroups: ["Core", "Full Body"],
    equipment: "None",
    description: "Hold a plank position on your forearms or hands, keeping your body in a straight line from head to heels. Engage your core and breathe steadily, avoiding sagging or piking your hips. Hold for 30-60 seconds per set. This strengthens your core and full body.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 1 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Mountain Climbers",
    category: "No Equipment",
    muscleGroups: ["Cardiovascular", "Core"],
    equipment: "None",
    description: "Start in a plank position, rapidly alternate bringing your knees toward your chest, as if running horizontally. Keep your core engaged and hips stable, breathing quickly. Move at a steady pace to elevate your heart rate. This works your core and cardiovascular system.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Burpees",
    category: "No Equipment",
    muscleGroups: ["Cardiovascular", "Full Body"],
    equipment: "None",
    description: "From standing, squat down, place hands on the ground, jump back to a plank, do a pushup, then jump forward and leap up. Exhale as you jump up, inhale as you squat. Keep movements quick but controlled. This is a full-body cardio exercise.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "High Knees",
    category: "No Equipment",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Run in place, lifting your knees to hip height with each step, pumping your arms for momentum. Keep your core engaged and land softly on your feet. Exhale with each knee lift, breathing rhythmically. This increases heart rate and leg endurance.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Bicycle Crunches",
    category: "No Equipment",
    muscleGroups: ["Core"],
    equipment: "None",
    description: "Lie on your back with hands behind your head, legs lifted, and knees bent. Alternate touching your elbow to the opposite knee while extending the other leg out. Exhale as you twist, inhale as you switch sides. Keep your core engaged. This targets your core, especially obliques.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Wall Sit",
    category: "No Equipment",
    muscleGroups: ["Legs", "Glutes"],
    equipment: "None",
    description: "Lean against a wall and slide down until your thighs are parallel to the ground, knees at 90 degrees. Hold the position, keeping your core engaged and breathing steadily. Hold for 30-60 seconds per set. This strengthens your legs and glutes.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 0 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Tricep Dips (Chair)",
    category: "No Equipment",
    muscleGroups: ["Triceps", "Arms"],
    equipment: "None",
    description: "Sit on a chair or sturdy surface, hands gripping the edge, legs extended. Slide off and lower your body by bending your elbows, then push back up, exhaling as you rise. Keep your shoulders relaxed and core engaged. This targets your triceps and arms.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Side Plank (Left)",
    category: "No Equipment",
    muscleGroups: ["Core", "Obliques"],
    equipment: "None",
    description: "Lie on your left side, propped up on your left forearm, feet stacked. Lift your hips to form a straight line, holding the position while engaging your core. Breathe steadily. Hold for 30-60 seconds per set. This strengthens your core and obliques.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 0 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Side Plank (Right)",
    category: "No Equipment",
    muscleGroups: ["Core", "Obliques"],
    equipment: "None",
    description: "Lie on your right side, propped up on your right forearm, feet stacked. Lift your hips to form a straight line, holding the position while engaging your core. Breathe steadily. Hold for 30-60 seconds per set. This strengthens your core and obliques.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 0 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Russian Twists",
    category: "No Equipment",
    muscleGroups: ["Core", "Obliques"],
    equipment: "None",
    description: "Sit on the ground with knees bent, feet lifted slightly, and lean back slightly. Rotate your torso side to side, touching your hands to the ground on each side. Exhale as you twist, inhale as you center. This targets your core and obliques.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Leg Raises",
    category: "No Equipment",
    muscleGroups: ["Core", "Legs"],
    equipment: "None",
    description: "Lie on your back with legs extended. Lift your legs to a 90-degree angle, keeping them straight, then lower them back down without touching the ground. Exhale as you lift, inhale as you lower. Keep your core engaged to avoid arching your back. This strengthens your core and legs.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Superman Hold",
    category: "No Equipment",
    muscleGroups: ["Back", "Core"],
    equipment: "None",
    description: "Lie face down with arms extended forward. Lift your arms, chest, and legs off the ground, holding the position while engaging your core and back. Breathe steadily. Hold for 30-60 seconds per set. This strengthens your back and core.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 1 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Squat Jumps",
    category: "No Equipment",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Squat down, then jump straight up explosively, reaching for the ceiling. Land softly, exhaling as you jump, inhaling as you squat. Keep your core engaged and knees over toes. This boosts cardio and leg strength.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Tuck Jumps",
    category: "No Equipment",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Jump straight up, tucking your knees toward your chest, then land softly. Exhale as you jump, inhale as you land. Keep your core engaged and movements explosive. This increases heart rate and leg power.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Skater Jumps",
    category: "No Equipment",
    muscleGroups: ["Cardiovascular", "Legs"],
    equipment: "None",
    description: "Jump laterally to one side, landing on one foot while bringing the other leg behind you, then jump to the other side. Swing your arms for balance, exhaling with each jump. Keep movements quick and controlled. This improves cardio and leg agility.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Calf Raises",
    category: "No Equipment",
    muscleGroups: ["Calves"],
    equipment: "None",
    description: "Stand with feet hip-width apart, rise onto the balls of your feet, lifting your heels as high as possible. Lower back down slowly, exhaling as you rise, inhaling as you lower. Keep your core engaged for balance. This strengthens your calves.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Glute Bridges",
    category: "No Equipment",
    muscleGroups: ["Glutes", "Core"],
    equipment: "None",
    description: "Lie on your back with knees bent and feet flat, hip-width apart. Lift your hips toward the ceiling, squeezing your glutes, then lower back down. Exhale as you lift, inhale as you lower. Keep your core engaged. This strengthens your glutes and core.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Donkey Kicks (Left)",
    category: "No Equipment",
    muscleGroups: ["Glutes", "Legs"],
    equipment: "None",
    description: "On all fours, lift your left leg and kick it back and up, keeping the knee bent at 90 degrees. Lower back down without touching the ground. Exhale as you kick, inhale as you lower. This targets your glutes and legs.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Donkey Kicks (Right)",
    category: "No Equipment",
    muscleGroups: ["Glutes", "Legs"],
    equipment: "None",
    description: "On all fours, lift your right leg and kick it back and up, keeping the knee bent at 90 degrees. Lower back down without touching the ground. Exhale as you kick, inhale as you lower. This targets your glutes and legs.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Fire Hydrants (Left)",
    category: "No Equipment",
    muscleGroups: ["Glutes", "Legs"],
    equipment: "None",
    description: "On all fours, lift your left leg out to the side, keeping the knee bent at 90 degrees, then lower back down. Exhale as you lift, inhale as you lower. Keep your core engaged to avoid twisting. This strengthens your glutes and outer thighs.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Fire Hydrants (Right)",
    category: "No Equipment",
    muscleGroups: ["Glutes", "Legs"],
    equipment: "None",
    description: "On all fours, lift your right leg out to the side, keeping the knee bent at 90 degrees, then lower back down. Exhale as you lift, inhale as you lower. Keep your core engaged to avoid twisting. This strengthens your glutes and outer thighs.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Bird Dog",
    category: "No Equipment",
    muscleGroups: ["Core", "Back"],
    equipment: "None",
    description: "On all fours, extend your right arm forward and left leg back, keeping your body stable. Hold briefly, then switch sides. Exhale as you extend, inhale as you return. Keep your core engaged to avoid sagging. This improves core and back stability.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Sit-Ups",
    category: "No Equipment",
    muscleGroups: ["Core"],
    equipment: "None",
    description: "Lie on your back with knees bent and feet flat. Lift your torso toward your knees, engaging your core, then lower back down. Exhale as you lift, inhale as you lower. Keep your movements controlled to avoid straining your neck. This strengthens your core.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 20 } as NoEquipmentSettings,
  },
  {
    id: generateId(),
    name: "Inchworms",
    category: "No Equipment",
    muscleGroups: ["Core", "Full Body"],
    equipment: "None",
    description: "Stand, bend at the hips to touch the ground, walk your hands forward to a plank, then walk your feet toward your hands. Exhale as you walk out, inhale as you walk in. Keep your core engaged. This works your core and full body.",
    pictureUrl: "https://i.imgur.com/DjHjCRE.png",
    settings: { time: 60, sets: 3, reps: 10 } as NoEquipmentSettings,
  }
];
