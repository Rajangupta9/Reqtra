import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Typography, Box } from '@mui/material';

export const ReportChart = ({ chartData = [], COLORS = {}, hasChartData }) => {
  if (!hasChartData) {
    return (
      <Typography variant="caption" color="text.secondary" textAlign="center">
        No data to display
      </Typography>
    );
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <PieChart
        height={100}
        width={220}
        series={[
          {
            data: chartData.map((d) => ({
              id: d.name,
              label: d.name,
              value: d.value,
              color: COLORS[d.name?.toLowerCase()] || '#8884d8',
            })),
            innerRadius: 20,
            outerRadius: 40,
            arcLabel: (item) => `${item.value}`,
            highlightScope: { faded: 'global', highlighted: 'item' },
            faded: { innerRadius: 40, outerRadius: 70, additionalRadius: -10 },
          },
        ]}
        slotProps={{
          legend: {
            direction: 'row',
            position: { vertical: 'bottom', horizontal: 'middle' },
            itemMarkWidth: 12,
            itemMarkHeight: 12,
            markGap: 6,
            itemGap: 12,
          },
          tooltip: {
            trigger: 'item',
          },
        }}
      />
    </Box>
  );
};

export default ReportChart;
