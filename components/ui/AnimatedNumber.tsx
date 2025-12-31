
import React, { useState, useEffect } from 'react';

const AnimatedNumber: React.FC<{ value: number, suffix?: string, prefix?: string }> = ({ value, suffix = '%', prefix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
};

export default AnimatedNumber;
