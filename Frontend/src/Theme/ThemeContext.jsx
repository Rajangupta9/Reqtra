import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { getDesignTokens } from './theme'; 

const ColorModeContext = createContext({ 
  toggleColorMode: () => {},
  mode: 'dark' 
});

export const CustomThemeProvider = ({ children }) => {

  const [mode, setMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem('theme-mode');
      return savedMode || 'dark';
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme-mode', mode);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode, 
    }),
    [mode],
  );

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within a CustomThemeProvider');
  }
  return context;
};