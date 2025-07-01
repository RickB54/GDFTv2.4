import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useExercise } from "@/contexts/ExerciseContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Camera, Save, Upload, ImageIcon, X, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { ExerciseCategory, MuscleGroup, Equipment, ExerciseSettings, WeightSettings, CardioSettings, SlideboardSettings, NoEquipmentSettings } from "@/lib/data";
import { EQUIPMENT_OPTIONS } from "@/lib/exerciseTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { convertGoogleDriveUrl } from "@/lib/formatters";

const CreateExercise = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addExercise, updateExercise, getExerciseById, uploadExerciseImage } = useExercise();
  const queryParams = new URLSearchParams(location.search);
  const exerciseId = queryParams.get("id");
  const isEditing = !!exerciseId;

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ExerciseCategory>("Weights");
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [equipment, setEquipment] = useState<Equipment>("Barbell");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState(false);

  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const [time, setTime] = useState(30);
  const [distance, setDistance] = useState(0);
  const [incline, setIncline] = useState(5);

  const categories: ExerciseCategory[] = ["Weights", "Cardio", "Slide Board", "No Equipment", "Custom"];
  const equipmentOptions = EQUIPMENT_OPTIONS.filter((e) => e !== "All");
  const muscleGroupOptions: MuscleGroup[] = [
    "Chest", "Shoulders", "Triceps", "Biceps", "Forearms", "Quadriceps",
    "Hamstrings", "Glutes", "Calves", "Abdominals", "Back", "Cardiovascular",
    "Adductors", "Abs", "Legs", "Full Body", "Core", "Upper Back",
    "Inner Thigh", "Outer Thigh", "Lats", "Obliques", "Traps",
    "Front Deltoids", "Rear Deltoids", "Arms"
  ];

  useEffect(() => {
    if (exerciseId) {
      const exercise = getExerciseById(exerciseId);
      if (exercise) {
        setName(exercise.name);
        setCategory(exercise.category);
        setMuscleGroups(exercise.muscleGroups || []);
        setEquipment(exercise.equipment);
        setNotes(exercise.notes || "");
        setDescription(exercise.description || "");
        
        // Keep both image URLs when editing
        setThumbnailUrl(exercise.thumbnailUrl || "");
        setPictureUrl(exercise.pictureUrl || "");
        
        // Set the active tab based on which image URL exists
        if (exercise.pictureUrl) {
          setActiveTab("url");
        } else if (exercise.thumbnailUrl) {
          setActiveTab("upload");
        }

        setUrlError(false);

        if (exercise.settings) {
          if (exercise.category === "Weights" && 'sets' in exercise.settings) {
            const weightSettings = exercise.settings as WeightSettings;
            setSets(weightSettings.sets);
            setReps(weightSettings.reps);
            setWeight(weightSettings.weight);
          } else if (exercise.category === "Cardio" && 'time' in exercise.settings) {
            const cardioSettings = exercise.settings as CardioSettings;
            setTime(cardioSettings.time);
            setDistance(cardioSettings.distance);
          } else if (exercise.category === "Slide Board" && 'incline' in exercise.settings) {
            const slideboardSettings = exercise.settings as SlideboardSettings;
            setIncline(slideboardSettings.incline);
            setSets(slideboardSettings.sets);
            setReps(slideboardSettings.reps);
          } else if (exercise.category === "No Equipment" && 'time' in exercise.settings && 'sets' in exercise.settings) {
            const noEquipSettings = exercise.settings as NoEquipmentSettings;
            setTime(noEquipSettings.time);
            setSets(noEquipSettings.sets);
            setReps(noEquipSettings.reps);
          }
        }
      }
    }
  }, [exerciseId, getExerciseById]);

  const handleMuscleGroupChange = (group: MuscleGroup) => {
    setMuscleGroups((prev) =>
      prev.includes(group)
        ? prev.filter((g) => g !== group)
        : [...prev, group]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image is too large. Maximum size is 2MB.");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file.");
        return;
      }
      
      try {
        setIsUploading(true);
        const imageUrl = await uploadExerciseImage(file);
        setThumbnailUrl(imageUrl);
        // If we just uploaded an image, we should clear pictureUrl
        // to avoid storing both types of images
        setPictureUrl("");
        console.log("Image uploaded successfully, URL:", imageUrl);
        toast.success("Image uploaded successfully");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handlePictureUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    console.log("Input URL:", url);
    setPictureUrl(url);
    
    if (urlError) {
      setUrlError(false);
    }
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    if (activeTab === "upload") {
      setThumbnailUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      setPictureUrl("");
      setUrlError(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const testImageUrl = async () => {
    if (!pictureUrl) {
      toast.error("Please enter an image URL first");
      return;
    }
    
    setIsLoadingUrl(true);
    setUrlError(false);
    
    console.log("Testing original URL:", pictureUrl);
    
    try {
      const convertedUrl = convertGoogleDriveUrl(pictureUrl);
      console.log("Testing converted URL:", convertedUrl);
      
      const img = new Image();
      
      const imageLoadPromise = new Promise((resolve, reject) => {
        img.onload = () => {
          console.log("Image loaded successfully");
          resolve(true);
        };
        img.onerror = (err) => {
          console.error("Failed to load image:", err);
          reject(new Error("Failed to load image"));
        };
      });
      
      img.src = convertedUrl;
      
      await imageLoadPromise;
      
      toast.success("Image URL is valid!");
    } catch (error) {
      console.error("Error testing image URL:", error);
      setUrlError(true);
      toast.error("Unable to load image from this URL. The image may not exist or the server may not allow remote loading.");
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleSave = () => {
    if (!name) {
      toast.error("Please enter a name for the exercise");
      return;
    }

    if (muscleGroups.length === 0) {
      toast.error("Please select at least one muscle group");
      return;
    }

    let settings: ExerciseSettings;

    if (category === "Weights") {
      settings = { sets, reps, weight } as WeightSettings;
    } else if (category === "Cardio") {
      settings = { time, distance } as CardioSettings;
    } else if (category === "Slide Board") {
      settings = { incline, sets, reps } as SlideboardSettings;
    } else if (category === "No Equipment") {
      settings = { time, sets, reps } as NoEquipmentSettings;
    } else {
      settings = { sets, reps, weight: 0 } as WeightSettings;
    }

    // Handle the image URLs based on selected tab
    let finalThumbnailUrl = "";
    let finalPictureUrl = "";
    
    if (activeTab === "upload") {
      finalThumbnailUrl = thumbnailUrl;
      // Clear picture URL if we're using an uploaded image instead
      finalPictureUrl = ""; 
    } else if (activeTab === "url") {
      finalPictureUrl = pictureUrl;
      // Clear thumbnail URL if we're using a URL image instead
      finalThumbnailUrl = ""; 
    }

    const exerciseData = {
      name,
      category,
      muscleGroups,
      equipment,
      settings,
      notes,
      description,
      thumbnailUrl: finalThumbnailUrl,
      pictureUrl: finalPictureUrl,
    };

    try {
      if (isEditing && exerciseId) {
        updateExercise(exerciseId, exerciseData);
        console.log("Exercise updated successfully with data:", exerciseData);
        toast.success("Exercise updated successfully");
      } else {
        addExercise(exerciseData);
        console.log("Exercise added successfully with data:", exerciseData);
        toast.success("Exercise added successfully");
      }
      navigate("/exercises");
    } catch (error) {
      toast.error("Failed to save exercise");
      console.error("Error saving exercise:", error);
    }
  };

  const getDisplayedImageUrl = () => {
    if (activeTab === "upload" && thumbnailUrl) {
      return thumbnailUrl;
    } else if (activeTab === "url" && pictureUrl) {
      const convertedUrl = convertGoogleDriveUrl(pictureUrl);
      console.log("Getting display image from:", pictureUrl, "converted to:", convertedUrl);
      return convertedUrl;
    }
    return null;
  };

  return (
    <div className="page-container page-transition pb-24">
      <div className="flex items-center mb-6">
        <button
          className="mr-2 text-muted-foreground hover:text-white transition-colors"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">
          {isEditing ? "Edit Exercise" : "Create Exercise"}
        </h1>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Exercise Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter exercise name"
            className="mt-1 bg-gym-darker"
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={category}
            onValueChange={(value: ExerciseCategory) => setCategory(value)}
          >
            <SelectTrigger id="category" className="mt-1 bg-gym-darker">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="equipment">Equipment</Label>
          <Select
            value={equipment}
            onValueChange={(value: Equipment) => setEquipment(value)}
          >
            <SelectTrigger id="equipment" className="mt-1 bg-gym-darker">
              <SelectValue placeholder="Select equipment" />
            </SelectTrigger>
            <SelectContent>
              {equipmentOptions.map((item) => (
                <SelectItem key={item} value={item as string}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block">Exercise Image</Label>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="url">Picture URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload">
              {thumbnailUrl ? (
                <div className="relative mt-2">
                  <img 
                    src={thumbnailUrl} 
                    alt="Exercise thumbnail" 
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500/80 p-1 rounded-full"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={handleTriggerFileInput}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                >
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-center text-sm text-muted-foreground mb-1">
                    Click to upload an image
                  </p>
                  <p className="text-center text-xs text-muted-foreground">
                    (JPG, PNG, GIF up to 2MB)
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="url">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="url"
                    placeholder="Enter image URL (e.g., https://i.imgur.com/KRP2fbM.png)"
                    value={pictureUrl}
                    onChange={handlePictureUrlChange}
                    className={`bg-gym-darker ${urlError ? 'border-red-500' : ''}`}
                  />
                  {pictureUrl && (
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={handleRemoveImage}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {urlError && (
                  <p className="text-red-500 text-xs mt-1">
                    Unable to load image from this URL. Please check the URL or try another image.
                  </p>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Supported URLs: Imgur, Google Drive, and most direct image links
                </p>
                
                <p className="text-xs text-muted-foreground italic">
                  For Google Drive: Use the "Share" link format https://drive.google.com/file/d/FILE_ID/view
                </p>
                
                {pictureUrl && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={testImageUrl} 
                      className="mb-2"
                      type="button"
                      disabled={isLoadingUrl}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      {isLoadingUrl ? "Testing URL..." : "Test URL"}
                    </Button>
                    <div className="relative mt-2">
                      {!urlError && (
                        <img 
                          src={getDisplayedImageUrl() || ''}
                          alt="Exercise from URL" 
                          className="w-full h-48 object-cover rounded-md"
                          onError={() => setUrlError(true)}
                          crossOrigin="anonymous"
                        />
                      )}
                      {urlError && (
                        <div className="w-full h-48 bg-gray-800 rounded-md flex flex-col items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-gray-500 mb-2" />
                          <p className="text-center text-sm text-gray-500">
                            Image could not be loaded
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Label className="mb-2 block">Muscle Groups</Label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-gym-darker p-3 rounded-md">
            {muscleGroupOptions.map((group) => (
              <div key={group} className="flex items-center space-x-2">
                <Checkbox
                  id={`muscle-${group}`}
                  checked={muscleGroups.includes(group)}
                  onCheckedChange={() => handleMuscleGroupChange(group)}
                />
                <Label htmlFor={`muscle-${group}`} className="text-sm">
                  {group}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glass p-4 rounded-md">
          <h3 className="text-md font-medium mb-3">Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            {(category === "Weights" || category === "Custom") && (
              <>
                <div>
                  <Label htmlFor="sets">Sets</Label>
                  <Input
                    id="sets"
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(parseInt(e.target.value) || 0)}
                    className="mt-1 bg-gym-darker"
                  />
                </div>
                <div>
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    id="reps"
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                    className="mt-1 bg-gym-darker"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                    className="mt-1 bg-gym-darker"
                  />
                </div>
              </>
            )}

            {category === "Cardio" && (
              <>
                <div>
                  <Label htmlFor="time">Time (minutes)</Label>
                  <Input
                    id="time"
                    type="number"
                    value={time}
                    onChange={(e) => setTime(parseInt(e.target.value) || 0)}
                    className="mt-1 bg-gym-darker"
                  />
                </div>
                <div>
                  <Label htmlFor="distance">Distance (miles/km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(parseInt(e.target.value) || 0)}
                    className="mt-1 bg-gym-darker"
                  />
                </div>
              </>
            )}

            {category === "Slide Board" && (
              <>
                <div>
                  <Label htmlFor="incline">Incline</Label>
                  <Input
                    id="incline"
                    type="number"
                    value={incline}
                    onChange={(e) => setIncline(parseInt(e.target.value) || 0)}
                    className="mt-1 bg-gym-darker"
                  />
                </div>
                <div>
                  <Label htmlFor="sets">Sets</Label>
                  <Input
                    id="sets"
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(parseInt(e.target.value) || 0)}
                    className="mt-1 bg-gym-darker"
                  />
                </div>
                <div>
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    id="reps"
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                    className="mt-1 bg-gym-darker"
                  />
                </div>
              </>
            )}

            {category === "No Equipment" && (
              <>
                <div>
                  <Label htmlFor="time">Time (seconds)</Label>
                  <Input
                    id="time"
                    type="number"
                    value={time}
                    onChange={(e) => setTime(parseInt(e.target.value) || 0)}
                    className="mt-1 bg-gym-darker"
                  />
                </div>
                <div>
                  <Label htmlFor="sets">Sets</Label>
                  <Input
                    id="sets"
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(parseInt(e.target.value) || 0)}
                    className="mt-1 bg-gym-darker"
                  />
                </div>
                <div>
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    id="reps"
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                    className="mt-1 bg-gym-darker"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter exercise description"
            className="mt-1 bg-gym-darker h-24"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter any notes about the exercise"
            className="mt-1 bg-gym-darker h-24"
          />
        </div>

        <Button 
          onClick={handleSave}
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isUploading || isLoadingUrl}
        >
          <Save className="mr-2 h-4 w-4" />
          {isUploading ? "Uploading Image..." : 
           isLoadingUrl ? "Testing URL..." : 
           isEditing ? "Update Exercise" : "Save Exercise"}
        </Button>
      </div>
    </div>
  );
};

export default CreateExercise;
