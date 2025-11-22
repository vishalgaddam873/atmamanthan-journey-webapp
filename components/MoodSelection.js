import { useState } from 'react';
import getCdnUrl from '../lib/cdnUtils';

const MoodSelection = ({ socket, onMoodSelected }) => {
  const [selected, setSelected] = useState(null);

  const emotionColors = {
    ANXIETY: {
      gradient: 'from-emerald-500 via-green-600 to-teal-700',
      glow: 'from-emerald-400/50 to-teal-500/50',
      softBg: 'bg-emerald-500/15',
    },
    ANGRY: {
      gradient: 'from-red-500 via-rose-600 to-red-700',
      glow: 'from-red-400/50 to-rose-500/50',
      softBg: 'bg-red-500/15',
    },
    SAD: {
      gradient: 'from-blue-500 via-indigo-600 to-blue-700',
      glow: 'from-blue-400/50 to-indigo-500/50',
      softBg: 'bg-blue-500/15',
    },
    CONFUSED: {
      gradient: 'from-amber-500 via-yellow-600 to-orange-700',
      glow: 'from-amber-400/50 to-yellow-500/50',
      softBg: 'bg-amber-500/15',
    },
    LOVE: {
      gradient: 'from-pink-500 via-rose-600 to-fuchsia-700',
      glow: 'from-pink-400/50 to-rose-500/50',
      softBg: 'bg-pink-500/15',
    },
    HAPPY: {
      gradient: 'from-orange-400 via-amber-500 to-yellow-600',
      glow: 'from-orange-300/50 to-amber-400/50',
      softBg: 'bg-orange-400/15',
    },
  };

  const emotionLabels = {
    ANXIETY: { hi: 'चिंता', en: 'Anxiety' },
    ANGRY: { hi: 'गुस्सा', en: 'Anger' },
    SAD: { hi: 'उदासी', en: 'Sadness' },
    CONFUSED: { hi: 'उलझन', en: 'Confusion' },
    LOVE: { hi: 'प्यार', en: 'Love' },
    HAPPY: { hi: 'खुशी', en: 'Happiness' },
  };

  const emotionImages = {
    ANXIETY: getCdnUrl('/assets/Emotions/Anxiety.png'),
    ANGRY: getCdnUrl('/assets/Emotions/Anger.png'),
    SAD: getCdnUrl('/assets/Emotions/Sad.png'),
    CONFUSED: getCdnUrl('/assets/Emotions/Confused.png'),
    LOVE: getCdnUrl('/assets/Emotions/Love.png'),
    HAPPY: getCdnUrl('/assets/Emotions/Happy.png'),
  };

  const moods = [
    { id: 'ANXIETY', key: 'ANXIETY' },
    { id: 'SAD', key: 'SAD' },
    { id: 'ANGRY', key: 'ANGRY' },
    { id: 'HAPPY', key: 'HAPPY' },
    { id: 'LOVE', key: 'LOVE' },
    { id: 'CONFUSED', key: 'CONFUSED' },
  ];

  const handleSelect = (moodId) => {
    if (selected) return; // Prevent multiple selections
    
    setSelected(moodId);
    socket?.emit('mood_selected', { mood: moodId });
    onMoodSelected?.(moodId);
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-screen overflow-hidden p-2 sm:p-3 md:p-4 lg:p-6">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 via-indigo-900/40 via-pink-900/35 to-rose-900/30" />
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/10 via-blue-900/15 to-amber-900/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
      
      {/* Heading */}
      <div className="relative z-10 w-full max-w-7xl px-2 sm:px-4 md:px-6 flex-shrink-0 mb-1 sm:mb-2 md:mb-3">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white text-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-tight">
          Choose the Emotion
        </h1>
      </div>
      
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 w-full max-w-7xl h-full items-center justify-items-center px-2 sm:px-3 md:px-4 lg:px-6 flex-1 min-h-0">
        {moods.map((mood) => {
          const colors = emotionColors[mood.key] || {
            gradient: 'from-purple-500 via-purple-600 to-purple-700',
            glow: 'from-purple-400/50 to-purple-500/50',
            softBg: 'bg-purple-500/15',
          };
          
          const labels = emotionLabels[mood.key] || {
            hi: mood.id,
            en: mood.id,
          };
          
          const imageSrc = emotionImages[mood.key];
          const isSelected = selected === mood.id;
          const isDisabled = selected !== null && selected !== mood.id;

          return (
            <div key={mood.id} className="relative group w-full h-full max-h-full">
              {/* Outer glow */}
              <div
                className={`pointer-events-none absolute -inset-[2px] sm:-inset-[2px] md:-inset-[3px] rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-r ${colors.glow} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 ${isSelected ? 'opacity-100' : ''}`}
              />

              {/* Soft background halo */}
              <div
                className={`pointer-events-none absolute -inset-1 sm:-inset-1 md:-inset-1.5 rounded-lg sm:rounded-xl md:rounded-2xl ${colors.softBg} opacity-60 group-hover:opacity-80 transition-opacity ${isSelected ? 'opacity-100' : ''}`}
              />

              <button
                type="button"
                onClick={() => handleSelect(mood.id)}
                disabled={isDisabled}
                className={`
                  relative z-10 flex w-full h-full flex-col items-center justify-center
                  overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl border border-white/15 
                  bg-gradient-to-br ${colors.gradient}
                  px-1.5 py-2 sm:px-2 sm:py-2.5 md:px-3 md:py-3 lg:px-4 lg:py-4
                  text-white shadow-[0_8px_20px_rgba(0,0,0,0.5)] sm:shadow-[0_12px_30px_rgba(0,0,0,0.55)]
                  backdrop-blur-md
                  transition-all duration-300 ease-out
                  min-h-0 max-h-full
                  ${isSelected 
                    ? 'ring-2 sm:ring-3 md:ring-4 ring-white scale-105 shadow-[0_0_30px_rgba(255,255,255,0.4)] sm:shadow-[0_0_40px_rgba(255,255,255,0.5)]' 
                    : isDisabled
                    ? 'opacity-30 cursor-not-allowed'
                    : 'group-hover:-translate-y-0.5 group-hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]'
                  }
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black
                `}
              >
                {/* Floating particles */}
                <div className="pointer-events-none absolute inset-0 opacity-60">
                  <div className="absolute -top-4 -right-6 h-16 w-16 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute bottom-[-24px] left-[-16px] h-16 w-16 rounded-full bg-black/20 blur-3xl" />
                </div>

                {/* Shimmer sweep */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                {/* Ripple Animations */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                  <div className="absolute top-1/4 left-1/4 w-0 h-0 rounded-full bg-white/30 animate-ripple-1" />
                  <div className="absolute top-1/3 right-1/4 w-0 h-0 rounded-full bg-white/25 animate-ripple-2" />
                  <div className="absolute bottom-1/4 left-1/3 w-0 h-0 rounded-full bg-white/20 animate-ripple-3" />
                  <div className="absolute bottom-1/3 right-1/3 w-0 h-0 rounded-full bg-white/25 animate-ripple-4" />
                  <div className="absolute top-1/2 left-1/2 w-0 h-0 rounded-full bg-white/15 animate-ripple-5" />
                  <div className="absolute top-1/5 left-1/2 w-0 h-0 rounded-full bg-white/20 animate-ripple-6" />
                  <div className="absolute bottom-1/5 left-1/2 w-0 h-0 rounded-full bg-white/18 animate-ripple-7" />
                  <div className="absolute top-1/2 left-1/5 w-0 h-0 rounded-full bg-white/22 animate-ripple-8" />
                  <div className="absolute top-1/2 right-1/5 w-0 h-0 rounded-full bg-white/20 animate-ripple-9" />
                  <div className="absolute top-0 left-0 w-0 h-0 rounded-full bg-white/18 animate-ripple-10" />
                  <div className="absolute top-0 right-0 w-0 h-0 rounded-full bg-white/18 animate-ripple-11" />
                  <div className="absolute bottom-0 left-0 w-0 h-0 rounded-full bg-white/18 animate-ripple-12" />
                  <div className="absolute bottom-0 right-0 w-0 h-0 rounded-full bg-white/18 animate-ripple-13" />
                  <div className="absolute top-1/6 left-1/6 w-0 h-0 rounded-full bg-white/20 animate-ripple-14" />
                  <div className="absolute top-1/6 right-1/6 w-0 h-0 rounded-full bg-white/20 animate-ripple-15" />
                  <div className="absolute bottom-1/6 left-1/6 w-0 h-0 rounded-full bg-white/20 animate-ripple-16" />
                  <div className="absolute bottom-1/6 right-1/6 w-0 h-0 rounded-full bg-white/20 animate-ripple-17" />
                  <div className="absolute top-1/8 left-1/2 w-0 h-0 rounded-full bg-white/16 animate-ripple-18" />
                  <div className="absolute bottom-1/8 left-1/2 w-0 h-0 rounded-full bg-white/16 animate-ripple-19" />
                </div>

                {/* Main content */}
                <div className="relative z-10 flex flex-1 flex-col items-center justify-center space-y-0.5 sm:space-y-1 md:space-y-1.5 w-full h-full py-0.5 sm:py-1 min-h-0">
                  {/* Emotion Image */}
                  {imageSrc && (
                    <div
                      className={`
                        relative flex items-center justify-center flex-shrink-0
                        w-[50%] h-[50%] sm:w-[55%] sm:h-[55%] md:w-[60%] md:h-[60%] lg:w-[65%] lg:h-[65%]
                        max-w-[100px] max-h-[100px] sm:max-w-[130px] sm:max-h-[130px] md:max-w-[160px] md:max-h-[160px] lg:max-w-[200px] lg:max-h-[200px] xl:max-w-[240px] xl:max-h-[240px]
                        rounded-lg sm:rounded-xl bg-black/20 backdrop-blur-sm
                        shadow-inner shadow-black/40
                        transition-transform duration-300 ease-out
                        ${isSelected 
                          ? 'scale-110 -translate-y-0.5 rotate-3' 
                          : 'group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:rotate-3'
                        }
                        overflow-hidden
                      `}
                    >
                      <img
                        src={imageSrc}
                        alt={labels.en}
                        className="w-full h-full object-contain p-1 sm:p-1.5 md:p-2 lg:p-2.5"
                        style={{
                          imageRendering: 'high-quality',
                          WebkitImageRendering: 'high-quality',
                          backfaceVisibility: 'hidden',
                          transform: 'translateZ(0)',
                        }}
                        loading="eager"
                        decoding="async"
                        onError={(e) => {
                          console.error('Image load error:', imageSrc);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Hindi + English labels */}
                  <div className="flex flex-col items-center gap-0 sm:gap-0.5 md:gap-1 flex-shrink-0 w-full px-1">
                    <span className="font-semibold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] text-center break-words leading-tight" style={{ fontSize: '2rem' }}>
                      {labels.hi}
                    </span>
                    <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl uppercase tracking-[0.15em] text-white/90 font-medium leading-tight">
                      {labels.en}
                    </span>
                  </div>
                </div>

                {/* Click ripple */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-white/0 transition-colors duration-200 active:bg-white/20" />
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoodSelection;
