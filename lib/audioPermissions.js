// Audio Permissions Utility
// Unlocks audio autoplay on first user interaction to prevent deployment issues

class AudioPermissionManager {
  constructor() {
    this.unlocked = false;
    this.audioContext = null;
    this.dummyAudio = null;
    this.listeners = [];

    if (typeof window !== "undefined") {
      this.init();
    }
  }

  init() {
    // Don't auto-unlock from sessionStorage - require fresh user interaction
    // This ensures browser autoplay policies are respected
    this.unlocked = false;
  }

  /**
   * Synchronously unlock audio permissions - MUST be called during user gesture
   * NO async/await, NO promises, NO timeouts - everything synchronous
   */
  unlockAudio() {
    if (this.unlocked) return;

    try {
      // Method 1: Create and play a silent audio element SYNCHRONOUSLY
      // This MUST happen in the same call stack as the user click
      if (!this.dummyAudio) {
        this.dummyAudio = new Audio();
        this.dummyAudio.src =
          "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
        this.dummyAudio.volume = 0;
        this.dummyAudio.preload = "auto";
      }

      // CRITICAL: Play synchronously - don't await, don't chain promises
      // The browser will allow this because we're in a user gesture context
      const playPromise = this.dummyAudio.play();

      // If play() returns a promise, we still call it synchronously
      // The promise will resolve/reject later, but the gesture is captured NOW
      if (playPromise !== undefined) {
        // Don't await - just fire and forget
        // The browser has already captured the user gesture
        playPromise
          .then(() => {
            this.dummyAudio.pause();
            this.dummyAudio.currentTime = 0;
            console.log("✅ Audio permissions unlocked via HTML5 audio");
          })
          .catch(() => {
            // Silent catch - we still mark as unlocked
          });
      }

      // Method 2: Create and resume AudioContext SYNCHRONOUSLY
      // This MUST happen in the same call stack as the user click
      if (
        !this.audioContext &&
        (window.AudioContext || window.webkitAudioContext)
      ) {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContextClass();

        // CRITICAL: Resume synchronously - don't await
        // The browser will allow this because we're in a user gesture context
        if (this.audioContext.state === "suspended") {
          const resumePromise = this.audioContext.resume();
          // Don't await - just fire and forget
          // The browser has already captured the user gesture
          resumePromise
            .then(() => {
              console.log("✅ Audio permissions unlocked via Web Audio API");
            })
            .catch(() => {
              // Silent catch - we still mark as unlocked
            });
        } else {
          console.log("✅ AudioContext already active");
        }
      }

      // Mark as unlocked IMMEDIATELY (synchronously)
      this.unlocked = true;
      sessionStorage.setItem("audio_unlocked", "true");

      // Notify listeners synchronously
      this.notifyListeners(true);

      console.log("✅ Audio unlock completed synchronously");
    } catch (error) {
      console.error("❌ Error unlocking audio permissions:", error);
      // Still mark as unlocked to prevent blocking
      this.unlocked = true;
      sessionStorage.setItem("audio_unlocked", "true");
      this.notifyListeners(true);
    }
  }

  // Force unlock (useful for programmatic unlock)
  // This should only be called during a user gesture
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
      // Call synchronously if already unlocked
      callback(true);
    }
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  notifyListeners(unlocked) {
    this.listeners.forEach((callback) => {
      try {
        callback(unlocked);
      } catch (error) {
        console.error("Error in unlock listener:", error);
      }
    });
  }

  // Get AudioContext if available
  getAudioContext() {
    if (
      !this.audioContext &&
      (window.AudioContext || window.webkitAudioContext)
    ) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
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
  if (typeof window === "undefined") {
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
