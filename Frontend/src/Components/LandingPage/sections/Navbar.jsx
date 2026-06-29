import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Box, Button, IconButton, Drawer,
  List, ListItem, ListItemButton, ListItemText, Typography, Container
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useColorMode } from '../../../Theme/ThemeContext';
import { navLinks } from '../data/navigation';
import GradientButton from '../ui/GradientButton';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const theme = useTheme();
  const { toggleColorMode, mode } = useColorMode();
  const isDark = mode === 'dark';
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href) => {
    setDrawerOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: scrolled
            ? isDark
              ? alpha('#0F172A', 0.85)
              : alpha('#FFFFFF', 0.85)
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrolled
            ? `1px solid ${isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.06)}`
            : '1px solid transparent',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1200,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              height: scrolled ? 64 : 72,
              transition: 'height 0.35s ease',
              justifyContent: 'space-between',
            }}
          >
            {/* Logo */}
            <Box
              onClick={() => handleNavClick('#home')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: '#FFFFFF',
                  boxShadow: `0 2px 12px ${alpha('#3B82F6', 0.4)}`,
                }}
              >
                R
              </Box>
              <Typography
                sx={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                }}
              >
                Reqtra
              </Typography>
            </Box>

            {/* Desktop Nav */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  sx={{
                    color: isDark ? alpha('#FFFFFF', 0.7) : alpha('#0F172A', 0.65),
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    px: 2,
                    py: 1,
                    borderRadius: '10px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      backgroundColor: isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.04),
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
              <IconButton
                onClick={() => window.open('https://github.com', '_blank')}
                size="small"
                sx={{
                  color: isDark ? alpha('#FFFFFF', 0.5) : alpha('#0F172A', 0.5),
                  ml: 0.5,
                  '&:hover': { color: isDark ? '#FFFFFF' : '#0F172A' },
                }}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Right side */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={toggleColorMode}
                size="small"
                sx={{
                  color: isDark ? alpha('#FFFFFF', 0.6) : alpha('#0F172A', 0.6),
                  '&:hover': {
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    backgroundColor: isDark ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.05),
                  },
                }}
              >
                {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
              <Button
                onClick={() => navigate('/login')}
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  color: isDark ? alpha('#FFFFFF', 0.8) : alpha('#0F172A', 0.7),
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  borderRadius: '10px',
                  '&:hover': {
                    color: isDark ? '#FFFFFF' : '#0F172A',
                  },
                }}
              >
                Login
              </Button>
              <GradientButton
                size="small"
                onClick={() => navigate('/signup')}
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  px: 2.5,
                  py: 0.8,
                  fontSize: '0.85rem',
                }}
              >
                Get Started
              </GradientButton>
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  color: isDark ? '#FFFFFF' : '#0F172A',
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            background: isDark ? '#0F172A' : '#FFFFFF',
            borderLeft: `1px solid ${isDark ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.06)}`,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {navLinks.map((link) => (
              <ListItem key={link.label} disablePadding>
                <ListItemButton
                  onClick={() => handleNavClick(link.href)}
                  sx={{ borderRadius: '10px', mb: 0.5 }}
                >
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5, px: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => { setDrawerOpen(false); navigate('/login'); }}
              sx={{ borderRadius: '12px', textTransform: 'none' }}
            >
              Login
            </Button>
            <GradientButton
              fullWidth
              onClick={() => { setDrawerOpen(false); navigate('/signup'); }}
            >
              Get Started
            </GradientButton>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
