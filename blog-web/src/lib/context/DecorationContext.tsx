'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type DecorationLevel = 'none' | 'light' | 'full';

interface DecorationContextType {
  level: DecorationLevel;
  setLevel: (level: DecorationLevel) => void;
}

const DecorationContext = createContext<DecorationContextType | undefined>(undefined);

export function DecorationProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevel] = useState<DecorationLevel>('full');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('decoration-level') as DecorationLevel;
    if (saved && ['none', 'light', 'full'].includes(saved)) {
      setLevel(saved);
    }
  }, []);

  const handleSetLevel = (newLevel: DecorationLevel) => {
    setLevel(newLevel);
    localStorage.setItem('decoration-level', newLevel);
  };

  return (
    <DecorationContext.Provider value={{ level, setLevel: handleSetLevel }}>
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