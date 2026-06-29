import React from "react";
import { IconButton, Tooltip, alpha, useTheme } from "@mui/material";
import { DarkModeOutlined, LightModeOutlined } from "@mui/icons-material";
import { useColorMode } from "./ThemeContext";

export const ThemeToggleButton = () => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const isDark = mode === 'dark';

  return (
    <Tooltip title={`Switch to ${isDark ? "light" : "dark"} mode`} placement="right" arrow>
      <IconButton
        onClick={toggleColorMode}
        sx={{
          width: 36,
          height: 36,
          borderRadius: '8px',
          color: theme.palette.text.secondary,
          transition: 'all 0.15s ease',
          '&:hover': {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.action.hover,
          },
          '& .MuiSvgIcon-root': { fontSize: 18 },
        }}
      >
        {isDark ? <LightModeOutlined /> : <DarkModeOutlined />}
      </IconButton>
    </Tooltip>
  );
};
