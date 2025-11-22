// Audio Permissions Utility
// Unlocks audio autoplay on first user interaction to prevent deployment issues

class AudioPermissionManager {
  constructor() {
    this.unlocked = false;
    this.audioContext = null;
    this.dummyAudio = null;
    this.listeners = [];
    
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  init() {
    // Check if already unlocked (stored in sessionStorage)
    const wasUnlocked = sessionStorage.getItem('audio_unlocked') === 'true';
    
    if (wasUnlocked) {
      this.unlocked = true;
      // Don't auto-unlock, wait for explicit user permission
      // this.unlockAudio();
    }
    // Removed auto-unlock on any interaction - now requires explicit permission
    // Users must click the permission prompt button
  }

  unlockAudio() {
    if (this.unlocked) return;
    
    try {
      // Method 1: Create and play a silent audio element
      // This unlocks HTML5 audio autoplay
      if (!this.dummyAudio) {
        this.dummyAudio = new Audio();
        // Create a silent 1ms audio data URL
        this.dummyAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
        this.dummyAudio.volume = 0;
        this.dummyAudio.preload = 'auto';
      }

      // Play and immediately pause to unlock
      const playPromise = this.dummyAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.dummyAudio.pause();
            this.dummyAudio.currentTime = 0;
            console.log('Audio permissions unlocked via HTML5 audio');
          })
          .catch(err => {
            console.warn('Could not unlock audio via HTML5:', err);
          });
      }

      // Method 2: Create and resume AudioContext (for Web Audio API)
      // This is useful if you use Web Audio API later
      if (!this.audioContext && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContextClass();
        
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().then(() => {
            console.log('Audio permissions unlocked via Web Audio API');
          }).catch(err => {
            console.warn('Could not unlock Web Audio API:', err);
          });
        }
      }

      this.unlocked = true;
      sessionStorage.setItem('audio_unlocked', 'true');
      
      // Notify listeners
      this.notifyListeners(true);
      
    } catch (error) {
      console.error('Error unlocking audio permissions:', error);
    }
  }

  // Force unlock (useful for programmatic unlock)
  forceUnlock() {
    this.unlockAudio();
  }

  // Check if audio is unlocked
  isUnlocked() {
    return this.unlocked;
  }

  // Subscribe to unlock events
  onUnlock(callback) {
    this.listeners.push(callback);
    if (this.unlocked) {
      callback(true);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners(unlocked) {
    this.listeners.forEach(callback => {
      try {
        callback(unlocked);
      } catch (error) {
        console.error('Error in unlock listener:', error);
      }
    });
  }

  // Get AudioContext if available
  getAudioContext() {
    if (!this.audioContext && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
    }
    return this.audioContext;
  }

  // Cleanup
  cleanup() {
    if (this.dummyAudio) {
      this.dummyAudio.pause();
      this.dummyAudio = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(console.error);
      this.audioContext = null;
    }
    this.listeners = [];
  }
}

// Singleton instance
let permissionManagerInstance = null;

export const getAudioPermissionManager = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return {
      unlockAudio: () => {},
      forceUnlock: () => {},
      isUnlocked: () => false,
      onUnlock: () => () => {},
      getAudioContext: () => null,
    };
  }
  
  if (!permissionManagerInstance) {
    permissionManagerInstance = new AudioPermissionManager();
  }
  return permissionManagerInstance;
};

export default getAudioPermissionManager;

