
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BarChart3, Trash, Heart, ListOrdered, Play, Edit, HelpCircle } from "lucide-react";
import ExerciseCard from "@/components/ui/ExerciseCard";
import ExerciseFilters from "@/components/ui/ExerciseFilters";
import { useExercise } from "@/contexts/ExerciseContext";
import { useWorkout } from "@/contexts/WorkoutContext";
import { Exercise, RelaxedMuscleGroup, RelaxedExerciseCategory } from "@/lib/data";
import { ReorderFavoritesDialog } from "@/components/ReorderFavoritesDialog";
import { Button } from "@/components/ui/button";
import ExercisesHelpPopup from "@/components/ui/ExercisesHelpPopup";

const FILTER_STORAGE_KEY = "exerciseFilters";

const Exercises = () => {
  const navigate = useNavigate();
  const { exercises, filterExercises, deleteExercise, favoriteExercises, toggleFavorite } = useExercise();
  const { startWorkout } = useWorkout();
  
  // Load saved filters from localStorage or use defaults
  const loadSavedFilters = () => {
    try {
      const saved = localStorage.getItem(FILTER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading saved filters:", error);
    }
    return {
      searchQuery: "",
      equipmentFilter: "All",
      categoryFilter: "All",
      muscleGroupFilter: "All"
    };
  };

  const savedFilters = loadSavedFilters();
  
  const [searchQuery, setSearchQuery] = useState(savedFilters.searchQuery);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [equipmentFilter, setEquipmentFilter] = useState<string>(savedFilters.equipmentFilter);
  const [categoryFilter, setCategoryFilter] = useState<string>(savedFilters.categoryFilter);
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>(savedFilters.muscleGroupFilter);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [totalExercises, setTotalExercises] = useState<number>(0);
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const categories: ("All" | "Favorites" | RelaxedExerciseCategory)[] = ["All", "Favorites", "Weights", "Cardio", "Slide Board", "No Equipment"];
  
  // Save filters to localStorage whenever they change
  useEffect(() => {
    const filtersToSave = {
      searchQuery,
      equipmentFilter,
      categoryFilter,
      muscleGroupFilter
    };
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filtersToSave));
  }, [searchQuery, equipmentFilter, categoryFilter, muscleGroupFilter]);
  
  useEffect(() => {
    try {
      let exercisesToShow = exercises;

      if (categoryFilter === "Favorites") {
        const favoriteExs = exercises.filter(ex => favoriteExercises.includes(ex.id));
        exercisesToShow = favoriteExs;
      }
      
      const filtered = filterExercises(
        equipmentFilter === "All" ? undefined : equipmentFilter,
        categoryFilter === "All" || categoryFilter === "Favorites" ? undefined : categoryFilter,
        muscleGroupFilter === "All" ? undefined : muscleGroupFilter,
        searchQuery
      ).filter(ex => exercisesToShow.some(e => e.id === ex.id));
      
      setFilteredExercises(filtered || []);
      
      const counts: Record<string, number> = {};
      categories.forEach(category => {
        if (category === "All") {
          counts[category] = (exercises || []).length;
        } else if (category === "Favorites") {
          counts[category] = favoriteExercises.length;
        } else {
          counts[category] = (exercises || []).filter(ex => ex.category === category).length;
        }
      });
      setCategoryCounts(counts);
      setTotalExercises(exercises?.length || 0);
    } catch (error) {
      console.error("Error filtering exercises:", error);
      setFilteredExercises([]);
    }
  }, [exercises, equipmentFilter, categoryFilter, muscleGroupFilter, searchQuery, filterExercises, favoriteExercises]);

  const handleStartExercise = (exerciseId: string) => {
    // Start a workout with just this single exercise
    startWorkout("Custom", [exerciseId]);
    navigate("/workout");
  };

  const handleDeleteExercise = async (id: string) => {
    const deleted = await deleteExercise(id);
    if (deleted) {
      // Exercise was successfully deleted, no need to do anything else as the exercises list
      // will be updated through the context
    }
  };

  const handleCategoryClick = (category: string) => {
    if (category === "All") {
      setSearchQuery("");
      setEquipmentFilter("All");
      setMuscleGroupFilter("All");
    }
    setCategoryFilter(category);
  };

  return (
    <div className="page-container page-transition">
      <ReorderFavoritesDialog open={showReorderDialog} onOpenChange={setShowReorderDialog} />
      <ExercisesHelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-heading">Exercises</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate("/create-exercise")}
            className="bg-primary px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            <span>New Exercise</span>
          </button>
          <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)}>
            <HelpCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      <div className="bg-gym-dark border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-lg font-semibold">Exercise Summary</h2>
          </div>
           <div className="flex items-center space-x-2">
             {categoryFilter === 'Favorites' && favoriteExercises.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setShowReorderDialog(true)}>
                  <ListOrdered className="h-4 w-4 mr-2" />
                  Reorder
                </Button>
              )}
            <div 
              className="text-sm text-gray-400 cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleCategoryClick("All")}
            >
              Total Exercises: {totalExercises}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {categories.map((category) => (
            <div 
              key={category} 
              className={`p-3 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gym-card-hover transition-colors ${
                category === categoryFilter ? "bg-primary/20" : "bg-gym-darker"
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              <span className="text-sm text-gray-400">{category === 'All' ? 'Total' : category}</span>
              <span className="text-xl font-bold">{categoryCounts[category] || 0}</span>
            </div>
          ))}
        </div>
      </div>
      
      <ExerciseFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        equipmentFilter={equipmentFilter}
        onEquipmentFilterChange={setEquipmentFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        muscleGroupFilter={muscleGroupFilter}
        onMuscleGroupFilterChange={setMuscleGroupFilter}
        categoryCounts={categoryCounts}
        className="mb-6"
      />
      
      <div className="space-y-4">
        {filteredExercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-400 mb-4">No exercises found</p>
            <button 
              onClick={() => navigate("/create-exercise")}
              className="bg-primary px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="h-5 w-5 mr-1" />
              <span>Create your first exercise</span>
            </button>
          </div>
        ) : (
          filteredExercises.map((exercise) => {
            const isFavorite = favoriteExercises.includes(exercise.id);
            return (
              <ExerciseCard
                key={exercise.id}
                name={exercise.name}
                category={exercise.category}
                thumbnailUrl={exercise.thumbnailUrl}
                pictureUrl={exercise.pictureUrl}
                isFavorite={isFavorite}
                onStart={() => handleStartExercise(exercise.id)}
                onEdit={() => navigate(`/create-exercise?id=${exercise.id}`)}
                onToggleFavorite={() => toggleFavorite(exercise.id)}
                onDelete={() => handleDeleteExercise(exercise.id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Exercises;
