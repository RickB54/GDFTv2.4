
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, ClipboardList, Dumbbell, SlidersHorizontal, HeartPulse, User, Plus, HelpCircle, LucideProps, Activity, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WorkoutTypeCard from '@/components/ui/WorkoutTypeCard';
import HomeHelpPopup from '@/components/ui/HomeHelpPopup';

interface HomeCardProps {
  icon: React.ComponentType<LucideProps>;
  title: string;
  description: string;
  onClick: () => void;
  color: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'teal' | 'pink'; // Added more color options for flexibility
  className?: string; // Allow passing additional classNames for sizing
}

const HomeCard = ({ icon: Icon, title, description, onClick, color, className }: HomeCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    orange: 'bg-orange-500/20 text-orange-400',
    teal: 'bg-teal-500/20 text-teal-400',
    pink: 'bg-pink-500/20 text-pink-400',
  };

  return (
    <div
      className={`bg-gym-card p-4 rounded-lg flex items-center cursor-pointer transition-colors hover:bg-gym-dark-card h-full ${className}`}
      onClick={onClick}
    >
      <div className={`p-3 rounded-lg mr-4 ${colorClasses[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-semibold text-md md:text-lg">{title}</h3> {/* Adjusted text size for smaller buttons if needed */}
        <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};


const Index = () => {
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const workoutTypes = [
    { title: "Standard Weights", icon: Dumbbell, color: "blue" as const, type: "Weights" },
    { title: "Slide Board", icon: SlidersHorizontal, color: "green" as const, type: "Slide Board" },
    { title: "Cardio", icon: HeartPulse, color: "red" as const, type: "Cardio" },
    { title: "No Equipment", icon: User, color: "purple" as const, type: "No Equipment" },
  ];

  return (
    <div className="page-container page-transition pb-20">
      <HomeHelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">GymDayFitTracker</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)}>
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>

      <div className="space-y-4 mb-8">
        {/* Monitor Progress - Full Width */}
        <HomeCard
          icon={BarChart}
          title="Monitor Progress"
          description="View your stats and body measurements"
          onClick={() => navigate('/stats')}
          color="blue"
        />

        {/* Create Plans & Your Custom Plans - Two per row */}
        <div className="grid grid-cols-2 gap-4">
          <HomeCard
            icon={ClipboardList}
            title="Create Plans"
            description="Build and follow custom plans"
            onClick={() => navigate('/custom-plans')}
            color="purple"
            className="w-full" // Ensure it takes full width of its grid cell
          />
          <HomeCard
            icon={ClipboardList} // Consider a different icon if desired
            title="Your Custom Plans"
            description="View your saved plans"
            onClick={() => navigate('/custom-plans?showPlans=true')}
            color="green"
            className="w-full" // Ensure it takes full width of its grid cell
          />
        </div>

        {/* Body Metrics & Health Metrics - Two per row */}
        <div className="grid grid-cols-2 gap-4">
          <HomeCard
            icon={Scale} // Icon for Body Metrics
            title="Body Metrics"
            description="Track body measurements"
            onClick={() => navigate('/body-metrics')}
            color="orange"
            className="w-full" // Ensure it takes full width of its grid cell
          />
          <HomeCard
            icon={Activity} // Icon for Health Metrics
            title="Health Metrics"
            description="Log your health data"
            onClick={() => navigate('/2nd-health-metrics')}
            color="red"
            className="w-full" // Ensure it takes full width of its grid cell
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Select Workout Type</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {workoutTypes.map((type) => (
          <WorkoutTypeCard
            key={type.title}
            title={type.title}
            icon={type.icon}
            color={type.color}
            onClick={() => navigate(`/create-workout?type=${type.type}`)}
          />
        ))}
      </div>

      <div className="space-y-4">
        <Button className="w-full bg-green-500 hover:bg-green-600" onClick={() => navigate('/create-workout?type=Custom')}>
          <Plus className="mr-2 h-4 w-4" /> Create A Custom Workout
        </Button>
        <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => navigate('/workout')}>
          Show Custom Workouts
        </Button>
      </div>
    </div>
  );
};

export default Index;
