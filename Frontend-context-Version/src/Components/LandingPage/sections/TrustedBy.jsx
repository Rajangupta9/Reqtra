import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const companies = [
  'Vercel', 'Stripe', 'Linear', 'Supabase', 'Cloudflare',
  'Figma', 'Notion', 'GitLab', 'Railway', 'Prisma',
  'PlanetScale', 'Neon', 'Resend', 'Turso', 'Fly.io',
];

const TrustedBy = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const marqueeItems = [...companies, ...companies];

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      sx={{ py: { xs: 6, md: 8 }, overflow: 'hidden' }}
    >
      <Container maxWidth="lg">
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '0.8rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: isDark ? alpha('#FFFFFF', 0.3) : alpha('#0F172A', 0.3),
            mb: 4,
          }}
        >
          Trusted by developers at world-class companies
        </Typography>
      </Container>

      <Box sx={{ position: 'relative' }}>
        {/* Fade edges */}
        <Box sx={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, zIndex: 2,
          background: isDark
            ? 'linear-gradient(to right, #020617, transparent)'
            : 'linear-gradient(to right, #F8FAFC, transparent)',
        }} />
        <Box sx={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, zIndex: 2,
          background: isDark
            ? 'linear-gradient(to left, #020617, transparent)'
            : 'linear-gradient(to left, #F8FAFC, transparent)',
        }} />

        {/* Marquee */}
        <Box
          sx={{
            display: 'flex',
            animation: 'marquee 40s linear infinite',
            '@keyframes marquee': {
              '0%': { transform: 'translateX(0)' },
              '100%': { transform: 'translateX(-50%)' },
            },
            '&:hover': {
              animationPlayState: 'paused',
            },
          }}
        >
          {marqueeItems.map((company, i) => (
            <Box
              key={`${company}-${i}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 160,
                px: 4,
                py: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: isDark ? alpha('#FFFFFF', 0.35) : alpha('#0F172A', 0.28),
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em',
                  transition: 'color 0.3s ease',
                  cursor: 'default',
                  '&:hover': {
                    color: isDark ? alpha('#FFFFFF', 0.5) : alpha('#0F172A', 0.4),
                  },
                }}
              >
                {company}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TrustedBy;
