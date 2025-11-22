import { useEffect, useState } from 'react';

/**
 * CircularGlowAnimation - Creates expanding circular glow effect
 * Used for Audio 1 and Audio 7 in Positive Flow
 * @param {boolean} show - Whether to show the animation
 * @param {number} duration - Duration in milliseconds (audio duration)
 * @param {string} color - Glow color
 */
const CircularGlowAnimation = ({ show = false, duration = 10000, color = 'rgba(255, 220, 100, 0.6)' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [circles, setCircles] = useState([]);

  useEffect(() => {
    if (show && duration > 0) {
      setIsVisible(true);
      setBrightness(0);
      setCircles([]);

      // Create expanding circles
      const circleInterval = setInterval(() => {
        setCircles((prev) => {
          const newCircles = [...prev, { id: Date.now(), startTime: Date.now() }];
          // Keep only last 5 circles for performance
          return newCircles.slice(-5);
        });
      }, duration / 8); // Create a new circle every 1/8th of duration

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
        clearInterval(circleInterval);
        clearInterval(brightnessInterval);
      };
    } else {
      setIsVisible(false);
      setBrightness(0);
      setCircles([]);
    }
  }, [show, duration]);

  if (!isVisible) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-30"
      style={{
        opacity: 0.9 + brightness * 0.1, // Overall screen brightness increases
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

      {/* Expanding circles */}
      {circles.map((circle, index) => {
        const age = Date.now() - circle.startTime;
        const maxAge = duration / 2; // Circle expands for half the duration
        const progress = Math.min(age / maxAge, 1);
        const scale = 0.5 + progress * 2; // Scale from 0.5 to 2.5
        const opacity = Math.max(0, 1 - progress * 1.2); // Fade out as it expands

        return (
          <div
            key={circle.id}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(
                circle at center,
                ${color.replace(/[\d.]+\)$/, `${opacity * (0.4 + brightness * 0.3)})`)} 0%,
                ${color.replace(/[\d.]+\)$/, `${opacity * (0.2 + brightness * 0.2)})`)} 40%,
                transparent 70%
              )`,
              transform: `scale(${scale})`,
              transition: 'transform 0.1s linear, opacity 0.1s linear',
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
            rgba(255, 255, 255, ${brightness * 0.15}) 0%,
            rgba(255, 255, 200, ${brightness * 0.1}) 50%,
            transparent 100%
          )`,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    </div>
  );
};

export default CircularGlowAnimation;

