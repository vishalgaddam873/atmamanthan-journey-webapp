import { useEffect, useRef, useState } from 'react';
import getAudioCoordinator from '../lib/audioCoordinator';
import getAudioPermissionManager from '../lib/audioPermissions';
import { resolveAudioUrl, validateMp3Url, logAudioError } from '../lib/audioUtils';

const AudioPlayer = ({ audioPath, onEnded, autoPlay = true, forcePlay = false }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
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
    if (!audio || !audioPath) {
      // Clear src if no audioPath to prevent empty-src errors
      if (audio && audio.src) {
        audio.src = '';
      }
      return;
    }

    // Don't load audio until permission is granted
    if (!audioUnlocked) {
      console.log('AudioPlayer: Waiting for audio permissions to be unlocked...');
      return;
    }

    // Validate and load audio
    const loadAudio = async () => {
      try {
        // Construct full URL
        const encodedPath = resolveAudioUrl(audioPath);
        
        if (!encodedPath) {
          console.error('AudioPlayer: Invalid audio path');
          return;
        }

        // Validate URL exists before loading
        setIsValidating(true);
        console.log(`AudioPlayer: Validating MP3 URL: ${encodedPath}`);
        
        const validation = await validateMp3Url(encodedPath);
        setIsValidating(false);

        // Only block on definitive errors (404, 403)
        // Allow loading if CORS blocked validation (audio element may still work)
        if (!validation.valid && validation.status === 404) {
          console.error(`❌ AudioPlayer: File not found (404): ${encodedPath}`);
          console.error(`   Please verify the exact filename matches what's on the server`);
          return; // Don't load 404 URLs
        }

        if (!validation.valid && validation.status === 403) {
          console.error(`❌ AudioPlayer: Access denied (403): ${encodedPath}`);
          console.error(`   Check CloudFront permissions and CORS configuration`);
          return; // Don't load 403 URLs
        }

        // For CORS errors or other issues, still try to load
        // The audio element might work even if HEAD request was blocked
        if (validation.corsBlocked || validation.validationError) {
          console.log(`⚠️ AudioPlayer: Validation had issues, but attempting to load: ${encodedPath}`);
        } else {
          console.log(`✅ AudioPlayer: URL validated, loading audio: ${encodedPath}`);
        }
        audio.src = encodedPath;
        audio.load(); // Reload the audio element with new source
        
        // Wait for audio to be ready before attempting to play
        if (autoPlay && canPlay) {
          // Wait for canplay event
          const handleCanPlay = () => {
            audio.removeEventListener('error', handleError);
            audio.play().catch(err => {
              if (err.name === 'NotAllowedError') {
                console.error('❌ AudioPlayer: NotAllowedError - audio not unlocked properly');
                console.error('   User interaction may be required');
              } else {
                console.error('❌ AudioPlayer: Error playing audio:', err);
              }
            });
          };

          const handleError = (e) => {
            audio.removeEventListener('canplay', handleCanPlay);
            logAudioError(audio, 'AudioPlayer');
          };

          audio.addEventListener('canplay', handleCanPlay, { once: true });
          audio.addEventListener('error', handleError, { once: true });
        }
      } catch (error) {
        setIsValidating(false);
        console.error('❌ AudioPlayer: Error loading audio:', error);
      }
    };

    loadAudio();
  }, [audioPath, autoPlay, canPlay, audioUnlocked]);

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
      // Guard against empty src errors
      if (!audio.src || audio.src === window.location.href || audio.src === '') {
        console.warn('AudioPlayer: Ignoring error with empty/invalid src');
        return;
      }

      logAudioError(audio, 'AudioPlayer');
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
        // Only play if src is set and valid
        if (!audio.src || audio.src === window.location.href || audio.src === '') {
          console.warn('AudioPlayer: Ignoring play event - no valid src');
          return;
        }
        
        audio.play().catch(err => {
          console.error('❌ AudioPlayer: Play error:', err);
          if (err.name === 'NotAllowedError') {
            console.error('   Audio not unlocked properly - user interaction required');
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
  }, [canPlay, forcePlay, audioUnlocked]);

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
