import React, { createContext, useContext } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  positive:string;
  negative:string;
  neutral:string;
  recentActivity :string;
}

const defaultTheme: ThemeColors = {
  primary: '#052224',
  secondary: '#0E3E3E',
  background: '#031314',
  text: '#00D09E',
  accent: '#00D09E',
  positive: '#00FF9D',
  negative: '#FF6B6B',
  neutral: '#FFD700',
  recentActivity: '#1A5050',
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
  
