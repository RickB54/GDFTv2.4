
import React from "react";
import { Search, X } from "lucide-react";
import { ExerciseCategory, MuscleGroup } from "@/lib/data";
import { EQUIPMENT_OPTIONS } from "@/lib/exerciseTypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExerciseFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  equipmentFilter: string;
  onEquipmentFilterChange: (equipment: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  muscleGroupFilter: string;
  onMuscleGroupFilterChange: (muscleGroup: string) => void;
  categoryCounts?: Record<string, number>;
  className?: string;
}

const ExerciseFilters: React.FC<ExerciseFiltersProps> = ({
  searchQuery,
  onSearchQueryChange,
  equipmentFilter,
  onEquipmentFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  muscleGroupFilter,
  onMuscleGroupFilterChange,
  categoryCounts,
  className = ""
}) => {
  const categories: ("All" | "Favorites" | ExerciseCategory)[] = ["All", "Favorites", "Weights", "Cardio", "Slide Board", "No Equipment"];
  const muscleGroups: ("All" | MuscleGroup)[] = [
    "All", "Abs", "Biceps", "Triceps", "Shoulders", "Chest", "Back", 
    "Legs", "Cardiovascular", "Full Body", "Core", "Glutes", 
    "Hamstrings", "Quadriceps", "Calves", "Forearms", "Inner Thigh", "Outer Thigh"
  ];

  const handleClearFilters = () => {
    onSearchQueryChange("");
    onEquipmentFilterChange("All");
    onCategoryFilterChange("All");
    onMuscleGroupFilterChange("All");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="bg-gym-dark border border-border text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-3"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </div>
        <button
          onClick={handleClearFilters}
          className="bg-gym-dark border border-border text-gray-400 hover:text-white hover:bg-gym-card-hover rounded-lg p-3 transition-colors"
          title="Clear all filters"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
        <Select value={equipmentFilter} onValueChange={onEquipmentFilterChange}>
          <SelectTrigger className="w-full bg-gym-dark border-border">
            <SelectValue placeholder="Equipment" />
          </SelectTrigger>
          <SelectContent>
            {EQUIPMENT_OPTIONS.map((equipment) => (
              <SelectItem key={equipment} value={equipment}>
                {`Equipment (${equipment})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-full bg-gym-dark border-border">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {`Category (${category}${categoryCounts && categoryCounts[category] !== undefined ? `: ${categoryCounts[category]}` : ''})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={muscleGroupFilter} onValueChange={onMuscleGroupFilterChange}>
          <SelectTrigger className="w-full bg-gym-dark border-border">
            <SelectValue placeholder="Muscle Group" />
          </SelectTrigger>
          <SelectContent>
            {muscleGroups.map((group) => (
              <SelectItem key={group} value={group}>
                {`Muscle Group (${group})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ExerciseFilters;
