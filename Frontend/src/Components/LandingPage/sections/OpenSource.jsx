import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import GitHubIcon from '@mui/icons-material/GitHub';
import StarIcon from '@mui/icons-material/Star';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import GroupIcon from '@mui/icons-material/Group';
import SectionHeader from '../ui/SectionHeader';
import GradientButton from '../ui/GradientButton';
import AnimatedCounter from '../ui/AnimatedCounter';

const StatItem = ({ icon: Icon, value, label, suffix }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Icon sx={{ fontSize: 24, color: isDark ? alpha('#FFFFFF', 0.4) : alpha('#0F172A', 0.35), mb: 1 }} />
      <AnimatedCounter
        value={value}
        suffix={suffix}
        sx={{
          fontSize: '1.8rem',
          fontWeight: 800,
          color: isDark ? '#FFFFFF' : '#0F172A',
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
        }}
      />
      <Typography sx={{
        fontSize: '0.78rem', fontWeight: 500, mt: 0.3,
        color: isDark ? alpha('#FFFFFF', 0.4) : alpha('#0F172A', 0.4),
      }}>
        {label}
      </Typography>
    </Box>
  );
};

const OpenSource = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box sx={{
            p: { xs: 4, md: 6 },
            borderRadius: '28px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: isDark
              ? `linear-gradient(135deg, ${alpha('#1E293B', 0.7)}, ${alpha('#0F172A', 0.7)})`
              : alpha('#FFFFFF', 0.8),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.06)}`,
            boxShadow: isDark
              ? `0 20px 60px ${alpha('#000000', 0.3)}`
              : `0 20px 60px ${alpha('#000000', 0.06)}`,
          }}>
            {/* Background pattern */}
            <Box sx={{
              position: 'absolute', inset: 0, opacity: 0.03,
              backgroundImage: `
                radial-gradient(circle at 20% 20%, ${alpha('#3B82F6', 1)} 1px, transparent 1px),
                radial-gradient(circle at 80% 80%, ${alpha('#7C3AED', 1)} 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }} />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <GitHubIcon sx={{
                fontSize: 56, mb: 3,
                color: isDark ? alpha('#FFFFFF', 0.8) : alpha('#0F172A', 0.8),
              }} />

              <Typography sx={{
                fontSize: { xs: '1.8rem', md: '2.2rem' },
                fontWeight: 800,
                letterSpacing: '-0.03em',
                mb: 1.5,
                color: isDark ? '#FFFFFF' : '#0F172A',
              }}>
                Open Source & Free
              </Typography>
              <Typography sx={{
                fontSize: '1rem',
                lineHeight: 1.7,
                color: isDark ? alpha('#FFFFFF', 0.5) : alpha('#0F172A', 0.5),
                mb: 4,
                maxWidth: 440,
                mx: 'auto',
              }}>
                Reqtra is open source. Contribute, self-host, or customize it to fit your workflow.
              </Typography>

              <Grid container spacing={4} sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                <Grid size={4}>
                  <StatItem icon={StarIcon} value={12400} suffix="" label="Stars" />
                </Grid>
                <Grid size={4}>
                  <StatItem icon={CallSplitIcon} value={1800} suffix="" label="Forks" />
                </Grid>
                <Grid size={4}>
                  <StatItem icon={GroupIcon} value={340} suffix="" label="Contributors" />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                <GradientButton startIcon={<GitHubIcon />}>
                  View on GitHub
                </GradientButton>
                <GradientButton variant="outlined">
                  Read Documentation
                </GradientButton>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default OpenSource;
