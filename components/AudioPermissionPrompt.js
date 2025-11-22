import { useState, useEffect } from 'react';
import getAudioPermissionManager from '../lib/audioPermissions';

const AudioPermissionPrompt = ({ onPermissionGranted }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const permissionManager = getAudioPermissionManager();

  useEffect(() => {
    // Check if audio is already unlocked
    const isUnlocked = permissionManager.isUnlocked();
    
    if (!isUnlocked) {
      // Show prompt after a short delay to ensure page is loaded
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      // Already unlocked, notify parent
      onPermissionGranted?.();
    }
  }, [permissionManager, onPermissionGranted]);

  // Listen for unlock events
  useEffect(() => {
    const unsubscribe = permissionManager.onUnlock((unlocked) => {
      if (unlocked) {
        setShowPrompt(false);
        onPermissionGranted?.();
      }
    });
    
    return unsubscribe;
  }, [permissionManager, onPermissionGranted]);

  const handleAllowAudio = async () => {
    try {
      // Unlock audio permissions
      permissionManager.forceUnlock();
      
      // Small delay to ensure unlock is processed
      setTimeout(() => {
        setShowPrompt(false);
        onPermissionGranted?.();
      }, 100);
    } catch (error) {
      console.error('Error granting audio permission:', error);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl p-8 max-w-md mx-4 border border-indigo-500/50 shadow-2xl">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.343 6.343L4.93 4.93M19.07 19.07l-1.414-1.414M8.464 8.464L6.343 6.343m9.193 9.193l-2.121-2.121M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-3">
            Audio Permission Required
          </h2>

          {/* Description */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            To provide you with the best immersive experience, we need permission to play audio.
            <br />
            <span className="text-sm text-gray-400 mt-2 block">
              Click "Allow Audio" to continue.
            </span>
          </p>

          {/* Button */}
          <button
            onClick={handleAllowAudio}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            Allow Audio
          </button>

          {/* Note */}
          <p className="text-xs text-gray-500 mt-4">
            Your browser requires user interaction to play audio
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioPermissionPrompt;

