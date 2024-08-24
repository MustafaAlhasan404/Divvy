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
}

const defaultTheme: ThemeColors = {
  primary: '#121212',     // Dark background - remains the same
  secondary: '#1E1E1E',   // Slightly lighter than primary for contrast - remains the same
  background: '#181818',  // Darker than secondary but lighter than primary for balance
  text: '#FFFFFF',        // White text for high contrast - remains the same
  accent: '#fad54b',      // Accent color - remains the same

  positive: '#4CAF50', // A darker green for positive indicators
  negative: '#FF6B6B', // Red for negative indicators
  neutral: '#FFD700', // Gold for neutral indicators
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