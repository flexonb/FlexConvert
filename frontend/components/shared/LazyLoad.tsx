import React, { useEffect, useRef, useState } from "react";

interface LazyLoadProps {
  children: React.ReactNode;
  height?: number;
  className?: string;
  threshold?: number;
}

export default function LazyLoad({ 
  children, 
  height = 200, 
  className = "", 
  threshold = 0.1 
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ minHeight: height }}
    >
      {isVisible ? children : <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height }} />}
    </div>
  );
}
