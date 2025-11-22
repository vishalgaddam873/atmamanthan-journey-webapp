import { useEffect, useState } from 'react';

const LightAnimation = ({ show = false, intensity = 0.5, color = 'rgba(255, 255, 200, 0.3)' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Gradually increase light intensity
      const interval = setInterval(() => {
        setLightIntensity((prev) => {
          if (prev >= intensity) {
            return intensity;
          }
          return Math.min(prev + 0.02, intensity);
        });
      }, 50);

      // Pulse animation
      const pulseInterval = setInterval(() => {
        setPulsePhase((prev) => (prev + 0.1) % (Math.PI * 2));
      }, 50);

      return () => {
        clearInterval(interval);
        clearInterval(pulseInterval);
      };
    } else {
      setIsVisible(false);
      setLightIntensity(0);
      setPulsePhase(0);
    }
  }, [show, intensity]);

  if (!isVisible) return null;

  const pulseValue = Math.sin(pulsePhase) * 0.1 + 1; // Pulse between 0.9 and 1.1

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-20"
      style={{
        opacity: lightIntensity,
        transition: 'opacity 1s ease-in-out',
      }}
    >
      {/* Main radial light - expanding from center */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            ellipse at center,
            ${color.replace('0.3', String(lightIntensity * 0.6 * pulseValue))} 0%,
            ${color.replace('0.3', String(lightIntensity * 0.4 * pulseValue))} 30%,
            ${color.replace('0.3', String(lightIntensity * 0.2 * pulseValue))} 60%,
            transparent 100%
          )`,
          transform: `scale(${1 + lightIntensity * 0.2 * pulseValue})`,
          transition: 'transform 2s ease-out',
        }}
      />

      {/* Secondary light layers for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            circle at 30% 40%,
            ${color.replace('0.3', String(lightIntensity * 0.3 * pulseValue))} 0%,
            transparent 50%
          )`,
          transform: `scale(${1 + lightIntensity * 0.15 * pulseValue})`,
          transition: 'transform 2.5s ease-out',
        }}
      />

      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            circle at 70% 60%,
            ${color.replace('0.3', String(lightIntensity * 0.3 * pulseValue))} 0%,
            transparent 50%
          )`,
          transform: `scale(${1 + lightIntensity * 0.15 * pulseValue})`,
          transition: 'transform 2.5s ease-out',
        }}
      />

      {/* Light rays - rotation removed */}
      <div 
        className="absolute inset-0"
        style={{
          background: `conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            ${color.replace('0.3', String(lightIntensity * 0.1 * pulseValue))} 45deg,
            transparent 90deg,
            ${color.replace('0.3', String(lightIntensity * 0.1 * pulseValue))} 135deg,
            transparent 180deg,
            ${color.replace('0.3', String(lightIntensity * 0.1 * pulseValue))} 225deg,
            transparent 270deg,
            ${color.replace('0.3', String(lightIntensity * 0.1 * pulseValue))} 315deg,
            transparent 360deg
          )`,
        }}
      />

      {/* Glowing particles effect */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const distance = 30 + lightIntensity * 20;
        const x = 50 + Math.cos(angle) * distance;
        const y = 50 + Math.sin(angle) * distance;
        const size = 2 + lightIntensity * 3;
        const delay = i * 0.1;

        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: color.replace('0.3', String(lightIntensity * 0.8)),
              boxShadow: `0 0 ${size * 2}px ${color.replace('0.3', String(lightIntensity * 0.6))}`,
              transform: `translate(-50%, -50%) scale(${pulseValue})`,
              animation: `float ${3 + delay}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
};

export default LightAnimation;

