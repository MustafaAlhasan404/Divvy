import React, { createContext, useContext } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  positive: string;
  negative: string;
  neutral: string;
  switchActive: string;
}

const defaultTheme: ThemeColors = {
  primary: '#121212',     // Dark background
  secondary: '#1E1E1E',   // Slightly lighter than primary for contrast
  background: '#181818',  // Darker than secondary but lighter than primary for balance
  text: '#FFFFFF',        // White text for high contrast
  accent: '#f7a600',      // Accent color
  positive: '#4CAF50',    // A darker green for positive indicators
  negative: '#FF6B6B',    // Red for negative indicators
  neutral: '#FFD700',     // Gold for neutral indicators
  switchActive: '#34C759', // Vibrant green for active switches
};

const ThemeContext = createContext<ThemeColors>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => (
  <ThemeContext.Provider value={defaultTheme}>
    {children}
  </ThemeContext.Provider>
);
