import { useState, useEffect, useRef } from 'react';

const AudioPlayer = ({ audioFiles, onAudioEnd, autoPlay = false, hasPermission = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Check if permission is granted before attempting to play
    const permissionGranted = localStorage.getItem('audioPermissionGranted') === 'true';
    if (audioFiles && audioFiles.length > 0 && autoPlay && (hasPermission || permissionGranted)) {
      playAudio(0);
    }
  }, [audioFiles, autoPlay, hasPermission]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (currentIndex < audioFiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
        playAudio(currentIndex + 1);
      } else {
        setIsPlaying(false);
        if (onAudioEnd) {
          onAudioEnd();
        }
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, audioFiles, onAudioEnd]);

  const playAudio = async (index) => {
    if (index >= audioFiles.length) return;
    
    const audio = audioRef.current;
    if (audio) {
      try {
        // Ensure audio context is resumed (required for autoplay)
        if (window.AudioContext || window.webkitAudioContext) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          const audioContext = new AudioContext();
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
        }
        
        audio.src = audioFiles[index].url;
        await audio.play();
        setIsPlaying(true);
        setCurrentIndex(index);
      } catch (error) {
        console.error('Error playing audio:', error);
        // If autoplay fails, user interaction is required
        if (error.name === 'NotAllowedError') {
          console.warn('Autoplay was prevented. User interaction required.');
        }
      }
    }
  };

  const pauseAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const resumeAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((error) => console.error('Error resuming audio:', error));
    }
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setCurrentIndex(0);
    }
  };

  if (!audioFiles || audioFiles.length === 0) {
    return null;
  }

  return (
    <div>
      <audio ref={audioRef} preload="auto" />
      <div style={{ display: 'none' }}>
        {/* Hidden controls for programmatic control */}
      </div>
    </div>
  );
};

export default AudioPlayer;

