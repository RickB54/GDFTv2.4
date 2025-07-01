import React, { useState, useRef } from "react";
import { Download, Upload, Info, Trash2, HelpCircle } from "lucide-react";
import { useExercise } from "@/contexts/ExerciseContext";
import { slideboardExercises, cardioExercises, weightExercises, noEquipmentExercises } from "@/lib/data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SettingsHelpPopup from "@/components/ui/SettingsHelpPopup";
import { useSettings } from '@/contexts/SettingsContext';
import { BetaTesterDialog } from "@/components/ui/BetaTesterDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

const Settings = () => {
  const { unitSystem, setUnitSystem } = useSettings();
  const { exercises, exportToCSV, importFromCSV, deleteAllExercises, reinstallAllExercises } = useExercise();
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [betaTesterDialogOpen, setBetaTesterDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreFileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    try {
      setIsLoading(true);
      const csv = exportToCSV();

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gymdayfittracker-exercises-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Exercises exported successfully");
    } catch (error) {
      console.error("Error exporting exercises:", error);
      toast.error("Failed to export exercises");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportCSVClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        importFromCSV(csvContent);
      } catch (error) {
        console.error("Error reading CSV file:", error);
        toast.error("Failed to read the CSV file");
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      toast.error("Error reading the file");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleDeleteAllExercises = async () => {
    toast("Are you sure you want to delete all exercises? This action cannot be undone.", {
      action: {
        label: "Confirm",
        onClick: async () => {
          try {
            await deleteAllExercises();
            toast.success("All exercises deleted successfully");
          } catch (error) {
            console.error("Error deleting all exercises:", error);
            toast.error("Failed to delete all exercises");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleReinstallAllExercises = () => {
    reinstallAllExercises();
  };

  const handleBackupAllData = async () => {
    try {
      setIsLoading(true);
      const allData = { ...localStorage };
      const jsonString = JSON.stringify(allData, null, 2);

      // Enhanced Android SAF implementation
      if (window.Android) {
        // Check if SAF is available
        const safAvailable = await window.Android.isStorageAccessFrameworkAvailable();
        if (!safAvailable) {
          toast.error("Storage Access Framework not available on this device");
          setIsLoading(false);
          return;
        }

        // Check permissions first
        const hasPermissions = await window.Android.checkStoragePermissions();
        if (!hasPermissions) {
          const granted = await window.Android.requestStoragePermissions();
          if (!granted) {
            toast.error("Storage permissions required for backup");
            setIsLoading(false);
            return;
          }
        }

        // Let user select backup directory
        const directoryUri = await window.Android.selectBackupDirectory();
        if (!directoryUri) {
          toast.error("No backup directory selected");
          setIsLoading(false);
          return;
        }

        // Create backup file in selected directory
        const date = new Date().toISOString().split("T")[0];
        const filename = `gymdayfittracker-backup-${date}.json`;
        
        const success = await window.Android.createBackupFileInDirectory(jsonString, filename, directoryUri);
        if (success) {
          toast.success("Backup created successfully in selected directory");
        } else {
          const error = await window.Android.getLastError();
          toast.error(`Backup failed: ${error || "Unknown error"}`);
        }
      } else {
        // Existing web implementation
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split("T")[0];
        const link = document.createElement("a");
        link.href = url;
        link.download = `gymdayfittracker-backup-${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Backup successful");
      }
    } catch (error) {
      console.error("Backup failed:", error);
      toast.error("Failed to backup data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreAllDataClick = async () => {
    if (window.Android) {
      try {
        // Check SAF availability
        const safAvailable = await window.Android.isStorageAccessFrameworkAvailable();
        if (!safAvailable) {
          toast.error("Storage Access Framework not available");
          return;
        }

        // Check permissions
        const hasPermissions = await window.Android.checkStoragePermissions();
        if (!hasPermissions) {
          const granted = await window.Android.requestStoragePermissions();
          if (!granted) {
            toast.error("Storage permissions required for restore");
            return;
          }
        }

        // Let user select restore file
        const fileUri = await window.Android.selectRestoreFile();
        if (!fileUri) {
          toast.error("No restore file selected");
          return;
        }

        // Read and restore file
        setIsLoading(true);
        const content = await window.Android.readFileFromUri(fileUri);
        await handleRestoreData(content);
      } catch (error) {
        console.error("Error in restore process:", error);
        const androidError = await window.Android?.getLastError();
        toast.error(`Restore failed: ${androidError || error}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      restoreFileInputRef.current?.click();
    }
  };

  // Helper function for restore data processing
  const handleRestoreData = async (content: string) => {
    try {
      const json = JSON.parse(content);
      const expectedKeys = {
        exercises: "[]",
        savedWorkoutTemplates: "[]",
        workouts: "[]",
        customPlans: "[]",
      };
      
      const restoredData = { ...json };
      Object.keys(expectedKeys).forEach((key) => {
        if (!(key in restoredData)) {
          restoredData[key] = expectedKeys[key];
        }
      });
      
      localStorage.clear();
      Object.keys(restoredData).forEach((key) => {
        localStorage.setItem(key, restoredData[key]);
      });
      
      toast.success("Data restored successfully");
      window.location.reload();
    } catch (error) {
      console.error("Restore failed:", error);
      toast.error(`Failed to restore data: ${error instanceof Error ? error.message : "Invalid file"}`);
    }
  };

  // Enhanced Android callbacks
  React.useEffect(() => {
    if (window.Android) {
      // File selection callback
      window.Android.onFileSelected = async (content: string) => {
        await handleRestoreData(content);
      };

      // Directory selection callback
      window.Android.onDirectorySelected = (directoryUri: string) => {
        console.log("Directory selected:", directoryUri);
        // Store selected directory for future use if needed
      };

      // Permission result callback
      window.Android.onPermissionResult = (granted: boolean) => {
        if (!granted) {
          toast.error("Storage permissions denied. Backup/restore features will not work.");
        }
      };

      // Error callback
      window.Android.onError = (error: string) => {
        console.error("Android bridge error:", error);
        toast.error(`Android error: ${error}`);
      };
    }
  }, []);

  const handleRestoreFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Define expected keys and their default values
        const expectedKeys = {
          exercises: "[]",
          savedWorkoutTemplates: "[]",
          workouts: "[]",
          customPlans: "[]",
        };
        // Ensure all expected keys exist, filling in defaults if missing
        const restoredData = { ...json };
        Object.keys(expectedKeys).forEach((key) => {
          if (!(key in restoredData)) {
            restoredData[key] = expectedKeys[key];
          }
        });
        // Clear localStorage and restore the data
        localStorage.clear();
        Object.keys(restoredData).forEach((key) => {
          localStorage.setItem(key, restoredData[key]);
        });
        toast.success("Data restored successfully");
        window.location.reload();
      } catch (error) {
        console.error("Restore failed:", error);
        toast.error(`Failed to restore data: ${error instanceof Error ? error.message : "Invalid file"}`);
      } finally {
        setIsLoading(false);
        if (restoreFileInputRef.current) {
          restoreFileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      toast.error("Error reading the file");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleDeleteAllData = () => {
    toast("Are you sure you want to delete all data?", {
      description: "This action cannot be undone. All exercises, workouts, and settings will be permanently deleted.",
      action: {
        label: "Confirm",
        onClick: async () => {
          try {
            setIsLoading(true);
            
            // Step 1: Clear all localStorage data
            localStorage.clear();
            
            // Step 2: Reinitialize essential data immediately (mobile-safe approach)
            const defaultExercises = [
              ...slideboardExercises, 
              ...cardioExercises, 
              ...weightExercises, 
              ...noEquipmentExercises
            ];
            
            // Restore minimal required data to prevent routing issues
            localStorage.setItem('exercises', JSON.stringify(defaultExercises));
            localStorage.setItem('savedWorkoutTemplates', '[]');
            localStorage.setItem('workouts', '[]');
            localStorage.setItem('customPlans', '[]');
            
            toast.success("All data deleted successfully");
            
            // Step 3: Use mobile-safe navigation instead of window.location.reload()
            const safeNavigateHome = () => {
            if (window.Android || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            window.location.replace('/');
            } else {
            window.location.reload();
            }
            };
            
            // Execute the navigation
            safeNavigateHome();
            
          } catch (error) {
            console.error("Delete all data failed:", error);
            toast.error("Failed to delete all data");
          } finally {
            setIsLoading(false);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  return (
    <div className="page-container page-transition">
      <SettingsHelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-heading">Settings</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)}>
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* Backup & Restore Section */}
        <div className="card-glass p-4">
          <h2 className="text-lg font-medium mb-4">Backup & Restore</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Backup All Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Export all your app data (exercises, workouts, plans, and settings) as a JSON file for backup or transfer to another device.
              </p>
              <Button
                variant="default"
                onClick={handleBackupAllData}
                disabled={isLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                Backup All Data
              </Button>
            </div>
            
            <div className="pt-2 border-t border-border">
              <h3 className="text-sm font-medium mb-2">Restore All Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Restore all app data from a previously exported JSON file. This will overwrite your current data.
              </p>
              <Button
                variant="perform"
                onClick={handleRestoreAllDataClick}
                disabled={isLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Restore All Data
              </Button>
              <input
                type="file"
                ref={restoreFileInputRef}
                accept=".json"
                onChange={handleRestoreFileChange}
                className="hidden"
              />
            </div>

            <div className="pt-2 border-t border-border">
              <h3 className="text-sm font-medium mb-2">Delete All Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This will permanently delete all app data (exercises, workouts, plans, and settings). This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                className="bg-red-700 hover:bg-red-800"
                onClick={handleDeleteAllData}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All Data
              </Button>
            </div>
          </div>
        </div>

        {/* Exercises Data Section */}
        <div className="card-glass p-4">
          <h2 className="text-lg font-medium mb-4">Exercises Data</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Export Exercises</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Export all your exercises as a CSV file that you can backup or share.
              </p>
              <Button
                variant="default"
                onClick={handleExportCSV}
                disabled={isLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
              </Button>
            </div>
            
            <div className="pt-2 border-t border-border">
              <h3 className="text-sm font-medium mb-2">Import Exercises</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Import exercises from a CSV file. The file should have the columns: Name, Category, Muscle Groups, Equipment, Notes, Description, Picture URL.
              </p>
              <Button
                variant="perform"
                onClick={handleImportCSVClick}
                disabled={isLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import from CSV
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            <div className="pt-2 border-t border-border">
              <h3 className="text-sm font-medium mb-2">Reinstall All Exercises</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Reinstall all default exercises in all categories (Weights, Cardio, Slide Board, No Equipment). 
                This is useful if you've deleted exercises and want to get them back.
              </p>
              <Button
                variant="default"
                className="bg-gym-purple hover:bg-gym-purple/80"
                onClick={handleReinstallAllExercises}
              >
                <Download className="mr-2 h-4 w-4" />
                Reinstall All Exercises
              </Button>
            </div>
            
            <div className="pt-2 border-t border-border">
              <h3 className="text-sm font-medium mb-2">Delete All Exercises</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This will permanently delete all exercises. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                className="bg-red-700 hover:bg-red-800"
                onClick={handleDeleteAllExercises}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All Exercises
              </Button>
            </div>
          </div>
        </div>
        
        <div className="card-glass p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Measurement Units</h2>
          <div className="flex items-center gap-4">
            <Button
              variant={unitSystem === 'metric' ? 'default' : 'outline'}
              onClick={() => setUnitSystem('metric')}
            >
              Metric (kg, cm)
            </Button>
            <Button
              variant={unitSystem === 'imperial' ? 'default' : 'outline'}
              onClick={() => setUnitSystem('imperial')}
            >
              Imperial (lbs, in)
            </Button>
          </div>
        </div>
        <div className="card-glass p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <div className="flex items-center gap-4 text-gray-300">
            <Info className="h-8 w-8 text-primary" />
            <div>
              <p className="font-bold text-lg">GymDayFitTracker</p>
              <p className="text-sm">Version 2.4</p>
              <p className="text-sm mt-1">Contact: RicksAppServices@gmail.com</p>
            </div>
          </div>
          <p className="mt-4 text-gray-400">
            Track your workouts, monitor your progress, and achieve your fitness goals with GymDayFitTracker.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                alert(
                  'Version 2.4 Changes:\n' +
                  '- Added beta tester signup with suggestions\n' +
                  '- Enhanced mobile compatibility\n' +
                  '- Updated version history display\n' +
                  '\nVersion 2.3 Changes:\n' +
                  '- Added calories burned calculation\n' +
                  '- Improved workout tracking\n' +
                  '\nVersion 2.2 Changes:\n' +
                  '- Added custom workout plans\n' +
                  '- Enhanced exercise database'
                );
              }}
            >
              Version History
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                onClick={() => setBetaTesterDialogOpen(true)}
              >
                Become a Beta Tester
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="p-1 hover:bg-accent rounded-full transition-colors">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>How to Become a Beta Tester</DialogTitle>
                    <DialogDescription className="space-y-4 pt-3">
                      <ol className="list-decimal ml-4 space-y-2">
                        <li>Click the "Become a Beta Tester" button</li>
                        <li>Enter your email address</li>
                        <li>Write your app suggestions or feedback</li>
                        <li>Click Submit - this will:</li>
                        <ul className="list-disc ml-4 mt-1 space-y-1">
                          <li>Copy your message to clipboard</li>
                          <li>Attempt to open your email client</li>
                          <li>If email client doesn't open, manually send your copied message to RicksAppServices@gmail.com</li>
                        </ul>
                      </ol>
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">Close</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
      <BetaTesterDialog
        open={betaTesterDialogOpen}
        onOpenChange={setBetaTesterDialogOpen}
      />
    </div>
  );
};

export default Settings;
