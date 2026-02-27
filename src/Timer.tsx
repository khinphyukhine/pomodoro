import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Timer.css';

type TimerProps = {
  startMinutes?: number; // default 25
  isRunning: boolean;
  stickerSrc: string;
};

const Timer: React.FC<TimerProps> = ({
  startMinutes = 25,
  isRunning,
  stickerSrc,
}) => {
  const totalSeconds = useMemo(() => startMinutes * 60, [startMinutes]);
  const [secondsRemaining, setSecondsRemaining] =
    useState<number>(totalSeconds);

  // Wrapper measured size (in px)
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<number>(320);

  // Reset when startMinutes changes
  useEffect(() => {
    setSecondsRemaining(totalSeconds);
  }, [totalSeconds]);

  // Countdown tick
  useEffect(() => {
    if (!isRunning || secondsRemaining <= 0) return;

    const id = window.setInterval(() => {
      setSecondsRemaining(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [isRunning, secondsRemaining]);

  // ResizeObserver: keep SVG size synced to container size
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const ro = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;

      // Use the smaller of width/height to keep it perfectly square
      const next = Math.max(180, Math.floor(Math.min(rect.width, rect.height)));
      setSize(next);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Progress (1 -> 0)
  const progress = totalSeconds === 0 ? 0 : secondsRemaining / totalSeconds;

  // Stroke scales with size
  const strokeWidth = Math.max(10, Math.round(size * 0.06)); // ~6% of size
  const radius = (size - strokeWidth) / 2;

  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  // Sticker follows end of progress, starting at top
  const angle = -Math.PI / 2 + 2 * Math.PI * progress;

  // Push sticker slightly outward so it sits nicely on the rounded cap
  const stickerRadius = radius + strokeWidth * 0.25;

  const dotX = size / 2 + stickerRadius * Math.cos(angle);
  const dotY = size / 2 + stickerRadius * Math.sin(angle);

  // Sticker scales with ring thickness
  const stickerSize = strokeWidth * 4.2;

  // Format time MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      ref={wrapRef}
      className={`timerWrap ${secondsRemaining === 0 ? 'finished' : ''}`}
      aria-label='timer'
    >
      {/* Square drawing surface sized from ResizeObserver */}
      <svg
        className='timerSvg'
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient
            id='timerGradient'
            x1='15%'
            y1='15%'
            x2='85%'
            y2='85%'
          >
            <stop offset='0%' stopColor='#6b5a2d' />
            <stop offset='100%' stopColor='#4e3b10' />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          className='timerTrack'
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Progress */}
        <circle
          className='timerProgress'
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          stroke='url(#timerGradient)'
        />

        {/* Sticker cap */}
        <image
          className='timerSticker'
          href={stickerSrc}
          x={dotX - stickerSize / 2}
          y={dotY - stickerSize / 2}
          width={stickerSize}
          height={stickerSize}
          preserveAspectRatio='xMidYMid meet'
        />
      </svg>

      <div className='timerText'>{formattedTime}</div>
    </div>
  );
};

export default Timer;
