import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { statistics } from '../data/features';
import AnimatedCounter from '../ui/AnimatedCounter';

const Statistics = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{
      py: { xs: 10, md: 14 },
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <Box sx={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: isDark
          ? `radial-gradient(ellipse 80% 50% at 50% 50%, ${alpha('#3B82F6', 0.06)} 0%, transparent 70%)`
          : `radial-gradient(ellipse 80% 50% at 50% 50%, ${alpha('#3B82F6', 0.04)} 0%, transparent 70%)`,
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3}>
          {statistics.map((stat, index) => (
            <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Box sx={{
                  textAlign: 'center',
                  py: { xs: 3, md: 4 },
                  px: 2,
                  borderRadius: '20px',
                  background: isDark ? alpha('#1E293B', 0.4) : alpha('#FFFFFF', 0.6),
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.04)}`,
                }}>
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                    decimals={stat.label === 'Uptime' ? 2 : 0}
                    sx={{
                      fontSize: { xs: '2rem', md: '2.75rem' },
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      lineHeight: 1.2,
                      mb: 1,
                    }}
                  />
                  <Typography sx={{
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: isDark ? alpha('#FFFFFF', 0.45) : alpha('#0F172A', 0.45),
                  }}>
                    {stat.label}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Statistics;
