import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const SectionHeader = ({ label, title, subtitle, align = 'center', sx = {} }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        textAlign: align,
        mb: 8,
        maxWidth: align === 'center' ? 720 : 'none',
        mx: align === 'center' ? 'auto' : 0,
        ...sx,
      }}
    >
      {label && (
        <Chip
          label={label}
          size="small"
          sx={{
            mb: 2.5,
            px: 1.5,
            height: 28,
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            background: isDark
              ? alpha('#3B82F6', 0.15)
              : alpha('#3B82F6', 0.1),
            color: '#3B82F6',
            border: `1px solid ${alpha('#3B82F6', 0.2)}`,
            borderRadius: '8px',
          }}
        />
      )}
      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          mb: subtitle ? 2.5 : 0,
          background: isDark
            ? 'linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%)'
            : 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: '1rem', md: '1.15rem' },
            fontWeight: 400,
            lineHeight: 1.7,
            color: isDark ? alpha('#FFFFFF', 0.55) : alpha('#0F172A', 0.55),
            maxWidth: 560,
            mx: align === 'center' ? 'auto' : 0,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default SectionHeader;
