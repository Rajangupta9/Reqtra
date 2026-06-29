import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { powerFeatures } from '../data/features';
import SectionHeader from '../ui/SectionHeader';

const PowerFeatures = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth="lg">
        <SectionHeader
          label="Capabilities"
          title="Powerful Features, Zero Bloat"
          subtitle="Every tool a developer needs, thoughtfully designed and instantly accessible."
        />

        <Grid container spacing={2}>
          {powerFeatures.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={feature.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Box
                  component={motion.div}
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    cursor: 'default',
                    border: `1px solid ${isDark ? alpha('#FFFFFF', 0.04) : alpha('#000000', 0.04)}`,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      backgroundColor: isDark ? alpha('#FFFFFF', 0.03) : alpha('#3B82F6', 0.03),
                      border: `1px solid ${isDark ? alpha('#FFFFFF', 0.08) : alpha('#3B82F6', 0.1)}`,
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '1.4rem', mb: 1.5 }}>
                    {feature.icon}
                  </Typography>
                  <Typography sx={{
                    fontSize: '0.9rem', fontWeight: 650, mb: 0.5,
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    letterSpacing: '-0.01em',
                  }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{
                    fontSize: '0.8rem', lineHeight: 1.6,
                    color: isDark ? alpha('#FFFFFF', 0.4) : alpha('#0F172A', 0.45),
                  }}>
                    {feature.description}
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

export default PowerFeatures;
