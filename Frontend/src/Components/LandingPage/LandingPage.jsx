import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import TrustedBy from './sections/TrustedBy';
import Features from './sections/Features';
import Dashboard from './sections/Dashboard';
import Workflow from './sections/Workflow';
import PowerFeatures from './sections/PowerFeatures';
import Statistics from './sections/Statistics';
import Testimonials from './sections/Testimonials';
import Pricing from './sections/Pricing';
import OpenSource from './sections/OpenSource';
import FAQ from './sections/FAQ';
import CTA from './sections/CTA';
import Footer from './sections/Footer';

const LandingPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: isDark ? '#020617' : '#F8FAFC',
      color: isDark ? '#FFFFFF' : '#0F172A',
      overflowX: 'hidden',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    }}>
      <CssBaseline />
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <Dashboard />
      <Workflow />
      <PowerFeatures />
      <Statistics />
      <Testimonials />
      <Pricing />
      <OpenSource />
      <FAQ />
      <CTA />
      <Footer />
    </Box>
  );
};

export default LandingPage;
