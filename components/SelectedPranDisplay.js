import { useEffect, useState, useRef } from 'react';
import Lottie from 'lottie-react';

const SelectedPranDisplay = ({ pranLabel, category }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [lottieData, setLottieData] = useState(null);
  const lottieRef = useRef(null);

  useEffect(() => {
    // Fade in when pran is selected
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [pranLabel]);

  // Ensure Lottie animation continues looping - manual loop control
  useEffect(() => {
    if (!lottieRef.current || !lottieData) return;

    const lottieInstance = lottieRef.current;
    
    // Ensure loop is enabled
    if (lottieInstance.setLoop) {
      lottieInstance.setLoop(true);
    }
    
    // Ensure animation is playing
    if (!lottieInstance.isPlaying) {
      lottieInstance.play();
    }
    
    // Manual loop handler - restart when animation completes (backup)
    const handleComplete = () => {
      if (lottieInstance) {
        // Immediately restart from the beginning
        setTimeout(() => {
          if (lottieInstance) {
            lottieInstance.goToAndPlay(0, true);
            if (lottieInstance.setLoop) {
              lottieInstance.setLoop(true);
            }
          }
        }, 10);
      }
    };

    // Monitor and ensure continuous playback
    const ensureLooping = () => {
      if (lottieInstance) {
        try {
          const currentFrame = lottieInstance.currentFrame || 0;
          const totalFrames = lottieInstance.totalFrames || 0;
          
          // If animation is paused or stopped, restart it
          if (lottieInstance.isPaused || !lottieInstance.isPlaying) {
            lottieInstance.play();
            if (lottieInstance.setLoop) {
              lottieInstance.setLoop(true);
            }
          }
          
          // Ensure loop is always enabled
          if (lottieInstance.setLoop) {
            lottieInstance.setLoop(true);
          }
        } catch (error) {
          console.error('Error ensuring loop:', error);
        }
      }
    };

    // Check frequently (every 100ms) to ensure animation keeps playing
    const interval = setInterval(ensureLooping, 100);

    // Also listen for animation events if available
    if (lottieInstance && typeof lottieInstance.addEventListener === 'function') {
      lottieInstance.addEventListener('complete', handleComplete);
    }

    return () => {
      clearInterval(interval);
      if (lottieInstance && typeof lottieInstance.removeEventListener === 'function') {
        lottieInstance.removeEventListener('complete', handleComplete);
      }
    };
  }, [lottieData]);

  // Load Lottie animation data
  useEffect(() => {
    const loadLottieAnimation = async () => {
      try {
        // LottieFiles share URL: https://app.lottiefiles.com/share/27964a58-fccf-40c2-bb7d-26745d1ef5d5
        // Animation ID from the share URL
        const animationId = '27964a58-fccf-40c2-bb7d-26745d1ef5d5';
        
        // Try multiple URL formats to load the animation JSON
        const urls = [
          `https://lottie.host/embed/${animationId}.json`,
          `https://assets5.lottiefiles.com/packages/lf20_${animationId}.json`,
          `https://assets1.lottiefiles.com/packages/lf20_${animationId}.json`,
          `https://assets2.lottiefiles.com/packages/lf20_${animationId}.json`,
          `https://assets3.lottiefiles.com/packages/lf20_${animationId}.json`,
          `https://assets4.lottiefiles.com/packages/lf20_${animationId}.json`,
          `https://lottie.host/${animationId}.json`,
        ];

        let loaded = false;
        for (const url of urls) {
          try {
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            });
            if (response.ok) {
              const data = await response.json();
              // Verify it's valid Lottie JSON (has v, fr, ip, op, etc.)
              if (data && data.v && data.fr !== undefined) {
                setLottieData(data);
                loaded = true;
                console.log('✓ Lottie animation loaded successfully from:', url);
                break;
              }
            }
          } catch (err) {
            // Try next URL
            continue;
          }
        }

        if (!loaded) {
          console.warn('Could not load Lottie animation from CDN. You may need to download the JSON file manually.');
        }
      } catch (error) {
        console.error('Error loading Lottie animation:', error);
      }
    };

    if (pranLabel) {
      loadLottieAnimation();
    }
  }, [pranLabel]);

  // Color schemes based on category
  const getCategoryColors = (cat) => {
    const colors = {
      NEGATIVE: {
        gradient: 'from-red-500 via-rose-600 to-red-700',
        glow: 'from-red-400/50 to-rose-500/50',
        softBg: 'bg-red-500/15',
        textGlow: 'text-red-300',
      },
      POSITIVE: {
        gradient: 'from-green-500 via-emerald-600 to-green-700',
        glow: 'from-green-400/50 to-emerald-500/50',
        softBg: 'bg-green-500/15',
        textGlow: 'text-green-300',
      },
      NEUTRAL: {
        gradient: 'from-amber-500 via-yellow-600 to-orange-700',
        glow: 'from-amber-400/50 to-yellow-500/50',
        softBg: 'bg-amber-500/15',
        textGlow: 'text-amber-300',
      },
    };
    return colors[cat] || colors.NEUTRAL;
  };

  const colors = getCategoryColors(category);

  if (!pranLabel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Colorful vibrant gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 via-rose-500 via-orange-500 to-yellow-500" style={{ zIndex: 0 }} />
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/60 via-blue-500/50 via-indigo-500/50 to-purple-500/60" style={{ zIndex: 0 }} />
      <div className="absolute inset-0 bg-gradient-to-bl from-emerald-500/40 via-teal-500/40 via-cyan-500/40 to-blue-500/40" style={{ zIndex: 0 }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-400/50 via-transparent to-transparent" style={{ zIndex: 0 }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-400/50 via-transparent to-transparent" style={{ zIndex: 0 }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-400/50 via-transparent to-transparent" style={{ zIndex: 0 }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-400/50 via-transparent to-transparent" style={{ zIndex: 0 }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" style={{ zIndex: 0 }} />
      
      {/* Animated colorful overlay for extra vibrancy */}
      <div className="absolute inset-0 opacity-30" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-400/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-400/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-yellow-400/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-400/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Lottie Animation - Full screen background decoration */}
      {lottieData && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: 1,
          }}
        >
          <Lottie
            lottieRef={(instance) => {
              lottieRef.current = instance;
              // Ensure it starts playing immediately with loop enabled
              if (instance) {
                // Enable native loop
                if (instance.setLoop) {
                  instance.setLoop(true);
                }
                // Start playing from the beginning
                instance.goToAndPlay(0, true);
                
                // Set up manual loop handler as backup
                const handleComplete = () => {
                  if (instance) {
                    // Immediately restart
                    instance.goToAndPlay(0, true);
                    if (instance.setLoop) {
                      instance.setLoop(true);
                    }
                  }
                };
                
                // Listen for completion
                if (instance.addEventListener) {
                  instance.addEventListener('complete', handleComplete);
                }
              }
            }}
            animationData={lottieData}
            loop={true}
            autoplay={true}
            onComplete={() => {
              // Backup restart when animation completes (shouldn't be needed with loop=true, but just in case)
              if (lottieRef.current) {
                lottieRef.current.goToAndPlay(0, true);
                if (lottieRef.current.setLoop) {
                  lottieRef.current.setLoop(true);
                }
              }
            }}
            style={{
              width: '100vw',
              height: '100vh',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        </div>
      )}

      {/* Background light bloom effect - continuous */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: isVisible ? 0.2 : 0,
          zIndex: 2,
          background: `radial-gradient(circle at center, 
            ${category === 'NEGATIVE' ? 'rgba(239, 68, 68, 0.15)' : category === 'POSITIVE' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)'} 0%, 
            ${category === 'NEGATIVE' ? 'rgba(185, 28, 28, 0.1)' : category === 'POSITIVE' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(217, 119, 6, 0.1)'} 30%, 
            transparent 70%)`,
        }}
      />

      {/* Main pran display card - centered */}
      <div 
        className={`relative transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{ 
          zIndex: 10,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Outer glow */}
        <div
          className={`pointer-events-none absolute -inset-[4px] rounded-3xl bg-gradient-to-r ${colors.glow} opacity-60 blur-2xl animate-pulse`}
        />

        {/* Soft background halo */}
        <div
          className={`pointer-events-none absolute -inset-2 rounded-3xl ${colors.softBg} opacity-80`}
        />

        {/* Main card */}
        <div
          className={`
            relative z-10 flex flex-col items-center justify-center
            overflow-hidden rounded-2xl border-2 border-white/20 
            bg-gradient-to-br ${colors.gradient}
            px-8 py-6 md:px-12 md:py-8 lg:px-16 lg:py-10
            shadow-[0_20px_60px_rgba(0,0,0,0.7)]
            backdrop-blur-md
            min-w-[300px] md:min-w-[400px] lg:min-w-[500px]
          `}
        >
          {/* Floating particles inside card */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-[-32px] left-[-24px] h-24 w-24 rounded-full bg-black/20 blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          </div>

          {/* Shimmer sweep - continuous */}
          <div 
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent" 
            style={{ animation: 'shimmer-sweep 3s ease-in-out infinite' }} 
          />

          {/* Ripple Animations - continuous */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            {[...Array(8)].map((_, i) => (
              <div
                key={`ripple-${i}`}
                className="absolute rounded-full bg-white/20 animate-pran-ripple"
                style={{
                  width: '0px',
                  height: '0px',
                  left: `${20 + (i % 3) * 30}%`,
                  top: `${20 + Math.floor(i / 3) * 30}%`,
                  animationDuration: `${2 + i * 0.2}s`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>

          {/* Pran Label Text */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <span 
              className={`
                font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl
                tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]
                text-center text-white
                ${colors.textGlow}
                animate-pulse-slow
              `}
              style={{
                textShadow: `
                  0 0 20px rgba(255, 255, 255, 0.5),
                  0 0 40px ${category === 'NEGATIVE' ? 'rgba(239, 68, 68, 0.6)' : category === 'POSITIVE' ? 'rgba(34, 197, 94, 0.6)' : 'rgba(245, 158, 11, 0.6)'},
                  0 0 60px ${category === 'NEGATIVE' ? 'rgba(239, 68, 68, 0.4)' : category === 'POSITIVE' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)'}
                `,
              }}
            >
              {pranLabel}
            </span>
          </div>

          {/* Inner glow orb */}
          <div 
            className="absolute top-1/2 left-1/2 rounded-full pointer-events-none animate-pran-glow-pulse"
            style={{
              width: '200px',
              height: '200px',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, 
                ${category === 'NEGATIVE' ? 'rgba(239, 68, 68, 0.3)' : category === 'POSITIVE' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'} 0%, 
                transparent 70%)`,
              boxShadow: `
                0 0 60px ${category === 'NEGATIVE' ? 'rgba(239, 68, 68, 0.4)' : category === 'POSITIVE' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)'},
                0 0 100px ${category === 'NEGATIVE' ? 'rgba(239, 68, 68, 0.3)' : category === 'POSITIVE' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}
              `,
            }}
          />
        </div>
      </div>

    </div>
  );
};

export default SelectedPranDisplay;

