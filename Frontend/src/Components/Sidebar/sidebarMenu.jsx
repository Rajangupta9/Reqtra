import React, { useState } from 'react';
import { Box, IconButton, Tooltip, useTheme, alpha } from '@mui/material';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import HistoryIcon from '@mui/icons-material/History';
import { TableRowsOutlined } from '@mui/icons-material';
import { ThemeToggleButton } from '../../Theme/ThemeToggleButton';

export const PostmanStyleSidebar = ({ onViewChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeView, setActiveView] = useState('collections');

  const handleIconClick = (viewName) => {
    setActiveView(viewName);
    if (onViewChange) onViewChange(viewName);
  };

  const navItems = [
    { name: 'collections', label: 'Collections', icon: TopicOutlinedIcon },
    { name: 'environments', label: 'Environments', icon: TableRowsOutlined },
    { name: 'history', label: 'History', icon: HistoryIcon },
  ];

  const NavButton = ({ item }) => {
    const isActive = activeView === item.name;
    const IconComponent = item.icon;

    return (
      <Tooltip title={item.label} placement="right" arrow>
        <IconButton
          onClick={() => handleIconClick(item.name)}
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
            backgroundColor: isActive
              ? alpha(theme.palette.primary.main, isDark ? 0.14 : 0.09)
              : 'transparent',
            transition: 'all 0.15s ease',
            '&:hover': {
              color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
              backgroundColor: isActive
                ? alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12)
                : theme.palette.action.hover,
            },
            '& .MuiSvgIcon-root': { fontSize: 18 },
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
        width: 52,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.5,
        px: '8px',
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        flexShrink: 0,
      }}
    >
      {/* Top nav */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {navItems.map((item) => (
          <NavButton key={item.name} item={item} />
        ))}
      </Box>

      {/* Bottom: theme toggle */}
      <Box>
        <ThemeToggleButton />
      </Box>
    </Box>
  );
};
