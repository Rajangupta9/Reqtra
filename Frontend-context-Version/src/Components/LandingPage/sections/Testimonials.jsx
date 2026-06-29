import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Container, Avatar, Rating } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { testimonials } from '../data/testimonials';
import SectionHeader from '../ui/SectionHeader';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const Testimonials = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const itemsPerView = 3;
  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  const advance = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(advance, 4000);
    return () => clearInterval(timer);
  }, [isPaused, advance]);

  return (
    <Box sx={{ py: { xs: 10, md: 14 }, overflow: 'hidden' }}>
      <Container maxWidth="lg">
        <SectionHeader
          label="Testimonials"
          title="Loved by Developers Worldwide"
          subtitle="Join thousands of developers who've made Reqtra their go-to API platform."
        />

        <Box
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          sx={{ position: 'relative' }}
        >
          <Box sx={{
            display: 'flex',
            gap: 3,
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: `translateX(-${currentIndex * (100 / itemsPerView + 2.5)}%)`,
          }}>
            {testimonials.map((t, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: { xs: '85%', sm: '45%', md: `calc(${100 / itemsPerView}% - 16px)` },
                  flexShrink: 0,
                }}
              >
                <Box sx={{
                  p: 3.5,
                  borderRadius: '20px',
                  height: '100%',
                  background: isDark ? alpha('#1E293B', 0.5) : alpha('#FFFFFF', 0.8),
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.05)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: `1px solid ${isDark ? alpha('#FFFFFF', 0.12) : alpha('#3B82F6', 0.15)}`,
                    boxShadow: isDark
                      ? `0 8px 32px ${alpha('#000000', 0.3)}`
                      : `0 8px 32px ${alpha('#000000', 0.06)}`,
                  },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                    <Rating
                      value={t.rating}
                      readOnly
                      size="small"
                      sx={{
                        '& .MuiRating-iconFilled': { color: '#F59E0B' },
                        fontSize: '1rem',
                      }}
                    />
                  </Box>

                  <FormatQuoteIcon sx={{
                    fontSize: 28,
                    color: alpha('#3B82F6', 0.2),
                    mb: 1,
                    transform: 'rotate(180deg)',
                  }} />

                  <Typography sx={{
                    fontSize: '0.9rem',
                    lineHeight: 1.75,
                    color: isDark ? alpha('#FFFFFF', 0.65) : alpha('#0F172A', 0.65),
                    mb: 3,
                    minHeight: 100,
                  }}>
                    {t.quote}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
                      }}
                    >
                      {t.avatar}
                    </Avatar>
                    <Box>
                      <Typography sx={{
                        fontSize: '0.85rem', fontWeight: 600,
                        color: isDark ? '#FFFFFF' : '#0F172A',
                      }}>
                        {t.name}
                      </Typography>
                      <Typography sx={{
                        fontSize: '0.75rem',
                        color: isDark ? alpha('#FFFFFF', 0.4) : alpha('#0F172A', 0.4),
                      }}>
                        {t.role} · {t.company}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Dots indicator */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 4 }}>
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <Box
                key={i}
                onClick={() => setCurrentIndex(i)}
                sx={{
                  width: currentIndex === i ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: currentIndex === i
                    ? 'linear-gradient(135deg, #3B82F6, #7C3AED)'
                    : isDark ? alpha('#FFFFFF', 0.15) : alpha('#0F172A', 0.12),
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Testimonials;
