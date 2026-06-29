import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { useApp } from "../../ContextApi/AppContext";
import { useColorMode } from "../../Theme/ThemeContext";

export const Navbar = ({
  isMobile,
  handleDrawerToggle,
  collections = 1,
}) => {

  
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { mode } = useColorMode();
  const { selectedWorkspace, setSelectedWorkspace } = useApp();

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    handleMenuClose();
    navigate("/login");
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        borderRadius: 0,
        bgcolor: "background.paper",
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          minHeight: 56,
        }}
      >
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            component="img"
            src={mode === "light" ? "reqtra_light.svg" : "reqtra_dark.svg"}
            alt="logo"
            sx={{
              height: 20,
              cursor: "pointer",
              display: "block",
            }}
            // onClick={() => navigate("/")}
          />
        </Box>

        
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <WorkspaceSelector
            collections={collections}
            onWorkspaceSelect={setSelectedWorkspace}
            selectedWorkspace={selectedWorkspace}
          />

          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar alt="User" src="/static/images/avatar/1.jpg" />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/settings");
              }}
            >
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
