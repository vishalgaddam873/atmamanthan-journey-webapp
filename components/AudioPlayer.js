import { useEffect, useRef, useState } from 'react';
import getAudioCoordinator from '../lib/audioCoordinator';

const AudioPlayer = ({ audioPath, onEnded, autoPlay = true, forcePlay = false }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const coordinator = getAudioCoordinator();

  // Check if this tab should play audio
  useEffect(() => {
    const checkCanPlay = () => {
      const shouldPlay = forcePlay || coordinator.shouldPlayAudio();
      setCanPlay(shouldPlay);
      if (!shouldPlay) {
        console.log('AudioPlayer: This tab is not the audio master, audio will not play');
      } else {
        console.log('AudioPlayer: This tab is the audio master, audio will play');
      }
    };
    
    checkCanPlay();
    const unsubscribe = coordinator.onMasterChange(checkCanPlay);
    
    return unsubscribe;
  }, [forcePlay, coordinator]);

  // Update audio source when audioPath changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioPath) return;

    // Construct full URL if path doesn't start with http
    // Encode the path properly for URLs (handles spaces)
    const encodedPath = audioPath.startsWith('http') 
      ? audioPath 
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${encodeURI(audioPath)}`;

    console.log('Loading audio:', encodedPath);
    audio.src = encodedPath;
    audio.load(); // Reload the audio element with new source
    
    if (autoPlay && canPlay) {
      // Auto-play when new audio is set, but only if this tab can play
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error('Error playing audio:', err);
          // Some browsers require user interaction before autoplay
          console.log('Note: Autoplay blocked. User interaction required.');
        });
      }
    } else if (!canPlay) {
      // Pause audio if this tab is not the master
      audio.pause();
    }
  }, [audioPath, autoPlay, canPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleError = (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onEnded]);

  // Handle socket audio control events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlayEvent = () => {
      // Only play if this tab is the audio master
      if (canPlay || forcePlay) {
        audio.play().catch(err => console.error('Play error:', err));
      } else {
        console.log('AudioPlayer: Ignoring play event - not audio master');
      }
    };

    const handlePauseEvent = () => {
      audio.pause();
    };

    const handleStopEvent = () => {
      audio.pause();
      audio.currentTime = 0;
    };

    // Listen to custom events for socket control
    window.addEventListener('audio:play', handlePlayEvent);
    window.addEventListener('audio:pause', handlePauseEvent);
    window.addEventListener('audio:stop', handleStopEvent);

    return () => {
      window.removeEventListener('audio:play', handlePlayEvent);
      window.removeEventListener('audio:pause', handlePauseEvent);
      window.removeEventListener('audio:stop', handleStopEvent);
    };
  }, [canPlay, forcePlay]);

  return (
    <audio
      ref={audioRef}
      preload="auto"
      style={{ display: 'none' }}
      crossOrigin="anonymous"
    />
  );
};

export default AudioPlayer;

