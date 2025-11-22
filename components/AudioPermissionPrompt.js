import { useState, useEffect } from 'react';
import getAudioPermissionManager from '../lib/audioPermissions';

const AudioPermissionPrompt = ({ onPermissionGranted }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const permissionManager = getAudioPermissionManager();

  useEffect(() => {
    // Always show prompt on mount to ensure fresh user interaction
    console.log('🔊 AudioPermissionPrompt: Will show prompt after delay');
    const timer = setTimeout(() => {
      console.log('🔊 AudioPermissionPrompt: Setting showPrompt to true');
      setShowPrompt(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Listen for unlock events
  useEffect(() => {
    const unsubscribe = permissionManager.onUnlock((unlocked) => {
      if (unlocked) {
        setShowPrompt(false);
        // Call onPermissionGranted synchronously
        onPermissionGranted?.();
      }
    });
    
    return unsubscribe;
  }, [permissionManager, onPermissionGranted]);

  /**
   * CRITICAL: This handler MUST be synchronous
   * NO async/await, NO promises, NO timeouts
   * Everything must happen in the same call stack as the click event
   */
  const handleAllowAudio = (event) => {
    // Prevent any default behavior
    event.preventDefault();
    event.stopPropagation();
    
    try {
      // Step 1: Create silent audio element SYNCHRONOUSLY
      const dummyAudio = new Audio();
      dummyAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      dummyAudio.volume = 0;
      
      // Step 2: Play synchronously - don't await, don't chain
      // The browser captures the user gesture NOW
      const playPromise = dummyAudio.play();
      if (playPromise !== undefined) {
        // Fire and forget - gesture is already captured
        playPromise.then(() => {
          dummyAudio.pause();
          dummyAudio.currentTime = 0;
        }).catch(() => {
          // Silent catch
        });
      }

      // Step 3: Create and resume AudioContext SYNCHRONOUSLY
      if (window.AudioContext || window.webkitAudioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextClass();
        
        if (audioContext.state === 'suspended') {
          // Resume synchronously - don't await
          const resumePromise = audioContext.resume();
          // Fire and forget - gesture is already captured
          resumePromise.then(() => {
            console.log('✅ AudioContext resumed');
          }).catch(() => {
            // Silent catch
          });
        }
      }

      // Step 4: Unlock via permission manager SYNCHRONOUSLY
      // This will mark as unlocked and notify listeners
      permissionManager.forceUnlock();
      
      // Step 5: Hide prompt and notify parent SYNCHRONOUSLY
      setShowPrompt(false);
      onPermissionGranted?.();
      
      console.log('✅ Audio permission granted synchronously');
      
    } catch (error) {
      console.error('❌ Error in handleAllowAudio:', error);
      // Still unlock and notify
      permissionManager.forceUnlock();
      setShowPrompt(false);
      onPermissionGranted?.();
    }
  };

  if (!showPrompt) {
    return null;
  }

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
