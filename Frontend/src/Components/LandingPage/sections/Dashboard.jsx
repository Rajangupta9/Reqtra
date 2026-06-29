import React from 'react';
import { Box, Typography, Container, Grid, Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { dashboardFeatures } from '../data/features';
import SectionHeader from '../ui/SectionHeader';

const FeatureGroup = ({ title, items, delay }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Typography sx={{
        fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: '#3B82F6', mb: 2,
      }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 3.5 }}>
        {items.map((item) => (
          <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircleIcon sx={{ fontSize: 18, color: '#22C55E' }} />
            <Typography sx={{
              fontSize: '0.9rem', fontWeight: 500,
              color: isDark ? alpha('#FFFFFF', 0.75) : alpha('#0F172A', 0.75),
            }}>
              {item}
            </Typography>
          </Box>
        ))}
      </Box>
    </motion.div>
  );
};

const DashboardMockup = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: isDark ? alpha('#0F172A', 0.9) : alpha('#FFFFFF', 0.95),
        border: `1px solid ${isDark ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.06)}`,
        boxShadow: isDark
          ? `0 20px 60px ${alpha('#000000', 0.4)}`
          : `0 20px 60px ${alpha('#000000', 0.08)}`,
      }}
    >
      {/* Top bar */}
      <Box sx={{
        display: 'flex', alignItems: 'center', px: 2, py: 1.2,
        borderBottom: `1px solid ${isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.06)}`,
        gap: 0.8,
      }}>
        {['#EF4444', '#F59E0B', '#22C55E'].map((c) => (
          <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c, opacity: 0.7 }} />
        ))}
      </Box>

      {/* Dashboard layout */}
      <Box sx={{ display: 'flex', height: 340 }}>
        {/* Sidebar */}
        <Box sx={{
          width: 180, borderRight: `1px solid ${isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.06)}`,
          p: 1.5, display: { xs: 'none', sm: 'block' },
        }}>
          {['My APIs', 'Collections', 'Environments', 'History', 'Mock Servers'].map((item, i) => (
            <Box key={item} sx={{
              px: 1.5, py: 1, borderRadius: '8px', mb: 0.5, cursor: 'pointer',
              backgroundColor: i === 0 ? alpha('#3B82F6', 0.1) : 'transparent',
              color: i === 0 ? '#3B82F6' : (isDark ? alpha('#FFFFFF', 0.45) : alpha('#0F172A', 0.45)),
              fontSize: '0.75rem', fontWeight: i === 0 ? 600 : 400,
              transition: 'all 0.2s ease',
            }}>
              {item}
            </Box>
          ))}
        </Box>

        {/* Main content */}
        <Box sx={{ flex: 1, p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {['GET /users', 'POST /auth', 'PUT /settings', 'DELETE /cache'].map((req, i) => (
              <Chip
                key={req}
                label={req}
                size="small"
                sx={{
                  fontSize: '0.68rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  backgroundColor: isDark ? alpha('#FFFFFF', 0.05) : alpha('#000000', 0.04),
                  color: isDark ? alpha('#FFFFFF', 0.6) : alpha('#0F172A', 0.6),
                  border: i === 0 ? `1px solid ${alpha('#3B82F6', 0.3)}` : '1px solid transparent',
                  borderRadius: '6px',
                }}
              />
            ))}
          </Box>

          {/* Mini response preview */}
          <Box sx={{
            p: 2, borderRadius: '10px',
            backgroundColor: isDark ? alpha('#000000', 0.25) : alpha('#F1F5F9', 1),
            border: `1px solid ${isDark ? alpha('#FFFFFF', 0.04) : alpha('#000000', 0.04)}`,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.68rem',
            lineHeight: 1.9,
            color: isDark ? alpha('#FFFFFF', 0.5) : alpha('#0F172A', 0.5),
          }}>
            <Box sx={{ color: '#3B82F6' }}>GET</Box>
            <Box>https://api.example.com/v2/users</Box>
            <Box sx={{ mt: 1, color: '#22C55E' }}>✓ 200 OK — 28ms</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const Dashboard = () => {
  return (
    <Box id="dashboard" sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth="lg">
        <SectionHeader
          label="Solutions"
          title="Everything You Need in One Workspace"
          subtitle="From REST to GraphQL, OAuth to API keys — Reqtra handles it all with a beautiful, unified interface."
        />

        <Grid container spacing={6} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <DashboardMockup />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <FeatureGroup title="Protocols" items={dashboardFeatures.protocols} delay={0.1} />
            <FeatureGroup title="Authentication" items={dashboardFeatures.auth} delay={0.2} />
            <FeatureGroup title="Features" items={dashboardFeatures.features} delay={0.3} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
