import React, { useState } from 'react';
import { Box, Typography, Container, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { faqItems } from '../data/faq';
import SectionHeader from '../ui/SectionHeader';

const FAQ = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth="md">
        <SectionHeader
          label="FAQ"
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about Reqtra."
        />

        <Box>
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Accordion
                expanded={expanded === index}
                onChange={handleChange(index)}
                disableGutters
                elevation={0}
                sx={{
                  backgroundColor: 'transparent',
                  borderBottom: `1px solid ${isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.06)}`,
                  '&::before': { display: 'none' },
                  '&:first-of-type': {
                    borderTop: `1px solid ${isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.06)}`,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    expanded === index ? (
                      <RemoveIcon sx={{ fontSize: 20, color: '#3B82F6' }} />
                    ) : (
                      <AddIcon sx={{ fontSize: 20, color: isDark ? alpha('#FFFFFF', 0.4) : alpha('#0F172A', 0.4) }} />
                    )
                  }
                  sx={{
                    px: 0,
                    py: 1,
                    '& .MuiAccordionSummary-content': { my: 1.5 },
                  }}
                >
                  <Typography sx={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: expanded === index
                      ? '#3B82F6'
                      : isDark ? '#FFFFFF' : '#0F172A',
                    transition: 'color 0.2s ease',
                  }}>
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pb: 3 }}>
                  <Typography sx={{
                    fontSize: '0.9rem',
                    lineHeight: 1.75,
                    color: isDark ? alpha('#FFFFFF', 0.55) : alpha('#0F172A', 0.55),
                  }}>
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FAQ;
