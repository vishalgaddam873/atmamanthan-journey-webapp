import { useEffect, useState } from 'react';

/**
 * CircularGlowAnimation - Creates expanding circular orbit/ripple effect
 * Starts as small orbits and expands to larger ripples
 * Used for Audio 1 and Audio 7 in Positive Flow
 * @param {boolean} show - Whether to show the animation
 * @param {number} duration - Duration in milliseconds (audio duration)
 * @param {string} color - Glow color
 */
const CircularGlowAnimation = ({ show = false, duration = 10000, color = 'rgba(255, 248, 250, 0.8)' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    if (show && duration > 0) {
      setIsVisible(true);
      setBrightness(0);
      setRipples([]);

      // Create new ripples more frequently for smoother effect
      const rippleInterval = setInterval(() => {
        setRipples((prev) => {
          const newRipples = [...prev, { 
            id: Date.now() + Math.random(), 
            startTime: Date.now() 
          }];
          // Keep more ripples for better visual continuity
          return newRipples.slice(-8);
        });
      }, duration / 12); // Create a new ripple every 1/12th of duration

      // Gradually increase brightness over the duration
      const startTime = Date.now();
      const brightnessInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-in-out curve for smooth brightness increase
        const easedProgress = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        setBrightness(easedProgress);
      }, 50);

      return () => {
        clearInterval(rippleInterval);
        clearInterval(brightnessInterval);
      };
    } else {
      setIsVisible(false);
      setBrightness(0);
      setRipples([]);
    }
  }, [show, duration]);

  if (!isVisible) return null;

  // Extract color values for use in borders
  const colorMatch = color.match(/rgba?\(([^)]+)\)/);
  const colorValues = colorMatch ? colorMatch[1] : '255, 248, 250, 0.8';

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden"
      style={{
        opacity: 0.9 + brightness * 0.1,
      }}
    >
      {/* Base glow layer that brightens */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            circle at center,
            ${color.replace(/[\d.]+\)$/, `${0.3 + brightness * 0.5})`)} 0%,
            ${color.replace(/[\d.]+\)$/, `${0.2 + brightness * 0.4})`)} 30%,
            ${color.replace(/[\d.]+\)$/, `${0.1 + brightness * 0.3})`)} 60%,
            transparent 100%
          )`,
          transition: 'opacity 0.5s ease-in-out',
        }}
      />

      {/* Expanding orbit ripples - start small and grow large */}
      {ripples.map((ripple, index) => {
        const age = Date.now() - ripple.startTime;
        const maxAge = duration / 1.5; // Ripple expands for 2/3 of duration
        const progress = Math.min(age / maxAge, 1);
        
        // Start from very small orbit (0.1) and expand to large (4.0)
        const scale = 0.1 + progress * 3.9;
        
        // Opacity: start visible, fade out as it expands
        const opacity = Math.max(0, (1 - progress) * (0.8 + brightness * 0.2));
        
        // Calculate size based on viewport
        const baseSize = Math.max(window.innerWidth, window.innerHeight);
        const currentSize = baseSize * scale;

        return (
          <div
            key={ripple.id}
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: `${currentSize}px`,
              height: `${currentSize}px`,
              transform: 'translate(-50%, -50%)',
              border: `2px solid rgba(${colorValues.split(',').slice(0, 3).join(',')}, ${opacity * 0.6})`,
              boxShadow: `
                0 0 ${20 * scale}px rgba(${colorValues.split(',').slice(0, 3).join(',')}, ${opacity * 0.4}),
                0 0 ${40 * scale}px rgba(${colorValues.split(',').slice(0, 3).join(',')}, ${opacity * 0.3}),
                inset 0 0 ${30 * scale}px rgba(${colorValues.split(',').slice(0, 3).join(',')}, ${opacity * 0.2})
              `,
              opacity: opacity,
              transition: 'none',
            }}
          >
            {/* Inner concentric ring for depth */}
            <div
              className="absolute top-1/2 left-1/2 rounded-full"
              style={{
                width: '60%',
                height: '60%',
                transform: 'translate(-50%, -50%)',
                border: `1px solid rgba(${colorValues.split(',').slice(0, 3).join(',')}, ${opacity * 0.4})`,
                boxShadow: `0 0 ${15 * scale}px rgba(${colorValues.split(',').slice(0, 3).join(',')}, ${opacity * 0.3})`,
              }}
            />
            
            {/* Outer glow ring */}
            <div
              className="absolute top-1/2 left-1/2 rounded-full"
              style={{
                width: '120%',
                height: '120%',
                transform: 'translate(-50%, -50%)',
                border: `1px solid rgba(${colorValues.split(',').slice(0, 3).join(',')}, ${opacity * 0.2})`,
                boxShadow: `0 0 ${25 * scale}px rgba(${colorValues.split(',').slice(0, 3).join(',')}, ${opacity * 0.25})`,
              }}
            />
          </div>
        );
      })}

      {/* Additional radial gradient ripples for smoother effect */}
      {ripples.map((ripple, index) => {
        const age = Date.now() - ripple.startTime;
        const maxAge = duration / 1.5;
        const progress = Math.min(age / maxAge, 1);
        const scale = 0.15 + progress * 3.5; // Slightly different scale for variation
        const opacity = Math.max(0, (1 - progress * 1.1) * (0.5 + brightness * 0.3));

        return (
          <div
            key={`gradient-${ripple.id}`}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(
                circle at center,
                transparent 0%,
                transparent ${Math.max(0, (scale - 0.5) * 20)}%,
                rgba(${colorValues.split(',').slice(0, 3).join(',')}, ${opacity * 0.3}) ${Math.max(0, (scale - 0.3) * 20)}%,
                rgba(${colorValues.split(',').slice(0, 3).join(',')}, ${opacity * 0.15}) ${Math.min(100, scale * 25)}%,
                transparent ${Math.min(100, (scale + 0.2) * 25)}%
              )`,
              transform: `scale(${scale})`,
              transition: 'none',
              opacity: opacity,
            }}
          />
        );
      })}

      {/* Overall brightness overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            ellipse at center,
            rgba(255, 250, 255, ${brightness * 0.3}) 0%,
            rgba(255, 248, 250, ${brightness * 0.25}) 50%,
            rgba(250, 240, 255, ${brightness * 0.2}) 70%,
            transparent 100%
          )`,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    </div>
  );
};

export default CircularGlowAnimation;

