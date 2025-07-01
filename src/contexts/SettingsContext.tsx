import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type UnitSystem = 'imperial' | 'metric';

interface SettingsContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => {
    const savedUnitSystem = localStorage.getItem('unitSystem') as UnitSystem | null;
    return savedUnitSystem || 'imperial'; // Default to imperial
  });

  useEffect(() => {
    localStorage.setItem('unitSystem', unitSystem);
  }, [unitSystem]);

  const setUnitSystem = (system: UnitSystem) => {
    setUnitSystemState(system);
  };

  return (
    <SettingsContext.Provider value={{ unitSystem, setUnitSystem }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};