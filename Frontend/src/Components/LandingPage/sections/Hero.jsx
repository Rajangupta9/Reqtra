import React from 'react';
import { Box, Typography, Container, Chip, Stack } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import GitHubIcon from '@mui/icons-material/GitHub';
import StarIcon from '@mui/icons-material/Star';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import GradientButton from '../ui/GradientButton';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const ApiClientMockup = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const methodColor = '#22C55E';
  const jsonColors = {
    key: '#3B82F6',
    string: '#22C55E',
    number: '#F59E0B',
    bracket: isDark ? alpha('#FFFFFF', 0.5) : alpha('#0F172A', 0.5),
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        width: '100%',
        maxWidth: 620,
        borderRadius: '20px',
        overflow: 'hidden',
        background: isDark ? alpha('#0F172A', 0.9) : alpha('#FFFFFF', 0.95),
        border: `1px solid ${isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.08)}`,
        boxShadow: isDark
          ? `0 24px 80px ${alpha('#000000', 0.5)}, 0 0 60px ${alpha('#3B82F6', 0.08)}`
          : `0 24px 80px ${alpha('#000000', 0.12)}`,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Title Bar */}
      <Box sx={{
        display: 'flex', alignItems: 'center', px: 2, py: 1.2,
        borderBottom: `1px solid ${isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.06)}`,
        gap: 1,
      }}>
        <Box sx={{ display: 'flex', gap: 0.8 }}>
          {['#EF4444', '#F59E0B', '#22C55E'].map((c) => (
            <Box key={c} sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: c, opacity: 0.8 }} />
          ))}
        </Box>
        <Typography sx={{ ml: 1.5, fontSize: '0.75rem', color: isDark ? alpha('#FFFFFF', 0.4) : alpha('#0F172A', 0.4), fontWeight: 500 }}>
          Reqtra — API Client
        </Typography>
      </Box>

      {/* URL Bar */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5,
        borderBottom: `1px solid ${isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.06)}`,
      }}>
        <Chip
          label="GET"
          size="small"
          sx={{
            backgroundColor: alpha(methodColor, 0.15),
            color: methodColor,
            fontWeight: 700,
            fontSize: '0.7rem',
            height: 26,
            borderRadius: '6px',
            fontFamily: '"JetBrains Mono", monospace',
          }}
        />
        <Box sx={{
          flex: 1, px: 1.5, py: 0.6,
          borderRadius: '8px',
          backgroundColor: isDark ? alpha('#FFFFFF', 0.04) : alpha('#000000', 0.03),
          border: `1px solid ${isDark ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.06)}`,
        }}>
          <Typography sx={{
            fontSize: '0.78rem',
            fontFamily: '"JetBrains Mono", monospace',
            color: isDark ? alpha('#FFFFFF', 0.7) : alpha('#0F172A', 0.7),
          }}>
            https://api.reqtra.dev/v1/users
          </Typography>
        </Box>
        <Box sx={{
          px: 2, py: 0.6, borderRadius: '8px',
          background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
          cursor: 'pointer',
        }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#FFF', fontWeight: 600 }}>Send</Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{
        display: 'flex', gap: 0, px: 2, pt: 0.5,
        borderBottom: `1px solid ${isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.06)}`,
      }}>
        {['Params', 'Headers', 'Auth', 'Body'].map((tab, i) => (
          <Box key={tab} sx={{
            px: 2, py: 1,
            fontSize: '0.75rem',
            fontWeight: i === 0 ? 600 : 400,
            color: i === 0 ? '#3B82F6' : (isDark ? alpha('#FFFFFF', 0.45) : alpha('#0F172A', 0.45)),
            borderBottom: i === 0 ? '2px solid #3B82F6' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}>
            {tab}
          </Box>
        ))}
      </Box>

      {/* Response */}
      <Box sx={{ px: 2, py: 1.5 }}>
        {/* Status bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
          <Chip label="200 OK" size="small" sx={{
            backgroundColor: alpha('#22C55E', 0.15), color: '#22C55E',
            fontWeight: 700, fontSize: '0.7rem', height: 24, borderRadius: '6px',
          }} />
          <Typography sx={{ fontSize: '0.7rem', color: isDark ? alpha('#FFFFFF', 0.35) : alpha('#0F172A', 0.35) }}>
            32ms
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: isDark ? alpha('#FFFFFF', 0.35) : alpha('#0F172A', 0.35) }}>
            1.2 KB
          </Typography>
        </Box>

        {/* JSON Response */}
        <Box sx={{
          p: 2, borderRadius: '10px',
          backgroundColor: isDark ? alpha('#000000', 0.3) : alpha('#F8FAFC', 1),
          border: `1px solid ${isDark ? alpha('#FFFFFF', 0.04) : alpha('#000000', 0.04)}`,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.72rem',
          lineHeight: 1.8,
        }}>
          <Box component="span" sx={{ color: jsonColors.bracket }}>{'{'}</Box><br />
          <Box component="span" sx={{ pl: 2.5 }}>
            <Box component="span" sx={{ color: jsonColors.key }}>"status"</Box>
            <Box component="span" sx={{ color: jsonColors.bracket }}>: </Box>
            <Box component="span" sx={{ color: jsonColors.string }}>"success"</Box>
            <Box component="span" sx={{ color: jsonColors.bracket }}>,</Box>
          </Box><br />
          <Box component="span" sx={{ pl: 2.5 }}>
            <Box component="span" sx={{ color: jsonColors.key }}>"data"</Box>
            <Box component="span" sx={{ color: jsonColors.bracket }}>{': {'}</Box>
          </Box><br />
          <Box component="span" sx={{ pl: 5 }}>
            <Box component="span" sx={{ color: jsonColors.key }}>"users"</Box>
            <Box component="span" sx={{ color: jsonColors.bracket }}>: </Box>
            <Box component="span" sx={{ color: jsonColors.number }}>1,247</Box>
            <Box component="span" sx={{ color: jsonColors.bracket }}>,</Box>
          </Box><br />
          <Box component="span" sx={{ pl: 5 }}>
            <Box component="span" sx={{ color: jsonColors.key }}>"active"</Box>
            <Box component="span" sx={{ color: jsonColors.bracket }}>: </Box>
            <Box component="span" sx={{ color: jsonColors.number }}>892</Box>
          </Box><br />
          <Box component="span" sx={{ pl: 2.5, color: jsonColors.bracket }}>{'}'}</Box><br />
          <Box component="span" sx={{ color: jsonColors.bracket }}>{'}'}</Box>
        </Box>
      </Box>
    </Box>
  );
};

const FloatingCard = ({ label, value, delay, x, y }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.05 }}
      sx={{
        position: 'absolute',
        ...x, ...y,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        px: 2.5,
        py: 1.5,
        borderRadius: '14px',
        background: isDark ? alpha('#1E293B', 0.8) : alpha('#FFFFFF', 0.9),
        backdropFilter: 'blur(16px)',
        border: `1px solid ${isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.06)}`,
        boxShadow: isDark
          ? `0 8px 24px ${alpha('#000000', 0.3)}`
          : `0 8px 24px ${alpha('#000000', 0.08)}`,
        zIndex: 10,
      }}
    >
      <Typography sx={{ fontSize: '0.65rem', color: isDark ? alpha('#FFFFFF', 0.45) : alpha('#0F172A', 0.45), fontWeight: 500, mb: 0.3 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#3B82F6' }}>
        {value}
      </Typography>
    </Box>
  );
};

const Hero = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      id="home"
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        pt: { xs: 12, md: 8 },
        pb: { xs: 8, md: 4 },
      }}
    >
      {/* Background Effects */}
      <Box sx={{
        position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden',
        background: isDark
          ? 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)'
          : 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 60%)',
      }}>
        {/* Grid Pattern */}
        <Box sx={{
          position: 'absolute', inset: 0, opacity: isDark ? 0.03 : 0.04,
          backgroundImage: `
            linear-gradient(${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'} 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }} />
        {/* Gradient Orbs */}
        <Box component={motion.div}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          sx={{
            position: 'absolute', top: '-10%', left: '10%',
            width: 500, height: 500, borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#3B82F6', 0.12)} 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />
        <Box component={motion.div}
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          sx={{
            position: 'absolute', top: '20%', right: '5%',
            width: 400, height: 400, borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#7C3AED', 0.1)} 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: 'center',
          gap: { xs: 6, lg: 8 },
        }}>
          {/* Left Content */}
          <Box sx={{ flex: 1, maxWidth: { lg: 580 } }}>
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
              <Chip
                icon={<StarIcon sx={{ fontSize: '0.85rem !important', color: '#F59E0B !important' }} />}
                label="Now in Public Beta"
                size="small"
                sx={{
                  mb: 3,
                  px: 1,
                  height: 32,
                  borderRadius: '10px',
                  background: isDark ? alpha('#F59E0B', 0.1) : alpha('#F59E0B', 0.08),
                  border: `1px solid ${alpha('#F59E0B', 0.2)}`,
                  color: '#F59E0B',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                }}
              />
            </motion.div>

            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.2rem', md: '3.8rem' },
                  fontWeight: 800,
                  lineHeight: 1.08,
                  letterSpacing: '-0.035em',
                  mb: 3,
                  color: isDark ? '#FFFFFF' : '#0F172A',
                }}
              >
                The Modern API{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 50%, #3B82F6 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-shift 5s ease infinite',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    '@keyframes gradient-shift': {
                      '0%': { backgroundPosition: '0% 50%' },
                      '50%': { backgroundPosition: '100% 50%' },
                      '100%': { backgroundPosition: '0% 50%' },
                    },
                  }}
                >
                  Platform
                </Box>{' '}
                Built for Developers
              </Typography>
            </motion.div>

            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
              <Typography
                sx={{
                  fontSize: { xs: '1.05rem', md: '1.18rem' },
                  lineHeight: 1.7,
                  color: isDark ? alpha('#FFFFFF', 0.55) : alpha('#0F172A', 0.55),
                  mb: 4.5,
                  maxWidth: 500,
                  fontWeight: 400,
                }}
              >
                Build, test, document, automate, and collaborate on APIs from one lightning-fast workspace.
              </Typography>
            </motion.div>

            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <GradientButton>Start Free</GradientButton>
                <GradientButton
                  variant="outlined"
                  startIcon={<PlayArrowRoundedIcon />}
                >
                  View Demo
                </GradientButton>
                <GradientButton
                  variant="outlined"
                  startIcon={<GitHubIcon />}
                  sx={{
                    borderColor: isDark ? alpha('#FFFFFF', 0.15) : alpha('#0F172A', 0.15),
                    color: isDark ? alpha('#FFFFFF', 0.7) : alpha('#0F172A', 0.7),
                    '&:hover': {
                      borderColor: isDark ? alpha('#FFFFFF', 0.3) : alpha('#0F172A', 0.3),
                      backgroundColor: isDark ? alpha('#FFFFFF', 0.05) : alpha('#0F172A', 0.03),
                    },
                  }}
                >
                  Star on GitHub
                </GradientButton>
              </Stack>
            </motion.div>
          </Box>

          {/* Right Content - API Client Mockup */}
          <Box sx={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            minHeight: { xs: 400, lg: 500 },
          }}>
            <ApiClientMockup />
            <FloatingCard label="API Requests" value="1.2M" delay={0.8} x={{ right: { lg: -20 } }} y={{ top: '10%' }} />
            <FloatingCard label="Collections" value="847" delay={1.0} x={{ left: { lg: -30 } }} y={{ top: '30%' }} />
            <FloatingCard label="Environments" value="24" delay={1.2} x={{ right: { lg: -10 } }} y={{ bottom: '25%' }} />
            <FloatingCard label="Avg Latency" value="32ms" delay={1.4} x={{ left: { lg: -20 } }} y={{ bottom: '10%' }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
