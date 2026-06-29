import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { LogoutOutlined, SettingsOutlined, PersonOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { useApp } from "../../ContextApi/AppContext";
import { useColorMode } from "../../Theme/ThemeContext";

export const Navbar = ({ isMobile, handleDrawerToggle, collections = 1 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
    <AppBar position="static" elevation={0} sx={{ borderRadius: 0 }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          minHeight: '56px !important',
          height: 56,
        }}
      >
        {/* Left: Logo + mobile menu */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              size="small"
              sx={{ mr: 0.5 }}
            >
              <MenuIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}

          <Box
            component="img"
            src={mode === "light" ? "reqtra_light.svg" : "reqtra_dark.svg"}
            alt="Reqtra"
            sx={{
              height: 18,
              cursor: "pointer",
              display: "block",
              opacity: 0.9,
              '&:hover': { opacity: 1 },
              transition: 'opacity 0.15s ease',
            }}
          />
        </Box>

        {/* Right: Workspace + Avatar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <WorkspaceSelector
            collections={collections}
            onWorkspaceSelect={setSelectedWorkspace}
            selectedWorkspace={selectedWorkspace}
          />

          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{
              p: 0,
              border: `1.5px solid ${anchorEl ? theme.palette.primary.main : 'transparent'}`,
              borderRadius: '50%',
              transition: 'border-color 0.15s ease',
              '&:hover': { borderColor: theme.palette.divider },
            }}
          >
            <Avatar
              alt="User"
              src="/static/images/avatar/1.jpg"
              sx={{ width: 28, height: 28, fontSize: '12px', bgcolor: theme.palette.primary.main }}
            />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px',
                boxShadow: isDark
                  ? '0 8px 24px rgba(0,0,0,0.6)'
                  : '0 8px 24px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Box sx={{ px: 1.5, py: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', letterSpacing: '0.02em' }}>
                Account
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => { handleMenuClose(); navigate("/settings"); }}
              sx={{ gap: 1.5, mt: 0.5 }}
            >
              <SettingsOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2">Settings</Typography>
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                gap: 1.5,
                mb: 0.5,
                color: 'error.main',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                },
              }}
            >
              <LogoutOutlined sx={{ fontSize: 16 }} />
              <Typography variant="body2" color="inherit">Log out</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
