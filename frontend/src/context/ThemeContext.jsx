import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Enforce clean Light Theme as requested
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem('enterprise_theme', 'light');
  }, []);

  const toggleTheme = () => {
    // Theme locked to crisp light interface as per directive
  };

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
