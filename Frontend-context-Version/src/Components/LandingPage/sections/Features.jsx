import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { featureCards } from '../data/features';
import SectionHeader from '../ui/SectionHeader';
import GlassCard from '../ui/GlassCard';

const Features = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box id="features" sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth="lg">
        <SectionHeader
          label="Features"
          title="Why Developers Choose Reqtra"
          subtitle="A powerful, fast, and beautiful API platform with everything you need — nothing you don't."
        />

        <Grid container spacing={3}>
          {featureCards.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={feature.title}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <GlassCard
                    gradient
                    sx={{
                      height: '100%',
                      cursor: 'default',
                    }}
                  >
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: alpha('#3B82F6', isDark ? 0.12 : 0.08),
                        mb: 2.5,
                      }}
                    >
                      <IconComponent sx={{
                        fontSize: 26,
                        color: feature.gradient.includes('#E535AB') ? '#E535AB'
                          : feature.gradient.includes('#22C55E') ? '#22C55E'
                          : feature.gradient.includes('#F59E0B') ? '#F59E0B'
                          : feature.gradient.includes('#06B6D4') ? '#06B6D4'
                          : feature.gradient.includes('#7C3AED') ? '#7C3AED'
                          : '#3B82F6',
                      }} />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        mb: 1,
                        color: isDark ? '#FFFFFF' : '#0F172A',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        lineHeight: 1.7,
                        color: isDark ? alpha('#FFFFFF', 0.5) : alpha('#0F172A', 0.5),
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </GlassCard>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default Features;
