import React, { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  to: number;
  durationMs?: number;
  formatter?: (n: number) => string;
}

export default function AnimatedCounter({
  to,
  durationMs = 1000,
  formatter = (n) => n.toLocaleString(),
}: AnimatedCounterProps) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);
  const toRef = useRef(to);

  useEffect(() => {
    fromRef.current = value;
    toRef.current = to;
    startRef.current = null;

    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(fromRef.current + (toRef.current - fromRef.current) * eased);
      setValue(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);

  return <span>{formatter(value)}</span>;
}
