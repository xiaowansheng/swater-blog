'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type DecorationLevel = 'none' | 'light' | 'full';
export type WeatherType = 'sakura' | 'rain' | 'thunder' | 'snow' | 'leaves';

interface DecorationContextType {
  level: DecorationLevel;
  setLevel: (level: DecorationLevel) => void;
  weather: WeatherType;
}

const DecorationContext = createContext<DecorationContextType | undefined>(undefined);

export function DecorationProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevel] = useState<DecorationLevel>('full');
  const [weather, setWeather] = useState<WeatherType>('sakura');

  // Load level from localStorage
  useEffect(() => {
    const savedLevel = localStorage.getItem('decoration-level') as DecorationLevel;
    if (savedLevel && ['none', 'light', 'full'].includes(savedLevel)) {
      setLevel(savedLevel);
    }
  }, []);

  // Determine weather based on date and probability
  useEffect(() => {
    const month = new Date().getMonth(); // 0-11
    const random = Math.random();
    let newWeather: WeatherType = 'sakura'; // Default weather

    // Summer: May (4) - August (7)
    if (month >= 4 && month <= 7) {
      if (random < 0.1) newWeather = 'thunder';      // 10% Thunder
      else if (random < 0.4) newWeather = 'rain';    // 30% Rain (0.1 to 0.4)
    } 
    // Autumn: September (8) - November (10)
    else if (month >= 8 && month <= 10) {
      if (random < 0.3) newWeather = 'leaves';       // 30% Leaves
    } 
    // Winter: December (11), January (0), February (1)
    else if (month === 11 || month <= 1) {
      if (random < 0.3) newWeather = 'snow';         // 30% Snow
    }
    // Spring (default Sakura) is covered by initialization

    setWeather(newWeather);
  }, []);

  const handleSetLevel = (newLevel: DecorationLevel) => {
    setLevel(newLevel);
    localStorage.setItem('decoration-level', newLevel);
  };

  return (
    <DecorationContext.Provider value={{ 
      level, 
      setLevel: handleSetLevel,
      weather
    }}>
      {children}
    </DecorationContext.Provider>
  );
}

export function useDecoration() {
  const context = useContext(DecorationContext);
  if (context === undefined) {
    throw new Error('useDecoration must be used within a DecorationProvider');
  }
  return context;
}