import React from 'react';
import { Button } from '@mui/material';
import { alpha } from '@mui/material/styles';

const GradientButton = ({ children, variant = 'contained', size = 'large', sx = {}, ...props }) => {
  if (variant === 'outlined') {
    return (
      <Button
        variant="outlined"
        size={size}
        sx={{
          borderRadius: '14px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: size === 'large' ? '1rem' : '0.875rem',
          px: size === 'large' ? 4 : 3,
          py: size === 'large' ? 1.5 : 1,
          borderColor: alpha('#3B82F6', 0.4),
          color: '#3B82F6',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#3B82F6',
            backgroundColor: alpha('#3B82F6', 0.08),
            transform: 'translateY(-1px)',
          },
          ...sx,
        }}
        {...props}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      variant="contained"
      size={size}
      sx={{
        borderRadius: '14px',
        textTransform: 'none',
        fontWeight: 600,
        fontSize: size === 'large' ? '1rem' : '0.875rem',
        px: size === 'large' ? 4 : 3,
        py: size === 'large' ? 1.5 : 1,
        background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
        boxShadow: `0 4px 16px ${alpha('#3B82F6', 0.35)}`,
        border: 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          background: 'linear-gradient(135deg, #2563EB 0%, #6D28D9 100%)',
          boxShadow: `0 8px 24px ${alpha('#3B82F6', 0.45)}`,
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0px)',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default GradientButton;
