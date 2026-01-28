'use client';

import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { useEffect, useState, useCallback, useRef } from 'react';

// Anime/Magic colors with Firework intensity
const COLORS = [
  '#FF1493', // DeepPink
  '#FFD700', // Gold
  '#00BFFF', // DeepSkyBlue
  '#9370DB', // MediumPurple
  '#FF4500', // OrangeRed
  '#00FA9A', // MediumSpringGreen
  '#F0F8FF', // AliceBlue (Sparkle white)
];

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

export default function CursorFollower({ level = 'full' }: { level?: 'light' | 'full' }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const particleIdCounter = useRef(0);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Physics Config
  const GRAVITY = 0.5;
  const DRAG = 0.96; // Air resistance

  // Limits based on level
  const IS_FULL = level === 'full';
  const MAX_PARTICLES = IS_FULL ? 100 : 40;
  const BURST_COUNT = IS_FULL ? 30 : 10;

  const spawnParticles = useCallback((x: number, y: number, isBurst = false) => {
    const newParticles: Particle[] = [];
    const count = isBurst ? BURST_COUNT : 1; 

    for (let i = 0; i < count; i++) {
        const id = particleIdCounter.current++;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        
        let vx, vy, life, size;

        if (isBurst) {
             // Explosion physics
             const angle = Math.random() * Math.PI * 2;
             const speed = Math.random() * 8 + 4; // High initial speed
             vx = Math.cos(angle) * speed;
             vy = Math.sin(angle) * speed;
             life = Math.random() * 0.8 + 0.4; // Longer life
             size = Math.random() * 6 + 4;
        } else {
             // Trail physics (gentle)
             vx = (Math.random() - 0.5) * 2;
             vy = (Math.random() - 0.5) * 2;
             life = Math.random() * 0.5 + 0.3;
             size = Math.random() * 4 + 2;
        }

        newParticles.push({
            id,
            x: isBurst ? x : x + (Math.random() - 0.5) * 10,
            y: isBurst ? y : y + (Math.random() - 0.5) * 10,
            vx,
            vy,
            life,
            color,
            size,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }

    setParticles(prev => [...prev.slice(-MAX_PARTICLES), ...newParticles]); // Cap at limit
  }, [BURST_COUNT, MAX_PARTICLES]);

  // Game Loop for Physics
  const animate = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    // delta is not used directly for sim simplicity here, assuming 60fps stable enough for visual fluff
    
    setParticles(prevParticles => {
      if (prevParticles.length === 0) return prevParticles;

      return prevParticles
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vx: p.vx * DRAG,
          vy: p.vy * DRAG + GRAVITY, // Add Gravity
          rotation: p.rotation + p.rotationSpeed,
          life: p.life - 0.02 // Decay
        }))
        .filter(p => p.life > 0);
    });

    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  useEffect(() => {
    let lastMoveOffset = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Throttled trail spawning (distance based)
      const now = Date.now();
      if (now - lastMoveOffset > 30) {
          spawnParticles(e.clientX, e.clientY, false);
          lastMoveOffset = now;
      }
    };

    const handleClick = (e: MouseEvent) => {
        spawnParticles(e.clientX, e.clientY, true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleClick);
    };
  }, [spawnParticles, mouseX, mouseY]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
                position: 'absolute',
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                transform: `translate(-50%, -50%) rotate(${particle.rotation}deg) scale(${particle.life})`,
                opacity: particle.life,
                // Star shape clip-path
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`, // Glow effect
            }}
          />
        ))}
    </div>
  );
}
