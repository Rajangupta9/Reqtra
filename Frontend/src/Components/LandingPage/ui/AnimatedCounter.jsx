import React, { useEffect, useState, useRef } from 'react';
import { Typography } from '@mui/material';

const AnimatedCounter = ({ value, suffix = '', prefix = '', duration = 2000, decimals = 0, sx = {} }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = easeOut * value;
            setCount(currentValue);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  const formatValue = (val) => {
    if (value >= 1000000) {
      return `${(val / 1000000).toFixed(val >= 1000000 ? 1 : 0)}M`;
    }
    if (value >= 1000) {
      return `${(val / 1000).toFixed(val >= 1000 ? 0 : 0)}K`;
    }
    if (decimals > 0) {
      return val.toFixed(decimals);
    }
    return Math.floor(val).toLocaleString();
  };

  return (
    <Typography ref={ref} sx={sx}>
      {prefix}{formatValue(count)}{suffix}
    </Typography>
  );
};

export default AnimatedCounter;
