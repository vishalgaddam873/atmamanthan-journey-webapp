import { useEffect, useRef, useState } from 'react';
import getAudioCoordinator from '../lib/audioCoordinator';
import getAudioPermissionManager from '../lib/audioPermissions';
import getCdnUrl from '../lib/cdnUtils';

const AudioPlayer = ({ audioPath, onEnded, autoPlay = true, forcePlay = false }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const coordinator = getAudioCoordinator();
  const permissionManager = getAudioPermissionManager();

  // Check audio permissions
  useEffect(() => {
    setAudioUnlocked(permissionManager.isUnlocked());
    
    const unsubscribe = permissionManager.onUnlock((unlocked) => {
      setAudioUnlocked(unlocked);
      if (unlocked) {
        console.log('AudioPlayer: Audio permissions unlocked');
      }
    });
    
    return unsubscribe;
  }, [permissionManager]);

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

    // Use CDN URL instead of backend URL
    const cdnUrl = getCdnUrl(audioPath);
    console.log('Loading audio from CDN:', cdnUrl);
    
    // Test if the file is accessible (non-blocking, for diagnostics only)
    const testAudioFile = async () => {
      try {
        const response = await fetch(cdnUrl, { method: 'HEAD', mode: 'no-cors' });
        // With no-cors, we can't read headers, but we can check if request succeeded
        console.log('Audio file test: Request sent (CORS may prevent header reading)');
      } catch (error) {
        // Silently fail - this is just for diagnostics, audio will load anyway
        console.log('Audio file test: HEAD request failed (CORS or network), but audio will still load');
      }
    };
    
    // Load audio immediately (don't wait for test)
    // Temporarily removed crossOrigin until CloudFront CORS is configured
    // audio.crossOrigin = 'anonymous';
    audio.src = cdnUrl;
    audio.load(); // Reload the audio element with new source
    
    // Run test in background (non-blocking)
    testAudioFile();
    
    if (autoPlay && canPlay && audioUnlocked) {
      // Auto-play when new audio is set, but only if this tab can play and audio is unlocked
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error('Error playing audio:', err);
          // Try to unlock audio permissions if play failed
          if (err.name === 'NotAllowedError' || err.name === 'NotSupportedError') {
            console.log('Audio autoplay blocked. Attempting to unlock permissions...');
            permissionManager.forceUnlock();
            // Retry after a short delay
            setTimeout(() => {
              audio.play().catch(retryErr => {
                console.error('Retry play failed:', retryErr);
                console.log('Note: User interaction may be required for audio playback.');
              });
            }, 100);
          }
        });
      }
    } else if (!canPlay) {
      // Pause audio if this tab is not the master
      audio.pause();
    } else if (!audioUnlocked) {
      // Wait for audio to be unlocked
      console.log('AudioPlayer: Waiting for audio permissions to be unlocked...');
    }
  }, [audioPath, autoPlay, canPlay, audioUnlocked, permissionManager]);

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
      const audio = e.target;
      const error = audio.error;
      console.error('Audio error:', e);
      console.error('Audio src:', audio.src);
      
      if (error) {
        console.error('Audio error code:', error.code);
        console.error('Audio error message:', error.message);
        console.error('Audio readyState:', audio.readyState);
        
        // Error code meanings:
        // 1 = MEDIA_ERR_ABORTED - The user aborted the loading
        // 2 = MEDIA_ERR_NETWORK - A network error occurred
        // 3 = MEDIA_ERR_DECODE - An error occurred while decoding
        // 4 = MEDIA_ERR_SRC_NOT_SUPPORTED - The audio format is not supported
        
        if (error.code === 4) {
          console.error('Format error: The audio format may not be supported, or CORS/Content-Type issue from CDN');
          console.error('Check CloudFront CORS configuration and Content-Type headers');
        }
      }
      
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
      // Only play if this tab is the audio master and audio is unlocked
      if ((canPlay || forcePlay) && audioUnlocked) {
        audio.play().catch(err => {
          console.error('Play error:', err);
          // Try to unlock if needed
          if (err.name === 'NotAllowedError' || err.name === 'NotSupportedError') {
            permissionManager.forceUnlock();
          }
        });
      } else {
        if (!audioUnlocked) {
          console.log('AudioPlayer: Ignoring play event - audio not unlocked yet');
        } else {
          console.log('AudioPlayer: Ignoring play event - not audio master');
        }
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
  }, [canPlay, forcePlay, audioUnlocked, permissionManager]);

  return (
    <audio
      ref={audioRef}
      preload="auto"
      style={{ display: 'none' }}
      // Temporarily removed crossOrigin until CloudFront CORS is configured
      // crossOrigin="anonymous"
    />
  );
};

export default AudioPlayer;

