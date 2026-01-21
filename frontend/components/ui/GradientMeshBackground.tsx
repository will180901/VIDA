'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

const PARTICLE_COLORS = [
  '#EFF6EF', '#D2E5D2', '#B5D4B5', '#98C397', '#80B57F',
  '#5EA25D', '#4D854C', '#3C683C', '#2B4A2B', '#1A2D1A', '#091009',
];

export default function GradientMeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  const isScrollingRef = useRef(false);
  const particlesRef = useRef<Particle[]>([]);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const initParticles = useCallback((width: number, height: number) => {
    // AUGMENTATION MASSIVE : 300-400 particules !
    const numParticles = Math.min(400, Math.max(300, Math.floor((width * height) / 5000)));
    const particles: Particle[] = [];

    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.4 + 0.2; // Vitesse variée
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 4 + 1.5, // Tailles variées (1.5-5.5px)
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.2); // Réduire DPR pour performance
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      particlesRef.current = initParticles(window.innerWidth, window.innerHeight);
    };

    resizeCanvas();

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 300);
    };

    const handleVisibility = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };

    // Pause pendant scroll pour performance
    const handleScroll = () => {
      isScrollingRef.current = true;
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    const animate = () => {
      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Réduire framerate pendant scroll
      if (isScrollingRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      const particles = particlesRef.current;

      ctx.clearRect(0, 0, width, height);

      // Collision simplifiée - grille plus grande pour performance
      const gridSize = 80; // Augmenté pour moins de calculs
      const grid: Map<string, number[]> = new Map();
      
      // Placer particules dans grille
      particles.forEach((p, i) => {
        const key = `${Math.floor(p.x / gridSize)},${Math.floor(p.y / gridSize)}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key)!.push(i);
      });

      // Vérifier collisions seulement dans cellules adjacentes
      particles.forEach((p, i) => {
        const cx = Math.floor(p.x / gridSize);
        const cy = Math.floor(p.y / gridSize);
        
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const neighbors = grid.get(`${cx + dx},${cy + dy}`);
            if (!neighbors) continue;
            
            for (const j of neighbors) {
              if (j <= i) continue;
              const other = particles[j];
              const ddx = other.x - p.x;
              const ddy = other.y - p.y;
              const distSq = ddx * ddx + ddy * ddy;
              const minDist = p.radius + other.radius + 5;
              
              if (distSq < minDist * minDist && distSq > 0) {
                const dist = Math.sqrt(distSq);
                const nx = ddx / dist;
                const ny = ddy / dist;
                const avoidStrength = 0.03;
                
                p.vx -= nx * avoidStrength;
                p.vy -= ny * avoidStrength;
                other.vx += nx * avoidStrength;
                other.vy += ny * avoidStrength;
              }
            }
          }
        }
      });

      // Mise à jour positions
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Rebonds
        if (p.x < p.radius) { p.x = p.radius; p.vx = Math.abs(p.vx); }
        else if (p.x > width - p.radius) { p.x = width - p.radius; p.vx = -Math.abs(p.vx); }
        if (p.y < p.radius) { p.y = p.radius; p.vy = Math.abs(p.vy); }
        else if (p.y > height - p.radius) { p.y = height - p.radius; p.vy = -Math.abs(p.vy); }

        // Maintenir vitesse
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed < 0.2 || speed > 0.5) {
          const target = speed < 0.2 ? 0.2 : 0.5;
          const factor = target / speed;
          p.vx *= factor;
          p.vy *= factor;
        }

        // Variation organique
        p.vx += (Math.random() - 0.5) * 0.008;
        p.vy += (Math.random() - 0.5) * 0.008;
      }

      // Dessiner
      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearTimeout(resizeTimeout);
      clearTimeout(scrollTimeoutRef.current);
    };
  }, [initParticles]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full gpu-accelerated" />
    </div>
  );
}
