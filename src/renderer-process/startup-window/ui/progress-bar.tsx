import React, { useEffect, useRef, useState } from 'react';

export const AnimatedProgressBar = ({
  progress,
  stepPercent = 0.01,
  stepInterval = 300,
  onComplete,
  max = 1,
}: AnimatedProgressBarProps): JSX.Element => {
  const initial = clamp(progress, 0, max);
  const [currentProgress, setCurrentProgress] = useState(initial);
  const progressRef = useRef(currentProgress);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    progressRef.current = currentProgress;
  }, [currentProgress]);

  useEffect(() => {
    setCurrentProgress(clamp(progress, 0, max));
  }, [progress, max]);

  useEffect(() => {
    if (completedRef.current) {
      return;
    }
    if (currentProgress >= max) {
      completedRef.current = true;
      setCurrentProgress(max);
      if (onComplete) {
        setTimeout(onComplete, 600);
      }
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setCurrentProgress(prev => {
        const next = Math.min(prev + stepPercent, max);
        if (next >= max && !completedRef.current) {
          completedRef.current = true;
          if (onComplete) {
            setTimeout(onComplete, 600);
          }
        }
        return next;
      });
    }, stepInterval);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentProgress, stepPercent, stepInterval, onComplete, max]);

  return (
    <div
      style={ {
        background: '#233',
        borderRadius: 4,
        height: 8,
        marginBottom: 8,
        overflow: 'hidden',
        width: '100%',
      } }
    >
      <div
        style={ {
          background: 'linear-gradient(90deg, #6eb450, #ffb482)',
          height: '100%',
          transition: 'width 0.6s ease',
          width: `${(currentProgress * 100).toFixed(1)}%`,
        } }
      />
    </div>
  );
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

export type AnimatedProgressBarProps = {
  max?: number;
  onComplete?: () => void;
  progress: number;
  stepInterval?: number;
  stepPercent?: number;
};
