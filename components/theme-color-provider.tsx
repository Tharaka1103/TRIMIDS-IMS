"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeColor = 
  | "zinc"
  | "slate"
  | "stone"
  | "gray"
  | "neutral"
  | "red"
  | "rose"
  | "orange"
  | "green"
  | "blue"
  | "yellow"
  | "violet";

interface ThemeColorContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined);

export function useThemeColor() {
  const context = useContext(ThemeColorContext);
  if (!context) {
    throw new Error("useThemeColor must be used within a ThemeColorProvider");
  }
  return context;
}

export function ThemeColorProvider({
  children,
  defaultColor = "zinc",
}: {
  children: React.ReactNode;
  defaultColor?: ThemeColor;
}) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>(defaultColor);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedColor = localStorage.getItem("theme-color") as ThemeColor;
    if (savedColor) {
      setThemeColorState(savedColor);
    }
  }, []);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem("theme-color", color);
  };

  useEffect(() => {
    if (!isMounted) return;

    const root = document.documentElement;
    
    // Remove all existing theme color classes
    const colors: ThemeColor[] = [
      "zinc", "slate", "stone", "gray", "neutral", 
      "red", "rose", "orange", "green", "blue", "yellow", "violet"
    ];
    colors.forEach(c => {
      root.classList.remove(`theme-${c}`);
    });

    // Add current color
    root.classList.add(`theme-${themeColor}`);
  }, [themeColor, isMounted]);

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
      <div className={`theme-${themeColor} h-full`}>
        {children}
      </div>
    </ThemeColorContext.Provider>
  );
}
