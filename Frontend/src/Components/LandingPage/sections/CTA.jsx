import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import GradientButton from '../ui/GradientButton';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const CTA = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{
      py: { xs: 10, md: 14 },
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box sx={{
            textAlign: 'center',
            py: { xs: 6, md: 8 },
            px: { xs: 3, md: 6 },
            borderRadius: '28px',
            position: 'relative',
            overflow: 'hidden',
            background: isDark
              ? `linear-gradient(135deg, ${alpha('#3B82F6', 0.1)}, ${alpha('#7C3AED', 0.08)}, ${alpha('#3B82F6', 0.05)})`
              : `linear-gradient(135deg, ${alpha('#3B82F6', 0.06)}, ${alpha('#7C3AED', 0.04)}, ${alpha('#3B82F6', 0.02)})`,
            border: `1px solid ${isDark ? alpha('#3B82F6', 0.15) : alpha('#3B82F6', 0.1)}`,
          }}>
            {/* Animated gradient orbs */}
            <Box component={motion.div}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              sx={{
                position: 'absolute', top: '-50%', left: '-20%',
                width: 400, height: 400, borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha('#3B82F6', 0.08)} 0%, transparent 70%)`,
                filter: 'blur(40px)',
              }}
            />
            <Box component={motion.div}
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              sx={{
                position: 'absolute', bottom: '-50%', right: '-20%',
                width: 400, height: 400, borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha('#7C3AED', 0.08)} 0%, transparent 70%)`,
                filter: 'blur(40px)',
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 800,
                letterSpacing: '-0.03em',
                mb: 2,
                color: isDark ? '#FFFFFF' : '#0F172A',
              }}>
                Ready to Build{' '}
                <Box component="span" sx={{
                  background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Better APIs
                </Box>
                ?
              </Typography>
              <Typography sx={{
                fontSize: '1.05rem',
                lineHeight: 1.7,
                color: isDark ? alpha('#FFFFFF', 0.5) : alpha('#0F172A', 0.5),
                mb: 4,
                maxWidth: 460,
                mx: 'auto',
              }}>
                Join thousands of developers shipping faster with Reqtra. Free forever, no credit card required.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                <GradientButton>Start Free</GradientButton>
                <GradientButton variant="outlined" startIcon={<MenuBookIcon />}>
                  View Documentation
                </GradientButton>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default CTA;
