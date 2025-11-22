import { useState, useEffect } from 'react';
import './MirrorScreen.css';

const AudioPermissionModal = ({ onPermissionGranted }) => {
  const [showModal, setShowModal] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if permission was already granted
    const permissionGranted = localStorage.getItem('audioPermissionGranted');
    if (permissionGranted === 'true') {
      setShowModal(false);
      if (onPermissionGranted) {
        onPermissionGranted();
      }
    }
  }, [onPermissionGranted]);

  const handleAllow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      console.log('User clicked Allow Audio - requesting permission...');
      
      // Create and play a silent audio to unlock autoplay policy
      // This must happen synchronously during the user click event
      const unlockAudio = () => {
        try {
          // Create a very short silent audio
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(1, audioContext.currentTime);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.001);
          
          // Resume context if suspended
          if (audioContext.state === 'suspended') {
            audioContext.resume();
          }
          
          console.log('Audio context unlocked');
        } catch (err) {
          console.log('Audio context unlock attempt:', err);
        }
      };
      
      // Unlock audio immediately
      unlockAudio();
      
      // Also try with HTML5 audio element
      try {
        const testAudio = new Audio();
        testAudio.volume = 0;
        testAudio.muted = true;
        const playPromise = testAudio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              testAudio.pause();
              console.log('HTML5 audio unlocked');
            })
            .catch(() => {
              console.log('HTML5 audio unlock failed (may need actual audio file)');
            });
        }
      } catch (err) {
        console.log('HTML5 audio test error:', err);
      }
      
      // Store permission in localStorage
      localStorage.setItem('audioPermissionGranted', 'true');
      console.log('Permission saved to localStorage');
      
      // Close modal immediately
      setShowModal(false);
      
      // Notify parent component immediately
      if (onPermissionGranted) {
        console.log('Calling onPermissionGranted callback');
        onPermissionGranted();
      }
      
    } catch (error) {
      console.error('Error in handleAllow:', error);
      // Still proceed - user clicked allow
      localStorage.setItem('audioPermissionGranted', 'true');
      setShowModal(false);
      if (onPermissionGranted) {
        onPermissionGranted();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = () => {
    setShowModal(false);
    alert('Audio permission is required for the experience. Please refresh and allow audio.');
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="permission-modal-overlay">
      <div className="permission-modal">
        <div className="permission-modal-content">
          <h2>Audio Permission Required</h2>
          <p>
            This experience requires audio playback. Please allow audio permissions to continue.
          </p>
          <div className="permission-modal-buttons">
            <button 
              className="btn-allow" 
              onClick={handleAllow}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Allow Audio'}
            </button>
            <button 
              className="btn-deny" 
              onClick={handleDeny}
              disabled={isProcessing}
            >
              Deny
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPermissionModal;

