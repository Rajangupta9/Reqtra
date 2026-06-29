import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { workflowSteps } from '../data/features';
import SectionHeader from '../ui/SectionHeader';

const Workflow = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth="md">
        <SectionHeader
          label="Workflow"
          title="Developer Workflow, Simplified"
          subtitle="From creating your first request to sharing with your team — in five simple steps."
        />

        <Box sx={{ position: 'relative', maxWidth: 520, mx: 'auto' }}>
          {/* Vertical line */}
          <Box sx={{
            position: 'absolute',
            left: 24,
            top: 32,
            bottom: 32,
            width: 2,
            background: isDark
              ? `linear-gradient(180deg, ${alpha('#3B82F6', 0.4)}, ${alpha('#7C3AED', 0.4)}, ${alpha('#3B82F6', 0.1)})`
              : `linear-gradient(180deg, ${alpha('#3B82F6', 0.3)}, ${alpha('#7C3AED', 0.3)}, ${alpha('#3B82F6', 0.1)})`,
            borderRadius: 1,
          }} />

          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Box sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 3,
                mb: index < workflowSteps.length - 1 ? 5 : 0,
                position: 'relative',
              }}>
                {/* Step number */}
                <Box sx={{
                  width: 50,
                  height: 50,
                  minWidth: 50,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${alpha('#3B82F6', 0.15)}, ${alpha('#7C3AED', 0.15)})`,
                  border: `1px solid ${alpha('#3B82F6', 0.2)}`,
                  zIndex: 1,
                }}>
                  <Typography sx={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {step.step}
                  </Typography>
                </Box>

                {/* Content */}
                <Box sx={{ pt: 0.5 }}>
                  <Typography sx={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    mb: 0.5,
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    letterSpacing: '-0.01em',
                  }}>
                    {step.title}
                  </Typography>
                  <Typography sx={{
                    fontSize: '0.875rem',
                    lineHeight: 1.7,
                    color: isDark ? alpha('#FFFFFF', 0.5) : alpha('#0F172A', 0.5),
                  }}>
                    {step.description}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Workflow;
