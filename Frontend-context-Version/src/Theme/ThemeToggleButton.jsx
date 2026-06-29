import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useColorMode } from "./ThemeContext";
import { DarkModeOutlined, LightModeOutlined } from "@mui/icons-material";



export const ThemeToggleButton = () => {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
      <IconButton color="inherit" onClick={toggleColorMode} sx={{
        borderRadius: 1, 
        p: 1,
        height: "48px",
        width: "48px"
      }}>
        {mode === "light" ? <DarkModeOutlined /> : <LightModeOutlined />}
      </IconButton>
    </Tooltip>
  );
};

