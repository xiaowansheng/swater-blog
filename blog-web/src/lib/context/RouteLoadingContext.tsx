'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface RouteLoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const RouteLoadingContext = createContext<RouteLoadingContextType | undefined>(undefined);

export function RouteLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <RouteLoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </RouteLoadingContext.Provider>
  );
}

export function useRouteLoadingContext() {
  const context = useContext(RouteLoadingContext);
  if (context === undefined) {
    throw new Error('useRouteLoadingContext must be used within a RouteLoadingProvider');
  }
  return context;
}