import React from 'react';
import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const GlassCard = ({ children, sx = {}, gradient = false, hover = true, ...props }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component={motion.div}
      whileHover={hover ? { y: -4, scale: 1.015 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      sx={{
        position: 'relative',
        borderRadius: '20px',
        padding: '32px',
        overflow: 'hidden',
        background: isDark
          ? alpha('#1E293B', 0.6)
          : alpha('#FFFFFF', 0.8),
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.06)}`,
        boxShadow: isDark
          ? `0 8px 32px ${alpha('#000000', 0.3)}`
          : `0 8px 32px ${alpha('#000000', 0.06)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': hover ? {
          border: `1px solid ${isDark ? alpha('#FFFFFF', 0.15) : alpha('#3B82F6', 0.2)}`,
          boxShadow: isDark
            ? `0 16px 48px ${alpha('#000000', 0.4)}, 0 0 0 1px ${alpha('#3B82F6', 0.1)}`
            : `0 16px 48px ${alpha('#3B82F6', 0.1)}`,
        } : {},
        ...(gradient && {
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '20px',
            padding: '1px',
            background: 'linear-gradient(135deg, #3B82F6, #7C3AED, #3B82F6)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover::before': {
            opacity: 1,
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default GlassCard;
