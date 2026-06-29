import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Chip
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { ThemeToggleButton } from "../../Theme/ThemeToggleButton"; 
import { useNavigate } from "react-router-dom";

export const Navbar = ({  isMobile, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

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
      sx={{
        borderRadius: 0,
        
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        

        <img src="reqtraIcon.png"  style={{height:'40px'}}/>
        <Typography variant="h6" sx={{fontWeight: '500' , ml:'-10px'}}>REQTRA</Typography>
        <Box component='div' sx={{flexGrow: 1 , ml: 10}}>
            <Chip label="Development" sx={{
                color: 'text.primary'
            }}/>
        </Box>

        <ThemeToggleButton />

       
        <Box>
          <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
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
            <MenuItem onClick={() => { handleMenuClose(); navigate("/settings"); }}>
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
