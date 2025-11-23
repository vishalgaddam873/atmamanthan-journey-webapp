import { useEffect, useState } from "react";

const CelebrationAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); // 0: initial burst, 1: expansion, 2: particles

  useEffect(() => {
    // Enhanced timing: 6 seconds total
    const phase1Timer = setTimeout(() => setPhase(1), 800);
    const phase2Timer = setTimeout(() => setPhase(2), 2000);
    const completeTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 6000);

    return () => {
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Spiritual color palette matching the app's theme
  const spiritualColors = {
    gold: "#FFD700",
    lightGold: "#FFF8DC",
    purple: "#8B5CF6",
    indigo: "#4F46E5",
    lightPurple: "#A78BFA",
    white: "#FFFFFF",
    softBlue: "#60A5FA",
    softPink: "#F472B6",
  };

  return (
    <>
    </>
    // <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden">
    //   {/* Background light bloom effect */}
    //   <div
    //     className="absolute inset-0 transition-opacity duration-1000"
    //     style={{
    //       opacity: phase >= 1 ? 0.4 : 0,
    //       background: `radial-gradient(circle at center, 
    //         rgba(255, 215, 0, 0.3) 0%, 
    //         rgba(139, 92, 246, 0.2) 30%, 
    //         rgba(79, 70, 229, 0.15) 50%, 
    //         transparent 70%)`,
    //     }}
    //   />

    //   {/* Expanding light rings */}
    //   {[...Array(5)].map((_, i) => (
    //     <div
    //       key={`ring-${i}`}
    //       className="absolute top-1/2 left-1/2 rounded-full border-2"
    //       style={{
    //         width: phase >= 1 ? "200vmax" : "0px",
    //         height: phase >= 1 ? "200vmax" : "0px",
    //         borderColor:
    //           i % 2 === 0 ? spiritualColors.gold : spiritualColors.purple,
    //         opacity: phase >= 1 ? Math.max(0, 0.6 - i * 0.15) : 0,
    //         transform: "translate(-50%, -50%)",
    //         transition: `all ${2 + i * 0.3}s ease-out`,
    //         transitionDelay: `${i * 0.2}s`,
    //         boxShadow: `0 0 ${20 + i * 10}px ${
    //           i % 2 === 0 ? spiritualColors.gold : spiritualColors.purple
    //         }`,
    //       }}
    //     />
    //   ))}

    //   {/* Center celebration burst - Enhanced */}
    //   <div className="absolute inset-0 flex items-center justify-center">
    //     <div className="relative" style={{ width: "400px", height: "400px" }}>
    //       {/* Primary burst - particles radiating outward */}
    //       {[...Array(32)].map((_, i) => {
    //         const angle = (i * 360) / 32;
    //         const radian = (angle * Math.PI) / 180;
    //         const distance = 200;
    //         const x = Math.cos(radian) * distance;
    //         const y = Math.sin(radian) * distance;
    //         const colorIndex = i % 4;
    //         const colors = [
    //           spiritualColors.gold,
    //           spiritualColors.purple,
    //           spiritualColors.softBlue,
    //           spiritualColors.lightPurple,
    //         ];

    //         return (
    //           <div
    //             key={`burst-${i}`}
    //             className="absolute rounded-full"
    //             style={{
    //               width: "12px",
    //               height: "12px",
    //               backgroundColor: colors[colorIndex],
    //               left: "50%",
    //               top: "50%",
    //               transform: `translate(-50%, -50%) translate(${x * 0.3}px, ${
    //                 y * 0.3
    //               }px) scale(0)`,
    //               animation: `celebration-burst-enhanced 2s ease-out ${
    //                 i * 0.02
    //               }s forwards`,
    //               animationFillMode: "forwards",
    //               opacity: 0,
    //               boxShadow: `0 0 20px ${colors[colorIndex]}, 0 0 40px ${colors[colorIndex]}`,
    //               "--end-x": `${x}px`,
    //               "--end-y": `${y}px`,
    //             }}
    //           />
    //         );
    //       })}

    //       {/* Secondary burst - smaller particles */}
    //       {[...Array(24)].map((_, i) => {
    //         const angle = (i * 360) / 24 + 7.5; // Offset by 7.5 degrees
    //         const radian = (angle * Math.PI) / 180;
    //         const distance = 150;
    //         const x = Math.cos(radian) * distance;
    //         const y = Math.sin(radian) * distance;

    //         return (
    //           <div
    //             key={`burst-small-${i}`}
    //             className="absolute rounded-full"
    //             style={{
    //               width: "6px",
    //               height: "6px",
    //               backgroundColor: spiritualColors.white,
    //               left: "50%",
    //               top: "50%",
    //               transform: `translate(-50%, -50%) translate(${x * 0.2}px, ${
    //                 y * 0.2
    //               }px) scale(0)`,
    //               animation: `celebration-burst-enhanced 1.5s ease-out ${
    //                 0.3 + i * 0.015
    //               }s forwards`,
    //               animationFillMode: "forwards",
    //               opacity: 0,
    //               boxShadow: `0 0 15px ${spiritualColors.white}`,
    //               "--end-x": `${x}px`,
    //               "--end-y": `${y}px`,
    //             }}
    //           />
    //         );
    //       })}

    //       {/* Center glowing orb with pulse */}
    //       <div
    //         className="absolute top-1/2 left-1/2 rounded-full animate-pulse"
    //         style={{
    //           width: phase >= 1 ? "200px" : "120px",
    //           height: phase >= 1 ? "200px" : "120px",
    //           transform: "translate(-50%, -50%)",
    //           transition: "all 0.8s ease-out",
    //           background: `radial-gradient(circle, 
    //             ${spiritualColors.lightGold} 0%, 
    //             ${spiritualColors.gold} 30%, 
    //             ${spiritualColors.purple} 70%, 
    //             ${spiritualColors.indigo} 100%)`,
    //           boxShadow: `
    //             0 0 80px ${spiritualColors.gold},
    //             0 0 120px ${spiritualColors.purple},
    //             0 0 160px ${spiritualColors.indigo},
    //             inset 0 0 60px rgba(255, 255, 255, 0.3)
    //           `,
    //         }}
    //       />

    //       {/* Inner core light */}
    //       <div
    //         className="absolute top-1/2 left-1/2 rounded-full"
    //         style={{
    //           width: "60px",
    //           height: "60px",
    //           transform: "translate(-50%, -50%)",
    //           background: `radial-gradient(circle, ${spiritualColors.white} 0%, ${spiritualColors.lightGold} 100%)`,
    //           boxShadow: `0 0 40px ${spiritualColors.white}, 0 0 80px ${spiritualColors.gold}`,
    //           animation: "pulse-glow 1.5s ease-in-out infinite",
    //         }}
    //       />
    //     </div>
    //   </div>

    //   {/* Enhanced confetti particles - falling from top */}
    //   {phase >= 2 &&
    //     [...Array(80)].map((_, i) => {
    //       const colors = [
    //         spiritualColors.gold,
    //         spiritualColors.purple,
    //         spiritualColors.softBlue,
    //         spiritualColors.lightPurple,
    //         spiritualColors.white,
    //         spiritualColors.softPink,
    //       ];
    //       const color = colors[Math.floor(Math.random() * colors.length)];
    //       const size = Math.random() * 16 + 10;
    //       const left = Math.random() * 100;
    //       const delay = Math.random() * 0.8;
    //       const duration = 2 + Math.random() * 2;
    //       const rotation = Math.random() * 720;
    //       const shape = Math.random() > 0.5 ? "circle" : "square";

    //       return (
    //         <div
    //           key={`confetti-${i}`}
    //           className="absolute"
    //           style={{
    //             left: `${left}%`,
    //             top: "-5%",
    //             animation: `confetti-fall-enhanced ${duration}s ease-in ${delay}s forwards`,
    //             transform: `rotate(${rotation}deg)`,
    //             animationFillMode: "forwards",
    //           }}
    //         >
    //           <div
    //             className={shape === "circle" ? "rounded-full" : ""}
    //             style={{
    //               width: `${size}px`,
    //               height: `${size}px`,
    //               backgroundColor: color,
    //               boxShadow: `0 0 ${size * 1.5}px ${color}, 0 0 ${
    //                 size * 2.5
    //               }px ${color}`,
    //               transform: shape === "square" ? "rotate(45deg)" : "none",
    //             }}
    //           />
    //         </div>
    //       );
    //     })}

    //   {/* Floating light orbs */}
    //   {phase >= 1 &&
    //     [...Array(30)].map((_, i) => {
    //       const size = Math.random() * 20 + 15;
    //       const left = Math.random() * 100;
    //       const top = Math.random() * 100;
    //       const delay = Math.random() * 2;
    //       const duration = 3 + Math.random() * 2;
    //       const colors = [
    //         spiritualColors.gold,
    //         spiritualColors.purple,
    //         spiritualColors.softBlue,
    //       ];
    //       const color = colors[Math.floor(Math.random() * colors.length)];

    //       return (
    //         <div
    //           key={`orb-${i}`}
    //           className="absolute rounded-full"
    //           style={{
    //             left: `${left}%`,
    //             top: `${top}%`,
    //             width: `${size}px`,
    //             height: `${size}px`,
    //             background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    //             opacity: 0,
    //             animation: `float-orb ${duration}s ease-in-out ${delay}s infinite`,
    //             boxShadow: `0 0 ${size * 2}px ${color}`,
    //           }}
    //         />
    //       );
    //     })}

    //   {/* Sparkle effects - enhanced */}
    //   {[...Array(60)].map((_, i) => {
    //     const left = Math.random() * 100;
    //     const top = Math.random() * 100;
    //     const delay = Math.random() * 2;
    //     const size = Math.random() * 6 + 4;

    //     return (
    //       <div
    //         key={`sparkle-${i}`}
    //         className="absolute"
    //         style={{
    //           left: `${left}%`,
    //           top: `${top}%`,
    //           width: `${size}px`,
    //           height: `${size}px`,
    //           animation: `sparkle-enhanced 2s ease-in-out ${delay}s infinite`,
    //         }}
    //       >
    //         <div
    //           className="w-full h-full rounded-full"
    //           style={{
    //             background: `radial-gradient(circle, ${spiritualColors.white} 0%, transparent 70%)`,
    //             boxShadow: `0 0 ${size * 3}px ${spiritualColors.white}, 0 0 ${
    //               size * 5
    //             }px ${spiritualColors.gold}`,
    //           }}
    //         />
    //       </div>
    //     );
    //   })}
    // </div>
  );
};

export default CelebrationAnimation;
