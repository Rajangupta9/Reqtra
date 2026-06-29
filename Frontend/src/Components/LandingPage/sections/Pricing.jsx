import React, { useState } from 'react';
import { Box, Typography, Container, Grid, Switch, Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import CheckIcon from '@mui/icons-material/Check';
import { pricingPlans } from '../data/pricing';
import SectionHeader from '../ui/SectionHeader';
import GradientButton from '../ui/GradientButton';

const Pricing = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [annual, setAnnual] = useState(true);

  return (
    <Box id="pricing" sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth="lg">
        <SectionHeader
          label="Pricing"
          title="Simple, Transparent Pricing"
          subtitle="Start free. Upgrade when you're ready. No hidden fees, no surprises."
        />

        {/* Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 6 }}>
          <Typography sx={{
            fontSize: '0.9rem', fontWeight: annual ? 400 : 600,
            color: !annual ? (isDark ? '#FFFFFF' : '#0F172A') : (isDark ? alpha('#FFFFFF', 0.45) : alpha('#0F172A', 0.45)),
          }}>
            Monthly
          </Typography>
          <Switch
            checked={annual}
            onChange={() => setAnnual(!annual)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#3B82F6',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#3B82F6',
              },
            }}
          />
          <Typography sx={{
            fontSize: '0.9rem', fontWeight: annual ? 600 : 400,
            color: annual ? (isDark ? '#FFFFFF' : '#0F172A') : (isDark ? alpha('#FFFFFF', 0.45) : alpha('#0F172A', 0.45)),
          }}>
            Annual
          </Typography>
          {annual && (
            <Chip
              label="Save 25%"
              size="small"
              sx={{
                height: 24,
                fontSize: '0.7rem',
                fontWeight: 600,
                backgroundColor: alpha('#22C55E', 0.12),
                color: '#22C55E',
                border: `1px solid ${alpha('#22C55E', 0.2)}`,
              }}
            />
          )}
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {pricingPlans.map((plan, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plan.name}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Box
                  component={motion.div}
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  sx={{
                    position: 'relative',
                    p: 4,
                    borderRadius: '24px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: plan.highlighted
                      ? isDark
                        ? `linear-gradient(135deg, ${alpha('#1E293B', 0.9)}, ${alpha('#0F172A', 0.9)})`
                        : `linear-gradient(135deg, ${alpha('#FFFFFF', 1)}, ${alpha('#F8FAFC', 1)})`
                      : isDark
                        ? alpha('#1E293B', 0.4)
                        : alpha('#FFFFFF', 0.7),
                    backdropFilter: 'blur(16px)',
                    border: plan.highlighted
                      ? 'none'
                      : `1px solid ${isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.06)}`,
                    boxShadow: plan.highlighted
                      ? isDark
                        ? `0 0 0 1px ${alpha('#3B82F6', 0.3)}, 0 20px 60px ${alpha('#3B82F6', 0.15)}`
                        : `0 0 0 1px ${alpha('#3B82F6', 0.2)}, 0 20px 60px ${alpha('#3B82F6', 0.1)}`
                      : 'none',
                    ...(plan.highlighted && {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -1,
                        borderRadius: '25px',
                        padding: '1px',
                        background: 'linear-gradient(135deg, #3B82F6, #7C3AED, #3B82F6)',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                      },
                    }),
                  }}
                >
                  {plan.badge && (
                    <Chip
                      label={plan.badge}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 26,
                        px: 1,
                      }}
                    />
                  )}

                  <Typography sx={{
                    fontSize: '1.2rem', fontWeight: 700, mb: 0.5,
                    color: isDark ? '#FFFFFF' : '#0F172A',
                  }}>
                    {plan.name}
                  </Typography>
                  <Typography sx={{
                    fontSize: '0.85rem', mb: 3, lineHeight: 1.5,
                    color: isDark ? alpha('#FFFFFF', 0.45) : alpha('#0F172A', 0.45),
                  }}>
                    {plan.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 3 }}>
                    <Typography sx={{
                      fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.03em',
                      color: isDark ? '#FFFFFF' : '#0F172A',
                    }}>
                      ${annual ? plan.annualPrice : plan.price}
                    </Typography>
                    {plan.price > 0 && (
                      <Typography sx={{
                        fontSize: '0.9rem',
                        color: isDark ? alpha('#FFFFFF', 0.4) : alpha('#0F172A', 0.4),
                      }}>
                        /month
                      </Typography>
                    )}
                  </Box>

                  <GradientButton
                    fullWidth
                    variant={plan.highlighted ? 'contained' : 'outlined'}
                    sx={{ mb: 3, borderRadius: '12px' }}
                  >
                    {plan.cta}
                  </GradientButton>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                    {plan.features.map((feature) => (
                      <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CheckIcon sx={{
                          fontSize: 16,
                          color: plan.highlighted ? '#3B82F6' : '#22C55E',
                        }} />
                        <Typography sx={{
                          fontSize: '0.84rem',
                          color: isDark ? alpha('#FFFFFF', 0.6) : alpha('#0F172A', 0.6),
                        }}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Pricing;
