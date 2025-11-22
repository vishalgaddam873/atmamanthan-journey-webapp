import { useState, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setShowCelebration } from '../store/slices/uiSlice';
import api from '../lib/api';

const PranSelection = ({ socket, category, onPranSelected }) => {
  const dispatch = useAppDispatch();
  const [prans, setPrans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) {
      console.log('PranSelection: No category provided');
      setLoading(false);
      return;
    }

    console.log('PranSelection: Fetching prans for category:', category);
    const fetchPrans = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/pran?category=${category}`);
        console.log('PranSelection: Received prans:', response.data);
        const sortedPrans = response.data.sort((a, b) => a.sequence - b.sequence);
        setPrans(sortedPrans);
      } catch (error) {
        console.error('Error fetching prans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrans();
  }, [category]);

  const handleSelect = (pranId) => {
    if (selected) return; // Prevent multiple selections
    
    setSelected(pranId);
    socket?.emit('pran_selected', { pranId });
    onPranSelected?.(pranId);
    
    // Trigger celebration animation
    dispatch(setShowCelebration(true));
  };

  // Color schemes based on category
  const getCategoryColors = (cat) => {
    const colors = {
      NEGATIVE: {
        gradient: 'from-red-500 via-rose-600 to-red-700',
        glow: 'from-red-400/50 to-rose-500/50',
        softBg: 'bg-red-500/15',
      },
      POSITIVE: {
        gradient: 'from-green-500 via-emerald-600 to-green-700',
        glow: 'from-green-400/50 to-emerald-500/50',
        softBg: 'bg-green-500/15',
      },
      NEUTRAL: {
        gradient: 'from-amber-500 via-yellow-600 to-orange-700',
        glow: 'from-amber-400/50 to-yellow-500/50',
        softBg: 'bg-amber-500/15',
      },
    };
    return colors[cat] || colors.NEUTRAL;
  };

  // Generate colors for each pran (variations)
  const getPranColors = (index, category) => {
    const baseColors = getCategoryColors(category);
    const variations = [
      { gradient: baseColors.gradient, glow: baseColors.glow, softBg: baseColors.softBg },
      { gradient: baseColors.gradient.replace('500', '600').replace('600', '700'), glow: baseColors.glow, softBg: baseColors.softBg },
      { gradient: baseColors.gradient.replace('600', '500').replace('700', '600'), glow: baseColors.glow, softBg: baseColors.softBg },
      { gradient: baseColors.gradient.replace('500', '400').replace('600', '500'), glow: baseColors.glow, softBg: baseColors.softBg },
    ];
    return variations[index % variations.length];
  };

  if (loading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
        {/* Colorful background matching main screen */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 via-rose-500 via-orange-500 to-yellow-500" />
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/60 via-blue-500/50 via-indigo-500/50 to-purple-500/60" />
        <div className="relative z-10 text-white text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (prans.length === 0) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
        {/* Colorful background matching main screen */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 via-rose-500 via-orange-500 to-yellow-500" />
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/60 via-blue-500/50 via-indigo-500/50 to-purple-500/60" />
        <div className="relative z-10 text-white text-2xl font-semibold">No prans available</div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-screen overflow-hidden p-6 md:p-8 lg:p-10 xl:p-12">
      {/* Colorful vibrant gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 via-rose-500 via-orange-500 to-yellow-500" />
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/60 via-blue-500/50 via-indigo-500/50 to-purple-500/60" />
      <div className="absolute inset-0 bg-gradient-to-bl from-emerald-500/40 via-teal-500/40 via-cyan-500/40 to-blue-500/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-400/50 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-400/50 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-400/50 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-400/50 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
      
      {/* Animated colorful overlay for extra vibrancy */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-400/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-400/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-yellow-400/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-400/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      
      <div className="relative z-10 flex flex-col gap-3 md:gap-4 lg:gap-5 w-full max-w-2xl h-full items-center justify-center px-4 md:px-6 lg:px-8">
        {prans.map((pran, index) => {
          const colors = getPranColors(index, category);
          const isSelected = selected === pran.id;
          const isDisabled = selected !== null && selected !== pran.id;

          return (
            <div key={pran.id} className="relative group w-full h-auto min-h-[80px] md:min-h-[100px] lg:min-h-[120px]">
              {/* Outer glow */}
              <div
                className={`pointer-events-none absolute -inset-[3px] rounded-2xl bg-gradient-to-r ${colors.glow} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 ${isSelected ? 'opacity-100' : ''}`}
              />

              {/* Soft background halo */}
              <div
                className={`pointer-events-none absolute -inset-1.5 rounded-2xl ${colors.softBg} opacity-60 group-hover:opacity-80 transition-opacity ${isSelected ? 'opacity-100' : ''}`}
              />

              <button
                type="button"
                onClick={() => handleSelect(pran.id)}
                disabled={isDisabled}
                className={`
                  relative z-10 flex w-full h-full flex-col items-center justify-center
                  overflow-hidden rounded-xl md:rounded-2xl border border-white/15 
                  bg-gradient-to-br ${colors.gradient}
                  px-2 py-2.5 md:px-3 md:py-3 lg:px-4 lg:py-4
                  text-white shadow-[0_12px_30px_rgba(0,0,0,0.55)]
                  backdrop-blur-md
                  transition-all duration-300 ease-out
                  ${isSelected 
                    ? 'ring-4 ring-white scale-105 shadow-[0_0_40px_rgba(255,255,255,0.5)]' 
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
                <div className="relative z-10 flex flex-1 flex-col items-center justify-center h-full py-3 md:py-4 lg:py-5">
                  {/* Pran Label */}
                  <div className="flex flex-col items-center justify-center gap-0 flex-shrink-0">
                    <span className="font-semibold text-base md:text-lg lg:text-xl xl:text-2xl tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)] text-center px-4">
                      {pran.label}
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

export default PranSelection;
