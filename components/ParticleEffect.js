import { useEffect, useState, useRef } from 'react';

const ParticleEffect = ({ show = false, type = 'gentle', color = 'rgba(255, 255, 255, 0.6)' }) => {
  const [particles, setParticles] = useState([]);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    // Create particles based on type
    const particleCount = type === 'gentle' ? 30 : type === 'intense' ? 80 : 50;
    const newParticles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      life: Math.random() * 100 + 50,
      maxLife: Math.random() * 100 + 50,
    }));

    setParticles(newParticles);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      newParticles.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        // Update life
        particle.life--;
        if (particle.life <= 0) {
          particle.life = particle.maxLife;
          particle.x = Math.random() * width;
          particle.y = Math.random() * height;
        }

        // Draw particle
        const alpha = (particle.life / particle.maxLife) * particle.opacity;
        ctx.fillStyle = color.replace('0.6', String(alpha));
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [show, type, color]);

  if (!show) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-15"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default ParticleEffect;

