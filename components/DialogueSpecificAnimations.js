import { useEffect, useState } from 'react';

/**
 * Dialogue-Specific Animations Component
 * Provides unique cinematic visual overlays for each dialogue sequence (1-9)
 * in the positive flow, creating a spiritual, meditative atmosphere.
 */
const DialogueSpecificAnimations = ({ dialogueSequence, show }) => {
  const [opacity, setOpacity] = useState(0);
  const [prevSequence, setPrevSequence] = useState(null);

  // Smooth fade transitions when sequence changes
  useEffect(() => {
    if (show && dialogueSequence != null) {
      // Fade in when showing
      setOpacity(1);
      setPrevSequence(dialogueSequence);
    } else {
      // Fade out when hiding
      setOpacity(0);
    }
  }, [show, dialogueSequence]);

  if (!show || dialogueSequence == null) return null;

  const seq = Number(dialogueSequence);

  return (
    <div 
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      style={{
        opacity,
        transition: 'opacity 0.8s ease-in-out',
      }}
    >
      {/* SEQUENCE 1 – Inner Light Appears */}
      {seq === 1 && (
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Deep dark backdrop with vignette */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.9) 70%, black 100%)',
            }}
          />

          {/* Soft glowing orb with breathing animation */}
          <div className="relative flex items-center justify-center">
            {/* Outer glow layer */}
            <div 
              className="absolute w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,237,160,0.3) 0%, rgba(255,220,100,0.2) 40%, transparent 70%)',
                filter: 'blur(40px)',
                animation: 'gentle-pulse 4s ease-in-out infinite',
              }}
            />
            
            {/* Main orb */}
            <div 
              className="absolute w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,200,0.9) 0%, rgba(255,237,160,0.7) 50%, rgba(255,220,100,0.4) 100%)',
                boxShadow: '0 0 60px rgba(255,255,200,0.8), 0 0 120px rgba(255,220,100,0.4)',
                animation: 'gentle-pulse 3s ease-in-out infinite',
              }}
            />
            
            {/* Inner core */}
            <div 
              className="absolute w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,200,0.8) 100%)',
                boxShadow: '0 0 40px rgba(255,255,255,0.9)',
              }}
            />
          </div>

          {/* Floating golden particles */}
          {[...Array(6)].map((_, i) => {
            const positions = [
              { top: '10%', left: '20%' },
              { top: '15%', right: '25%' },
              { bottom: '20%', left: '15%' },
              { bottom: '15%', right: '20%' },
              { top: '50%', left: '8%' },
              { top: '50%', right: '10%' },
            ];
            const pos = positions[i];
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  ...pos,
                  width: '4px',
                  height: '4px',
                  background: 'rgba(255,220,100,0.8)',
                  boxShadow: '0 0 8px rgba(255,220,100,0.6)',
                  animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* SEQUENCE 2 – Silhouette in Light (Just Look in Mirror) */}
      {seq === 2 && (
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Dark background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-black opacity-90" />

          {/* Vertical light column/aura */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)',
            }}
          />

          {/* Silhouette with glow */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Back glow */}
            <div 
              className="absolute w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            
            {/* Head silhouette */}
            <div 
              className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(200,200,200,0.3) 50%, transparent 100%)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 0 40px rgba(255,255,255,0.4), inset 0 0 20px rgba(255,255,255,0.2)',
                filter: 'blur(1px)',
              }}
            />
            
            {/* Body silhouette */}
            <div 
              className="mt-2 w-28 h-40 sm:w-32 sm:h-48 md:w-36 md:h-56 rounded-[999px]"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(200,200,200,0.2) 40%, transparent 100%)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 0 30px rgba(255,255,255,0.3)',
                filter: 'blur(0.5px)',
              }}
            />
          </div>
        </div>
      )}

      {/* SEQUENCE 3 – Healing Waves & Energy */}
      {seq === 3 && (
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Dark background */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black opacity-90" />

          {/* Center healing glow */}
          <div className="relative flex items-center justify-center">
            {/* Core glow - pink/amber */}
            <div 
              className="absolute w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,182,193,0.8) 0%, rgba(255,200,150,0.6) 50%, rgba(255,220,100,0.4) 100%)',
                filter: 'blur(20px)',
                animation: 'gentle-pulse 2.5s ease-in-out infinite',
              }}
            />

            {/* Healing rings - concentric waves */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute rounded-full border"
                style={{
                  width: `${160 + i * 80}px`,
                  height: `${160 + i * 80}px`,
                  borderColor: i === 0 
                    ? 'rgba(255,182,193,0.7)' 
                    : i === 1 
                    ? 'rgba(255,200,150,0.5)' 
                    : 'rgba(255,220,100,0.4)',
                  animation: 'animate-ping',
                  animationDuration: `${2 + i * 0.5}s`,
                  animationDelay: `${i * 0.3}s`,
                  animationIterationCount: 'infinite',
                }}
              />
            ))}
          </div>

          {/* Spark particles around center */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 120;
            const x = 50 + Math.cos(angle) * (distance / window.innerWidth * 100);
            const y = 50 + Math.sin(angle) * (distance / window.innerHeight * 100);
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: '3px',
                  height: '3px',
                  background: i % 2 === 0 ? 'rgba(255,182,193,0.9)' : 'rgba(255,200,150,0.9)',
                  boxShadow: '0 0 10px rgba(255,182,193,0.8)',
                  animation: 'gentle-pulse 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* SEQUENCE 4 – Love & Joy Swirling Inside */}
      {seq === 4 && (
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Dark background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-slate-950 to-black opacity-85" />

          {/* Silhouette with swirling gradient inside */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Warm back glow */}
            <div 
              className="absolute w-96 h-96 sm:w-[28rem] sm:h-[28rem] md:w-[32rem] md:h-[32rem] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,182,193,0.4) 0%, rgba(255,200,150,0.3) 40%, rgba(255,220,100,0.2) 70%, transparent 100%)',
                filter: 'blur(80px)',
              }}
            />

            {/* Body container with swirling gradient */}
            <div className="relative flex flex-col items-center">
              {/* Head with warm glow */}
              <div 
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden"
                style={{
                  background: 'radial-gradient(circle, rgba(255,182,193,0.8) 0%, rgba(255,200,150,0.6) 100%)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 0 30px rgba(255,182,193,0.5)',
                  animation: 'gentle-pulse 3s ease-in-out infinite',
                }}
              />

              {/* Body with static gradient */}
              <div 
                className="mt-2 w-28 h-40 sm:w-32 sm:h-48 md:w-36 md:h-56 rounded-[999px] overflow-hidden"
                style={{
                  border: '1px solid rgba(255,255,255,0.25)',
                  boxShadow: '0 0 40px rgba(255,182,193,0.4)',
                }}
              >
                <div 
                  className="w-full h-full"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(255,182,193,0.8) 0%, rgba(255,200,150,0.6) 50%, rgba(255,220,100,0.4) 100%)',
                    opacity: 0.8,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEQUENCE 5 – Waiting for Promise Selection (Pran) */}
      {seq === 5 && (
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Dark background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-black opacity-90" />

          {/* Soft glow near bottom (table area) */}
          <div 
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: '33%',
              background: 'linear-gradient(to top, rgba(255,220,100,0.2) 0%, rgba(255,220,100,0.05) 50%, transparent 100%)',
            }}
          />

          {/* Calm halo in center */}
          <div className="relative flex items-center justify-center">
            {/* Outer ring */}
            <div 
              className="absolute w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full border"
              style={{
                borderColor: 'rgba(255,220,100,0.6)',
                boxShadow: '0 0 50px rgba(255,255,200,0.5)',
              }}
            />
            
            {/* Inner soft glow */}
            <div 
              className="absolute w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,220,100,0.4) 0%, transparent 70%)',
                filter: 'blur(20px)',
                animation: 'gentle-pulse 4s ease-in-out infinite',
              }}
            />
          </div>

          {/* Waiting dots at bottom */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-amber-200"
                style={{
                  animation: 'bounce 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* SEQUENCE 6 – "You Chose Light" – Blooming */}
      {seq === 6 && (
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Dark background */}
          <div className="absolute inset-0 bg-black opacity-85" />

          {/* Central bloom with breathing animation */}
          <div className="relative flex items-center justify-center">
            {/* Outer bloom layer */}
            <div 
              className="absolute w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,220,100,0.8) 0%, rgba(255,237,160,0.6) 40%, rgba(255,255,200,0.4) 70%, transparent 100%)',
                filter: 'blur(50px)',
                animation: 'gentle-pulse 3s ease-in-out infinite',
              }}
            />
            
            {/* Main bloom */}
            <div 
              className="absolute w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,220,0.9) 0%, rgba(255,220,100,0.8) 50%, rgba(255,200,150,0.6) 100%)',
                boxShadow: '0 0 80px rgba(255,255,220,0.9), 0 0 160px rgba(255,220,100,0.6)',
                animation: 'gentle-pulse 2.5s ease-in-out infinite',
              }}
            />
            
            {/* Inner core */}
            <div 
              className="absolute w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,220,0.9) 100%)',
                boxShadow: '0 0 60px rgba(255,255,255,1)',
              }}
            />
          </div>
        </div>
      )}

      {/* SEQUENCE 7 – Light Growing & Spreading */}
      {seq === 7 && (
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Dark edges */}
          <div className="absolute inset-0 bg-black" />

          {/* Expanding radial light from center */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,220,100,0.7) 0%, rgba(255,237,160,0.4) 30%, rgba(255,255,200,0.2) 60%, transparent 100%)',
              animation: 'gentle-pulse 2s ease-in-out infinite',
            }}
          />

          {/* Light rays emanating from center (8 directions) */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(8)].map((_, i) => {
              const angle = i * 45; // 8 rays at 45-degree intervals
              return (
                <div
                  key={i}
                  className="absolute origin-center"
                  style={{
                    width: '2px',
                    height: '200px',
                    background: 'linear-gradient(to bottom, rgba(255,220,100,0.7) 0%, rgba(255,237,160,0.4) 50%, transparent 100%)',
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: 'center bottom',
                    boxShadow: '0 0 20px rgba(255,220,100,0.5)',
                  }}
                />
              );
            })}
          </div>

          {/* Additional expanding particles */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 150 + (i % 3) * 30;
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `calc(50% + ${Math.cos(angle) * distance}px)`,
                  top: `calc(50% + ${Math.sin(angle) * distance}px)`,
                  width: '4px',
                  height: '4px',
                  background: 'rgba(255,220,100,0.9)',
                  boxShadow: '0 0 12px rgba(255,220,100,0.8)',
                  transform: 'translate(-50%, -50%)',
                  animation: 'gentle-pulse 2s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* SEQUENCE 8 – Deep Calm / Shanti */}
      {seq === 8 && (
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Deep dark background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black" />

          {/* Soft vertical beam of light */}
          <div 
            className="absolute"
            style={{
              left: '25%',
              right: '25%',
              top: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(255,237,160,0.1) 0%, rgba(255,220,100,0.06) 50%, transparent 100%)',
            }}
          />

          {/* Slow falling light rain particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px"
              style={{
                left: `${20 + i * 12}%`,
                top: '-10%',
                height: '80px',
                background: 'linear-gradient(to bottom, rgba(255,237,160,0.5) 0%, rgba(255,220,100,0.3) 50%, transparent 100%)',
                boxShadow: '0 0 10px rgba(255,237,160,0.4)',
                animation: `light-rain-fall ${4 + i * 0.5}s linear infinite`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* SEQUENCE 9 – Exit & Gratitude */}
      {seq === 9 && (
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Dimmed warm background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-black opacity-95" />

          {/* Gentle radial light in center */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,220,100,0.25) 0%, rgba(255,237,160,0.15) 40%, transparent 100%)',
            }}
          />

          {/* Subtle circular outline */}
          <div 
            className="absolute w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full border"
            style={{
              borderColor: 'rgba(255,220,100,0.4)',
              boxShadow: '0 0 30px rgba(255,220,100,0.3)',
              opacity: 0.6,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DialogueSpecificAnimations;
