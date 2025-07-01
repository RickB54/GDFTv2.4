
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { getExercises, saveExercises, cardioExercises, weightExercises, slideboardExercises, noEquipmentExercises } from './lib/data';

// Ensure all existing exercises are properly saved to localStorage on app initialization
const exercises = getExercises();

// If there are no exercises in localStorage, add the default exercises from all categories
if (exercises.length === 0) {
  // Combine all default exercise categories
  const defaultExercises = [...slideboardExercises, ...cardioExercises, ...weightExercises, ...noEquipmentExercises];
  
  saveExercises(defaultExercises);
  console.log(`Added ${defaultExercises.length} default exercises to local storage`);
  console.log(`Slide Board: ${slideboardExercises.length}, Cardio: ${cardioExercises.length}, Weights: ${weightExercises.length}, No Equipment: ${noEquipmentExercises.length}`);
} else {
  // Make sure all exercises are properly saved
  saveExercises(exercises);
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
console.log(`Ensured ${exercises.length} exercises are persisted to local storage`);
