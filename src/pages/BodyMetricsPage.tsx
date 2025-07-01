import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Upload, Trash2, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsHelpPopup from '@/components/ui/StatsHelpPopup';
import { useSettings, UnitSystem } from '@/contexts/SettingsContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import { generateId } from '@/lib/data';

interface BmiData {
  heightFt: string;
  heightIn: string;
  weight: string;
  age: string;
  sex: 'male' | 'female' | '';
}

interface BmiResult {
  value: number;
  category: string;
}

interface BodyMeasurementImage {
  id: string;
  url: string;
  title: string;
  description: string;
}

interface MeasurementValue {
  value: string;
  unit: 'cm' | 'in' | 'kg' | 'lbs' | '%';
}

interface MeasurementsState {
  chest: MeasurementValue;
  waist: MeasurementValue;
  hipsGlutes: MeasurementValue;
  bicepsUnflexed: MeasurementValue;
  bicepsFlexed: MeasurementValue;
  tricepsUnflexed: MeasurementValue;
  tricepsFlexed: MeasurementValue;
  forearms: MeasurementValue;
  calves: MeasurementValue;
  neck: MeasurementValue;
  shoulders: MeasurementValue;
  thighs: MeasurementValue;
  weight: MeasurementValue;
  bodyFatPercentage: MeasurementValue;
  [key: string]: MeasurementValue;
}

const getDefaultUnit = (key: keyof MeasurementsState, globalUnitSystem: UnitSystem): 'cm' | 'in' | 'kg' | 'lbs' | '%' => {
  if (key === 'weight') {
    return globalUnitSystem === 'imperial' ? 'lbs' : 'kg';
  }
  if (key === 'bodyFatPercentage') {
    return '%';
  }
  return globalUnitSystem === 'imperial' ? 'in' : 'cm';
};

const BodyMetricsPage = () => {
  const navigate = useNavigate();
  const { unitSystem } = useSettings();
  const { addBodyMeasurement, updateBodyMeasurement } = useWorkout();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [bmiData, setBmiData] = useState<BmiData>({ heightFt: '', heightIn: '', weight: '', age: '', sex: '' });
  const [bmiResult, setBmiResult] = useState<BmiResult | null>(null);

  const [measurements, setMeasurements] = useState<MeasurementsState>(() => {
    const initial: MeasurementsState = {
        chest: { value: '', unit: getDefaultUnit('chest', unitSystem) },
        waist: { value: '', unit: getDefaultUnit('waist', unitSystem) },
        hipsGlutes: { value: '', unit: getDefaultUnit('hipsGlutes', unitSystem) },
        bicepsUnflexed: { value: '', unit: getDefaultUnit('bicepsUnflexed', unitSystem) },
        bicepsFlexed: { value: '', unit: getDefaultUnit('bicepsFlexed', unitSystem) },
        tricepsUnflexed: { value: '', unit: getDefaultUnit('tricepsUnflexed', unitSystem) },
        tricepsFlexed: { value: '', unit: getDefaultUnit('tricepsFlexed', unitSystem) },
        forearms: { value: '', unit: getDefaultUnit('forearms', unitSystem) },
        calves: { value: '', unit: getDefaultUnit('calves', unitSystem) },
        neck: { value: '', unit: getDefaultUnit('neck', unitSystem) },
        shoulders: { value: '', unit: getDefaultUnit('shoulders', unitSystem) },
        thighs: { value: '', unit: getDefaultUnit('thighs', unitSystem) },
        weight: { value: '', unit: getDefaultUnit('weight', unitSystem) },
        bodyFatPercentage: { value: '', unit: getDefaultUnit('bodyFatPercentage', unitSystem) },
    };
    return initial;
  });

  const [userImages, setUserImages] = useState<BodyMeasurementImage[]>([]);
  const [diagramImages, setDiagramImages] = useState<BodyMeasurementImage[]>([]);
  const [currentUserImageIndex, setCurrentUserImageIndex] = useState<number>(0);
  const [currentDiagramImageIndex, setCurrentDiagramImageIndex] = useState<number>(0);

  useEffect(() => {
    const savedData = localStorage.getItem('bodyMetricsData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const mergedMeasurements = { ...measurements };
      for (const key in parsedData.measurements) {
        if (parsedData.measurements.hasOwnProperty(key) && key in mergedMeasurements) {
            mergedMeasurements[key as keyof MeasurementsState] = parsedData.measurements[key];
        }
      }
      setMeasurements(mergedMeasurements);
      setUserImages(parsedData.userImages || []);
      setDiagramImages(parsedData.diagramImages || []);
      setCurrentUserImageIndex(parsedData.userImages && parsedData.userImages.length > 0 ? 0 : 0); 
      setCurrentDiagramImageIndex(parsedData.diagramImages && parsedData.diagramImages.length > 0 ? 0 : 0);
      if (parsedData.bmiData) {
        setBmiData(parsedData.bmiData);
      }
      if (parsedData.bmiResult) {
        setBmiResult(parsedData.bmiResult);
      }
    } else {
      const initial: MeasurementsState = {
        chest: { value: '', unit: getDefaultUnit('chest', unitSystem) },
        waist: { value: '', unit: getDefaultUnit('waist', unitSystem) },
        hipsGlutes: { value: '', unit: getDefaultUnit('hipsGlutes', unitSystem) },
        bicepsUnflexed: { value: '', unit: getDefaultUnit('bicepsUnflexed', unitSystem) },
        bicepsFlexed: { value: '', unit: getDefaultUnit('bicepsFlexed', unitSystem) },
        tricepsUnflexed: { value: '', unit: getDefaultUnit('tricepsUnflexed', unitSystem) },
        tricepsFlexed: { value: '', unit: getDefaultUnit('tricepsFlexed', unitSystem) },
        forearms: { value: '', unit: getDefaultUnit('forearms', unitSystem) },
        calves: { value: '', unit: getDefaultUnit('calves', unitSystem) },
        neck: { value: '', unit: getDefaultUnit('neck', unitSystem) },
        shoulders: { value: '', unit: getDefaultUnit('shoulders', unitSystem) },
        thighs: { value: '', unit: getDefaultUnit('thighs', unitSystem) },
        weight: { value: '', unit: getDefaultUnit('weight', unitSystem) },
        bodyFatPercentage: { value: '', unit: getDefaultUnit('bodyFatPercentage', unitSystem) },
      };
      setMeasurements(initial);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem]);

  const calculateBmi = () => {
    const weightNum = parseFloat(bmiData.weight);
    const heightFtNum = parseFloat(bmiData.heightFt);
    const heightInNum = parseFloat(bmiData.heightIn);

    const weightKg = unitSystem === 'imperial' ? weightNum * 0.453592 : weightNum;
    const totalInches = (heightFtNum * 12) + heightInNum;
    const heightM = unitSystem === 'imperial' ? totalInches * 0.0254 : (totalInches / 39.37); // Assuming cm if not imperial

    if (weightKg > 0 && heightM > 0 && bmiData.age && bmiData.sex) {
      const bmi = weightKg / (heightM * heightM);
      let category = '';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi >= 18.5 && bmi < 25) category = 'Normal weight';
      else if (bmi >= 25 && bmi < 30) category = 'Overweight';
      else category = 'Obesity';
      setBmiResult({ value: parseFloat(bmi.toFixed(1)), category });
    } else {
      toast({ title: 'Error', description: 'Please fill in all BMI fields: height, weight, age, and sex.', variant: 'destructive' });
    }
  };

  const getBmiResultColor = () => {
    if (!bmiResult) return 'text-white';
    switch (bmiResult.category) {
      case 'Underweight':
        return 'text-blue-400';
      case 'Normal weight':
        return 'text-green-400';
      case 'Overweight':
        return 'text-yellow-400';
      case 'Obesity':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  const BmiScaleGraph = ({ bmiValue }: { bmiValue: number | null }) => {
    const getIndicatorPosition = () => {
      if (bmiValue === null) return '0%';
      if (bmiValue < 18.5) return `${(bmiValue / 18.5) * 25}%`;
      if (bmiValue < 25) return `${25 + ((bmiValue - 18.5) / 6.5) * 25}%`;
      if (bmiValue < 30) return `${50 + ((bmiValue - 25) / 5) * 25}%`;
      const obesityPercentage = Math.min(((bmiValue - 30) / 10) * 25, 25);
      return `${75 + obesityPercentage}%`;
    };

    return (
      <div className="w-full mt-4">
        <div className="relative w-full h-4 rounded-full overflow-hidden flex">
          <div className="w-1/4 bg-blue-400"></div>
          <div className="w-1/4 bg-green-400"></div>
          <div className="w-1/4 bg-yellow-400"></div>
          <div className="w-1/4 bg-red-400"></div>
          {bmiValue !== null && (
            <div 
              className="absolute top-0 h-full w-1 bg-white transform -translate-x-1/2 shadow-lg"
              style={{ left: getIndicatorPosition() }}
            >
              <div className="absolute -top-6 -left-1/2 transform -translate-x-1/4 w-max px-1 text-xs bg-gray-600 text-white rounded">{bmiValue}</div>
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs mt-1 text-gray-400">
          <div className="w-1/4 text-center">Underweight</div>
          <div className="w-1/4 text-center">Normal</div>
          <div className="w-1/4 text-center">Overweight</div>
          <div className="w-1/4 text-center">Obese</div>
        </div>
      </div>
    );
  };

  const saveMeasurements = () => {
    const dataToSave = {
      measurements,
      userImages,
      diagramImages,
      bmiData,
      bmiResult,
    };
    localStorage.setItem('bodyMetricsData', JSON.stringify(dataToSave));
    toast({ title: 'Success', description: 'All data saved!' });
  };

  const handleMeasurementChange = (key: keyof MeasurementsState, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  };

  const handleUnitChange = (key: keyof MeasurementsState, unit: 'cm' | 'in' | 'kg' | 'lbs' | '%') => {
    setMeasurements(prev => ({
        ...prev,
        [key]: { ...prev[key], unit: unit },
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, imageType: 'user' | 'diagram') => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);

      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const newImageObject: BodyMeasurementImage = {
            id: generateId(),
            url: loadEvent.target?.result as string,
            title: '',
            description: '',
          };

          if (imageType === 'user') {
            setUserImages(prevImages => [...prevImages, newImageObject]);
          } else {
            setDiagramImages(prevImages => [...prevImages, newImageObject]);
          }
        };
        reader.readAsDataURL(file);
      });

      event.target.value = '';
    }
  };

  const handleDeleteImage = (imageType: 'user' | 'diagram', index: number) => {
    let newImages: BodyMeasurementImage[];
    if (imageType === 'user') {
      newImages = userImages.filter((_, i) => i !== index);
      setUserImages(newImages);
      setCurrentUserImageIndex(prevIdx => Math.max(0, Math.min(prevIdx, newImages.length - 1)));
    } else {
      newImages = diagramImages.filter((_, i) => i !== index);
      setDiagramImages(newImages);
      setCurrentDiagramImageIndex(prevIdx => Math.max(0, Math.min(prevIdx, newImages.length - 1)));
    }
  };

  const handleImageDetailChange = (
    imageType: 'user' | 'diagram',
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    const updater = (prevImages: BodyMeasurementImage[]) =>
      prevImages.map((img, i) => (i === index ? { ...img, [field]: value } : img));

    if (imageType === 'user') {
      setUserImages(updater);
    } else {
      setDiagramImages(updater);
    }
  };
  
  const navigateCarousel = (imageType: 'user' | 'diagram', direction: 'prev' | 'next') => {
    if (imageType === 'user') {
      setCurrentUserImageIndex(prevIndex => {
        const newIndex = direction === 'prev' ? prevIndex - 1 : prevIndex + 1;
        if (newIndex < 0) return userImages.length - 1;
        if (newIndex >= userImages.length) return 0;
        return newIndex;
      });
    } else {
      setCurrentDiagramImageIndex(prevIndex => {
        const newIndex = direction === 'prev' ? prevIndex - 1 : prevIndex + 1;
        if (newIndex < 0) return diagramImages.length - 1;
        if (newIndex >= diagramImages.length) return 0;
        return newIndex;
      });
    }
  };

  const renderImageCarousel = (
    imageType: 'user' | 'diagram',
    images: BodyMeasurementImage[],
    currentIndex: number,
    placeholderText: string
  ) => {
    if (!images || images.length === 0) {
      return <p className="text-center text-gray-400 py-10">{placeholderText}</p>;
    }

    const currentImage = images[currentIndex];
    if (!currentImage) {
        return <p className="text-center text-gray-400 py-10">Error displaying image.</p>;
    }

    return (
      <div className="w-full flex flex-col items-center">
        <div className="relative w-full max-w-md mb-2">
          <img 
              src={currentImage.url}
              alt={`${imageType} ${currentIndex + 1} - ${currentImage.title || 'Untitled'}`} 
              className="w-full h-auto object-contain rounded-md max-h-60 md:max-h-80 shadow-lg min-h-[150px]"
          />
          {images.length > 1 && (
            <div className="absolute top-1/2 left-1 right-1 flex justify-between items-center transform -translate-y-1/2 z-10">
              <Button onClick={() => navigateCarousel(imageType, 'prev')} variant="outline" size="icon" className="bg-black bg-opacity-50 text-white hover:bg-opacity-75 rounded-full p-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button onClick={() => navigateCarousel(imageType, 'next')} variant="outline" size="icon" className="bg-black bg-opacity-50 text-white hover:bg-opacity-75 rounded-full p-2">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
          <Button
            onClick={() => handleDeleteImage(imageType, currentIndex)}
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md z-20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <Input
          type="text"
          placeholder="Enter title"
          value={currentImage.title || ''}
          onChange={(e) => handleImageDetailChange(imageType, currentIndex, 'title', e.target.value)}
          className="mt-2 w-full max-w-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-md"
        />
        <Textarea
          placeholder="Enter short description"
          value={currentImage.description || ''}
          onChange={(e) => handleImageDetailChange(imageType, currentIndex, 'description', e.target.value)}
          className="mt-2 w-full max-w-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-md h-24"
        />
        {images.length > 0 && (
          <p className="text-center text-sm text-gray-400 mt-2">
            {currentIndex + 1} / {images.length}
          </p>
        )}
      </div>
    );
  };

  const measurementCategories: { title: string; keys: (keyof MeasurementsState)[] }[] = [
    { title: 'Key Measurements', keys: ['chest', 'waist', 'hipsGlutes', 'weight'] },
    { title: 'Arm Measurements', keys: ['bicepsUnflexed', 'bicepsFlexed', 'tricepsUnflexed', 'tricepsFlexed', 'forearms'] },
    { title: 'Leg Measurements', keys: ['thighs', 'calves'] },
    { title: 'Other Measurements', keys: ['neck', 'shoulders', 'bodyFatPercentage'] }, 
  ];

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen pb-24">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-900 py-2 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-center text-white flex-grow">Body Metrics</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)} className="text-white">
            <HelpCircle className="h-6 w-6" />
        </Button>
        <StatsHelpPopup 
            title="Body Metrics Help"
            description="On this page, you can track your body measurements, and upload progress photos. All data is stored locally on your device. The BMI Calculator helps you determine your Body Mass Index based on height, weight, age, and sex. Your BMI is a key indicator of your health, and the result is displayed on a color-coded scale to help you understand your current status. You can save all your data, including your BMI results, using the 'Save All Data' button at the bottom."
            isOpen={isHelpOpen}
            onClose={() => setIsHelpOpen(false)}
        />
      </div>

      <div className="mb-6 p-4 border border-purple-500 rounded-lg bg-gray-800 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-center text-purple-300">BMI Calculator</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="sm:col-span-2">
            <Label className="text-gray-400">Height</Label>
            <div className="flex gap-2">
              <Input id="heightFt" type="number" placeholder="ft" value={bmiData.heightFt} onChange={(e) => setBmiData({...bmiData, heightFt: e.target.value})} className="w-full bg-gray-700 border-gray-600 text-white" />
              <Input id="heightIn" type="number" placeholder="in" value={bmiData.heightIn} onChange={(e) => setBmiData({...bmiData, heightIn: e.target.value})} className="w-full bg-gray-700 border-gray-600 text-white" />
            </div>
          </div>
          <div>
            <Label htmlFor="weight-bmi" className="text-gray-400">Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'})</Label>
            <Input id="weight-bmi" type="number" placeholder="Enter weight" value={bmiData.weight} onChange={(e) => setBmiData({...bmiData, weight: e.target.value})} className="w-full bg-gray-700 border-gray-600 text-white" />
          </div>
          <div>
            <Label htmlFor="age" className="text-gray-400">Age</Label>
            <Input id="age" type="number" placeholder="Enter age" value={bmiData.age} onChange={(e) => setBmiData({...bmiData, age: e.target.value})} className="w-full bg-gray-700 border-gray-600 text-white" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="sex" className="text-gray-400">Sex</Label>
            <select id="sex" value={bmiData.sex} onChange={(e) => setBmiData({...bmiData, sex: e.target.value as BmiData['sex']})} className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2">
              <option value="">Select Sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <Button onClick={calculateBmi} className="w-full bg-purple-600 hover:bg-purple-700 mb-4">Calculate BMI</Button>
        {bmiResult && (
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <p className="text-lg">Your BMI is: <span className={`font-bold text-2xl ${getBmiResultColor()}`}>{bmiResult.value}</span></p>
            <p className={`text-lg font-semibold ${getBmiResultColor()}`}>{bmiResult.category}</p>
          </div>
        )}
        <BmiScaleGraph bmiValue={bmiResult ? bmiResult.value : null} />
      </div>

      <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg">
        <h3 className="text-xl font-semibold mb-3 text-center text-white">Your Picture</h3>
        {renderImageCarousel('user', userImages, currentUserImageIndex, 'No picture uploaded yet.')}
        <label htmlFor="user-image-upload" className="block w-full mt-4">
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
            <span><Upload className="mr-2 h-4 w-4 inline" /> Upload Picture(s)</span>
          </Button>
        </label>
        <Input
          id="user-image-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleImageUpload(e, 'user')}
          className="hidden"
        />
        <p className="text-xs text-gray-500 mt-2 text-center">Images are stored locally in your browser.</p>
      </div>

      <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg">
        <h3 className="text-xl font-semibold mb-3 text-center text-white">Measurements</h3>
        {measurementCategories.map(category => (
          <div key={category.title} className="mb-4">
            <h4 className="text-lg font-medium mb-2 text-gray-300 border-b border-gray-700 pb-1">{category.title}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {category.keys.map((key) => {
                const keyString = String(key);
                const currentUnit = measurements[key]?.unit || getDefaultUnit(key, unitSystem);
                return (
                  <div key={keyString}>
                    <Label htmlFor={keyString} className="block text-sm font-medium text-gray-400 capitalize mb-1">
                      {keyString.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <div className="flex items-center">
                      <Input
                        id={keyString}
                        type="number" 
                        placeholder={`Enter ${keyString.toLowerCase()}`}
                        value={measurements[key]?.value || ''} 
                        onChange={(e) => handleMeasurementChange(key, e.target.value)}
                        className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-500 rounded-md focus:ring-blue-500 focus:border-blue-500 mr-2"
                      />
                      <select 
                          value={currentUnit}
                          onChange={(e) => handleUnitChange(key, e.target.value as 'cm' | 'in' | 'kg' | 'lbs' | '%')}
                          className="bg-gray-700 border-gray-600 text-white rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        {key === 'weight' ? (
                          <>
                            <option value="lbs">lbs</option>
                            <option value="kg">kg</option>
                          </>
                        ) : key === 'bodyFatPercentage' ? (
                          <option value="%">%</option>
                        ) : (
                          <>
                            <option value="in">in</option>
                            <option value="cm">cm</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 mb-4">
        <Button onClick={saveMeasurements} className="w-full bg-green-600 hover:bg-green-700 text-lg py-3">
          Save All Data
        </Button>
      </div>
    </div>
  );
};

export default BodyMetricsPage;