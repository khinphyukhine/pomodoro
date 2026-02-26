import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Home.css';
import { MIN_RADIUS, MAX_RADIUS, COLORS } from './Constants.tsx';
import Timer from './Timer.tsx';

type CircleSpec = {
  cx: number;
  cy: number;
  dx: number;
  dy: number;
  r: number;
  color: string;

  // extra fields to create a "floating" wiggle
  phaseX: number;
  phaseY: number;
  ampX: number;
  ampY: number;
  freqX: number;
  freqY: number;
};

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function Home() {
  // keep your 2..100 count (FYI this can get busy visually)
  const [count] = useState(() => Math.floor(Math.random() * 29) + 2);

  const circlesRef = useRef<CircleSpec[]>([]);
  const circleElsRef = useRef<(SVGCircleElement | null)[]>([]);

  const initialCircles = useMemo(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    return Array.from({ length: count }, () => {
      // radius 50–200, clamped to fit screen
      const rawR = randBetween(MIN_RADIUS, MAX_RADIUS);
      const r = Math.min(rawR, w / 2, h / 2);

      // start in bounds
      const cx = r + Math.random() * Math.max(0, w - 2 * r);
      const cy = r + Math.random() * Math.max(0, h - 2 * r);

      // Bigger circles drift slower
      const t = (r - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS); // 0..1
      const speedFast = 0.8; // small circles
      const speedSlow = 0.25; // big circles
      const speed = speedFast - t * (speedFast - speedSlow);

      const angle = Math.random() * Math.PI * 2;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;

      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      // Wiggle settings (subtle, per-circle unique)
      const ampX = randBetween(2, 10); // px
      const ampY = randBetween(2, 10); // px
      const freqX = randBetween(0.4, 1.2); // radians/sec-ish (we’ll use time)
      const freqY = randBetween(0.4, 1.2);

      return {
        cx,
        cy,
        dx,
        dy,
        r,
        color,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        ampX,
        ampY,
        freqX,
        freqY,
      };
    });
  }, [count]);

  useEffect(() => {
    circlesRef.current = initialCircles;

    let raf = 0;

    // Use RAF timestamp to make motion time-based (smooth across refresh rates)
    const tick = (tMs: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      const t = tMs / 1000; // convert ms → seconds
      const circles = circlesRef.current;

      for (let i = 0; i < circles.length; i++) {
        const c = circles[i];

        // Drift
        c.cx += c.dx;
        c.cy += c.dy;

        // Wrap-around edges (no bounce)
        // When fully off one side (by radius), re-enter from the opposite side
        if (c.cx < -c.r) c.cx = w + c.r;
        else if (c.cx > w + c.r) c.cx = -c.r;

        if (c.cy < -c.r) c.cy = h + c.r;
        else if (c.cy > h + c.r) c.cy = -c.r;

        // Floating wiggle (adds gentle bobbing on top of drift)
        const wiggleX = Math.sin(t * c.freqX + c.phaseX) * c.ampX;
        const wiggleY = Math.cos(t * c.freqY + c.phaseY) * c.ampY;

        const el = circleElsRef.current[i];
        if (el) {
          el.setAttribute('cx', String(c.cx + wiggleX));
          el.setAttribute('cy', String(c.cy + wiggleY));
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [initialCircles]);

  return (
    <div className='home'>
      <div className='overlay'>
        <svg
          className='arena'
          width='100%'
          height='100%'
          viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
          preserveAspectRatio='none'
        >
          {initialCircles.map((c, i) => (
            <circle
              key={i}
              ref={el => {
                circleElsRef.current[i] = el;
              }}
              cx={c.cx}
              cy={c.cy}
              r={c.r}
              fill={c.color}
              opacity={0.9}
            />
          ))}
        </svg>
        <Timer />
      </div>
    </div>
  );
}
