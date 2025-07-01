
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "@/components/layout/NavBar";
import { ExerciseProvider } from "@/contexts/ExerciseContext";
import { WorkoutProvider } from "@/contexts/WorkoutContext";
import { SettingsProvider } from './contexts/SettingsContext'; 

import Index from "./pages/Index";
import Exercises from "./pages/Exercises";
import CreateExercise from "./pages/CreateExercise";
import CreateWorkout from "./pages/CreateWorkout";
import Workout from "./pages/Workout";
import Stats from "./pages/Stats";
import Calendar from "./pages/Calendar";
import MyCalendar from "./pages/MyCalendar";
import SettingsPage from "./pages/Settings";
import CustomPlans from "./pages/CustomPlans";
import BodyMetricsPage from "./pages/BodyMetricsPage";
import SecondHealthMetricsPage from "./pages/2ndHealthMetrics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Add this function at the top of your App component
const isWebView = () => {
  return window.Android || 
         /Android.*wv|iPhone.*Mobile.*Safari|iPad.*Mobile.*Safari/.test(navigator.userAgent);
};

// In your App component, wrap BrowserRouter with basename if needed
function App() {
  const basename = isWebView() ? '' : undefined;
  
  return (
    <BrowserRouter basename={basename}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SettingsProvider>
            <ExerciseProvider>
              <WorkoutProvider>
                <div className="bg-gym-darker min-h-screen text-white flex flex-col">
                  <main className="flex-grow container mx-auto px-4 py-2 md:py-4">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/exercises" element={<Exercises />} />
                      <Route path="/create-exercise" element={<CreateExercise />} />
                      <Route path="/create-workout" element={<CreateWorkout />} />
                      <Route path="/workout" element={<Workout />} />
                      <Route path="/stats" element={<Stats />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/my-calendar" element={<MyCalendar />} />
                      <Route path="/custom-plans" element={<CustomPlans />} />
                      <Route path="/body-metrics" element={<BodyMetricsPage />} />
                      <Route path="/2nd-health-metrics" element={<SecondHealthMetricsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <NavBar />
                </div>
                <Toaster />
                <Sonner />
              </WorkoutProvider>
            </ExerciseProvider>
          </SettingsProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
