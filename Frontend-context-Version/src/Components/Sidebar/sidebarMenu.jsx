import React, { useState } from 'react';
import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import HistoryIcon from '@mui/icons-material/History';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { DataObjectRounded, DynamicFeed, TableRowsOutlined } from '@mui/icons-material';
import { ThemeToggleButton } from '../../Theme/ThemeToggleButton';


export const PostmanStyleSidebar = ({ onViewChange }) => {
  const theme = useTheme();
  const [activeView, setActiveView] = useState('collections');

  const handleIconClick = (viewName) => {
    setActiveView(viewName);
    if (onViewChange) {
      onViewChange(viewName);
    }
  };

  const navItems = [
    { name: 'collections', label: 'Collections', icon: TopicOutlinedIcon },
    { name: 'environments', label: 'Environments', icon: TableRowsOutlined },
    { name: 'history', label: 'History', icon: HistoryIcon },
  ];

  const bottomNavItems = [
    // { name: 'Switch Theme', label: "Theme" , icon: DynamicFeed},
    // { name: 'settings', label: 'Settings', icon: SettingsOutlinedIcon },
  ];

  const NavButton = ({ item }) => {
    const isActive = activeView === item.name;
    const color = isActive ? theme.palette.primary.main : theme.palette.text.secondary;
    const IconComponent = item.icon;

    return (
      <Tooltip title={item.label} placement="right" arrow>
        <IconButton
          onClick={() => handleIconClick(item.name)}
          sx={{
            position: 'relative',
            width: 48,
            height: 48,
            borderRadius: '10px',
            color: color,
            '&::before': { 
              content: '""',
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '4px',
              height: isActive ? '24px' : '0px',
              backgroundColor: theme.palette.primary.main,
              borderRadius: '0 4px 4px 0',
              transition: 'height 0.2s ease-in-out',
            },
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            }
          }}
        >
          <IconComponent />
        </IconButton>
      </Tooltip>
    );
  };


  return (
    <Box
      sx={{
        width: 60,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        flexShrink: 0,
      }}
    >
      {/* Top Icons */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {navItems.map((item) => <NavButton key={item.name} item={item} />)}
      </Box>

      {/* Bottom Icons */}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <ThemeToggleButton />
       {bottomNavItems.map((item) => <NavButton key={item.name} item={item} />)}
      </Box>
    </Box>
  );
};

