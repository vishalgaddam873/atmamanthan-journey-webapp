import Link from 'next/link';
import { useSocket } from '../hooks/useSocket';
import { useAppSelector } from '../store/hooks';

export default function Home() {
  const { connected } = useSocket();
  const session = useAppSelector((state) => state.session.session);
  
  // Determine status based on connection and session
  const getStatus = () => {
    if (!connected) {
      return { text: 'Connecting...', color: 'text-yellow-400', dot: 'bg-yellow-400' };
    }
    if (session?.currentPhase && session.currentPhase !== 'INIT') {
      return { text: 'Active', color: 'text-green-400', dot: 'bg-green-400' };
    }
    return { text: 'Ready', color: 'text-blue-400', dot: 'bg-blue-400' };
  };

  const status = getStatus();

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ 
        background: 'linear-gradient(135deg, #6B3E2E 0%, #8B4E3A 25%, #6B3E2E 50%, #5A3428 75%, #6B3E2E 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 15s ease infinite',
      }}
    >
      <div className="text-center max-w-4xl w-full">
        {/* Title */}
        <h1 
          className="text-5xl md:text-7xl font-bold mb-4"
          style={{ color: 'rgba(255, 245, 230, 1)' }}
        >
          आत्ममंथन
        </h1>
        
        {/* English Title */}
        <h2 
          className="text-3xl md:text-4xl font-semibold mb-2"
          style={{ color: 'rgba(255, 245, 230, 0.9)' }}
        >
          AATMAMANTHAN
        </h2>
        
        {/* Separator Line */}
        <div 
          className="w-24 h-0.5 mx-auto mb-8"
          style={{ backgroundColor: 'rgba(255, 245, 230, 0.8)' }}
        />
        
        {/* Welcome Message */}
        <p 
          className="text-2xl md:text-3xl mb-6 font-medium"
          style={{ color: 'rgba(255, 245, 230, 1)' }}
        >
          अपने भीतर की यात्रा में आपका स्वागत है
        </p>
        
        {/* Description Paragraph */}
        <p 
          className="text-lg md:text-xl mb-12 leading-relaxed max-w-3xl mx-auto px-4"
          style={{ color: 'rgba(255, 245, 230, 0.95)' }}
        >
          यह एक अनुभव है जो आपको अपनी भावनाओं से मिलवाएगा, आपको अपने विचारों की गहराई में ले जाएगा, और आपको सकारात्मकता का मार्ग दिखाएगा।
        </p>
        
        {/* Navigation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
          <Link href="/table">
            <button
              className="group relative inline-flex items-center justify-center w-full px-8 py-5 text-xl font-semibold rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none"
              style={{
                backgroundColor: 'rgba(255, 190, 70, 1)',
                color: '#6B3E2E',
                boxShadow: '0 10px 30px rgba(255, 190, 70, 0.4), 0 0 20px rgba(255, 190, 70, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 190, 70, 0.6), 0 0 30px rgba(255, 190, 70, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 190, 70, 0.4), 0 0 20px rgba(255, 190, 70, 0.2)';
              }}
            >
              {/* Shine effect overlay */}
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
                }}
              />
              <span className="relative z-10">टेबल स्क्रीन</span>
            </button>
          </Link>
          
          <Link href="/mirror">
            <button
              className="group relative inline-flex items-center justify-center w-full px-8 py-5 text-xl font-semibold rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none"
              style={{
                backgroundColor: 'rgba(255, 190, 70, 1)',
                color: '#6B3E2E',
                boxShadow: '0 10px 30px rgba(255, 190, 70, 0.4), 0 0 20px rgba(255, 190, 70, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 190, 70, 0.6), 0 0 30px rgba(255, 190, 70, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 190, 70, 0.4), 0 0 20px rgba(255, 190, 70, 0.2)';
              }}
            >
              {/* Shine effect overlay */}
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
                }}
              />
              <span className="relative z-10">मिरर स्क्रीन</span>
            </button>
          </Link>
          
          <Link href="/admin/login">
            <button
              className="group relative inline-flex items-center justify-center w-full px-8 py-5 text-xl font-semibold rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none"
              style={{
                backgroundColor: 'rgba(255, 190, 70, 1)',
                color: '#6B3E2E',
                boxShadow: '0 10px 30px rgba(255, 190, 70, 0.4), 0 0 20px rgba(255, 190, 70, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 190, 70, 0.6), 0 0 30px rgba(255, 190, 70, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 190, 70, 0.4), 0 0 20px rgba(255, 190, 70, 0.2)';
              }}
            >
              {/* Shine effect overlay */}
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
                }}
              />
              <span className="relative z-10">एडमिन पैनल</span>
            </button>
          </Link>
        </div>
        
        {/* Status Indicator - Different Style */}
        <div className="mt-16 flex items-center justify-center gap-3">
          <div className={`w-3 h-3 rounded-full ${status.dot} animate-pulse`} />
          <span 
            className={`text-sm md:text-base font-medium ${status.color}`}
          >
            {status.text}
          </span>
          {session?.currentPhase && session.currentPhase !== 'INIT' && (
            <span 
              className="text-xs md:text-sm px-3 py-1 rounded-full"
              style={{ 
                backgroundColor: 'rgba(255, 245, 230, 0.2)',
                color: 'rgba(255, 245, 230, 0.9)'
              }}
            >
              {session.currentPhase.replace('_', ' ')}
            </span>
          )}
        </div>
        
        {/* Estimated Time */}
        <div 
          className="mt-8 text-sm md:text-base"
          style={{ color: 'rgba(255, 245, 230, 0.85)' }}
        >
          <p>अनुमानित समय: 5-7 मिनट | Estimated time: 5-7 minutes</p>
        </div>
      </div>
    </div>
  );
}
