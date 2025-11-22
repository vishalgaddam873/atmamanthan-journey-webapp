import { useEffect, useState } from "react";

const MirrorReflection = ({ show = false, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [reflectionIntensity, setReflectionIntensity] = useState(0);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Gradually increase reflection intensity
      const interval = setInterval(() => {
        setReflectionIntensity((prev) => {
          if (prev >= 1) {
            clearInterval(interval);
            if (onComplete) {
              setTimeout(onComplete, 500);
            }
            return 1;
          }
          return prev + 0.05;
        });
      }, 50);

      return () => clearInterval(interval);
    } else {
      setIsVisible(false);
      setReflectionIntensity(0);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        opacity: reflectionIntensity,
        transition: "opacity 0.5s ease-in-out",
      }}
    >

      {/* Reflection overlay - subtle mirror effect */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            rgba(255, 255, 255, ${reflectionIntensity * 0.1}) 0%,
            transparent 20%,
            transparent 80%,
            rgba(0, 0, 0, ${reflectionIntensity * 0.2}) 100%
          )`,
          backdropFilter: `blur(${reflectionIntensity * 0.5}px)`,
          WebkitBackdropFilter: `blur(${reflectionIntensity * 0.5}px)`,
        }}
      />

      {/* Center highlight - like mirror reflection */}
      <div
        // className="absolute inset-0"
        // style={{
        //   background: `radial-gradient(
        //     ellipse at center,
        //     rgba(255, 255, 255, ${reflectionIntensity * 0.15}) 0%,
        //     transparent 70%
        //   )`,
        // }}
      />

      {/* Subtle shimmer animation */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, ${reflectionIntensity * 0.1}) 50%,
            transparent 100%
          )`,
          animation: "shimmer 3s infinite",
          transform: "translateX(-100%)",
        }}
      />
    </div>
  );
};

export default MirrorReflection;
