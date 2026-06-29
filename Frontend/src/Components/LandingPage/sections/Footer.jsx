import React from 'react';
import { Box, Typography, Container, Grid, IconButton, Divider } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { footerLinks } from '../data/navigation';

const Footer = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{
      pt: { xs: 8, md: 10 },
      pb: 4,
      borderTop: `1px solid ${isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.06)}`,
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Brand column */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: '8px',
                background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF',
              }}>
                R
              </Box>
              <Typography sx={{
                fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em',
                color: isDark ? '#FFFFFF' : '#0F172A',
              }}>
                Reqtra
              </Typography>
            </Box>
            <Typography sx={{
              fontSize: '0.85rem', lineHeight: 1.7, mb: 2.5,
              color: isDark ? alpha('#FFFFFF', 0.4) : alpha('#0F172A', 0.4),
              maxWidth: 240,
            }}>
              The modern API platform built for developers who care about speed, design, and developer experience.
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[GitHubIcon, TwitterIcon, LinkedInIcon].map((Icon, i) => (
                <IconButton
                  key={i}
                  size="small"
                  sx={{
                    color: isDark ? alpha('#FFFFFF', 0.35) : alpha('#0F172A', 0.35),
                    '&:hover': {
                      color: '#3B82F6',
                      backgroundColor: alpha('#3B82F6', 0.08),
                    },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <Grid size={{ xs: 6, sm: 4, md: category === 'Legal' ? 1.5 : 1.8 }} key={category}>
              <Typography sx={{
                fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.08em', mb: 2,
                color: isDark ? alpha('#FFFFFF', 0.7) : alpha('#0F172A', 0.7),
              }}>
                {category}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                {links.map((link) => (
                  <Typography
                    key={link.label}
                    component="a"
                    href={link.href}
                    sx={{
                      fontSize: '0.84rem',
                      color: isDark ? alpha('#FFFFFF', 0.4) : alpha('#0F172A', 0.4),
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      cursor: 'pointer',
                      '&:hover': { color: '#3B82F6' },
                    }}
                  >
                    {link.label}
                  </Typography>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{
          borderColor: isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.06),
          mb: 3,
        }} />

        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
        }}>
          <Typography sx={{
            fontSize: '0.78rem',
            color: isDark ? alpha('#FFFFFF', 0.3) : alpha('#0F172A', 0.3),
          }}>
            © {new Date().getFullYear()} Reqtra. All rights reserved.
          </Typography>
          <Typography sx={{
            fontSize: '0.78rem',
            color: isDark ? alpha('#FFFFFF', 0.3) : alpha('#0F172A', 0.3),
          }}>
            Built with ❤️ for developers
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
