import { useEffect, useState, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import MoodSelection from '../components/MoodSelection';
import PranSelection from '../components/PranSelection';
import AudioPlayer from '../components/AudioPlayer';
import AudioPermissionPrompt from '../components/AudioPermissionPrompt';
import CelebrationAnimation from '../components/CelebrationAnimation';
import SelectedPranDisplay from '../components/SelectedPranDisplay';
import api from '../lib/api';
import getAudioCoordinator from '../lib/audioCoordinator';
import { validateMp3Url } from '../lib/audioUtils';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setCurrentPhase,
  setSession,
  setPran,
} from '../store/slices/sessionSlice';
import {
  setCurrentAudio,
  setCurrentAudioId,
  setAudioQueue,
  setCurrentQueueIndex,
  setQueueLoaded,
  setWaitingForMoodSelection,
  clearCurrentAudio,
  resetAudioQueue,
} from '../store/slices/audioSlice';
import {
  setShowPranSelection,
  setShowCelebration,
} from '../store/slices/uiSlice';
import { resetSession } from '../store/slices/sessionSlice';

const TableScreen = () => {
  const dispatch = useAppDispatch();
  const { socket, connected } = useSocket();
  
  // Redux state
  const session = useAppSelector((state) => state.session.session);
  const currentPhase = useAppSelector((state) => state.session.currentPhase);
  const currentAudio = useAppSelector((state) => state.audio.currentAudio);
  const currentAudioId = useAppSelector((state) => state.audio.currentAudioId);
  const audioQueue = useAppSelector((state) => state.audio.audioQueue);
  const currentQueueIndex = useAppSelector((state) => state.audio.currentQueueIndex);
  const queueLoaded = useAppSelector((state) => state.audio.queueLoaded);
  const waitingForMoodSelection = useAppSelector((state) => state.audio.waitingForMoodSelection);
  const showPranSelection = useAppSelector((state) => state.ui.showPranSelection);
  const showCelebration = useAppSelector((state) => state.ui.showCelebration);
  const pran = useAppSelector((state) => state.session.pran);
  
  // Selected pran display state
  const [selectedPranLabel, setSelectedPranLabel] = useState(null);
  
  // Audio permission state
  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);
  
  // Background audio state
  const [backgroundAudioPath, setBackgroundAudioPath] = useState(null); // bg1
  const backgroundAudioRef = useRef(null);
  const [bg2AudioPath, setBg2AudioPath] = useState(null); // bg2
  const bg2AudioRef = useRef(null);
  
  // Handle background audio playback (bg1)
  useEffect(() => {
    const audio = backgroundAudioRef.current;
    // Don't play if permission not granted, no path, or pran selected
    if (!audio || !backgroundAudioPath || pran || !audioPermissionGranted) {
      // Stop audio if pran is selected or path is cleared
      if (audio && (pran || !backgroundAudioPath || !audioPermissionGranted)) {
        audio.pause();
        audio.currentTime = 0;
      }
      return;
    }
    
    const playBackgroundAudio = async () => {
      try {
        // Check if audio has an error before trying to play
        if (audio.error) {
          console.error('❌ Audio has error before play attempt:', {
            code: audio.error.code,
            message: audio.error.message
          });
          return;
        }
        
        // Set volume to 50% so it's audible but doesn't overpower main audio
        audio.volume = 0.5;
        
        // Wait for audio to be ready (readyState 2 = HAVE_CURRENT_DATA, 4 = HAVE_ENOUGH_DATA)
        if (audio.readyState < 2) {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Audio load timeout'));
            }, 10000); // Increased timeout to 10 seconds
            
            const handleCanPlay = () => {
              clearTimeout(timeout);
              audio.removeEventListener('error', handleError);
              resolve();
            };
            
            const handleError = (e) => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', handleCanPlay);
              reject(e);
            };
            
            audio.addEventListener('canplay', handleCanPlay, { once: true });
            audio.addEventListener('error', handleError, { once: true });
          });
        }
        
        // Check again for errors after loading
        if (audio.error) {
          console.error('❌ Audio error after loading:', {
            code: audio.error.code,
            message: audio.error.message,
            src: audio.src
          });
          return;
        }
        
        await audio.play();
        console.log('✅ Background audio (bg1) playing in loop at volume:', audio.volume);
      } catch (error) {
        console.error('❌ Error playing background audio:', error);
        console.error('Audio src:', audio.src);
        console.error('Audio readyState:', audio.readyState);
        console.error('Audio networkState:', audio.networkState);
        if (audio.error) {
          console.error('Audio error code:', audio.error.code);
          console.error('Audio error message:', audio.error.message);
        }
      }
    };
    
    // Add event listeners for debugging
    const handleCanPlay = () => {
      console.log('Background audio (bg1) can play');
    };
    
    const handleLoadedData = () => {
      console.log('Background audio (bg1) loaded');
    };
    
    const handleError = (e) => {
      // Guard against empty src errors
      if (!audio.src || audio.src === window.location.href || audio.src === '') {
        console.warn('Background audio (bg1): Ignoring error with empty/invalid src');
        return;
      }

      console.error('Background audio (bg1) error:', e);
      console.error('Audio src:', audio.src);
      console.error('Audio error code:', audio.error?.code);
      console.error('Audio error message:', audio.error?.message);
      
      // Check for format/CORS errors
      if (audio.error?.code === 4) {
        console.error('❌ Format error - Possible causes:');
        console.error('   1. CORS headers not configured on CloudFront');
        console.error('   2. Content-Type header not set correctly');
        console.error('   3. File may not be accessible at:', audio.src);
        console.error('   Check CloudFront CORS configuration (see CLOUDFRONT_CORS_SETUP.md)');
      }
    };
    
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);
    
    playBackgroundAudio();
    
    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
    };
  }, [backgroundAudioPath, pran, audioPermissionGranted]);
  
  // Handle bg2 audio playback (after pran selection)
  useEffect(() => {
    const audio = bg2AudioRef.current;
    // Don't play if permission not granted, no path, or pran not selected
    if (!audio || !bg2AudioPath || !pran || !audioPermissionGranted) {
      // Stop audio if pran is not selected or path is cleared
      if (audio && (!pran || !bg2AudioPath || !audioPermissionGranted)) {
        audio.pause();
        audio.currentTime = 0;
      }
      return;
    }
    
    const playBg2Audio = async () => {
      try {
        // Check if audio has an error before trying to play
        if (audio.error) {
          console.error('❌ Audio has error before play attempt:', {
            code: audio.error.code,
            message: audio.error.message
          });
          return;
        }
        
        // Set volume to 50% so it's audible but doesn't overpower main audio
        audio.volume = 0.5;
        
        // Wait for audio to be ready (readyState 2 = HAVE_CURRENT_DATA, 4 = HAVE_ENOUGH_DATA)
        if (audio.readyState < 2) {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Audio load timeout'));
            }, 10000); // Increased timeout to 10 seconds
            
            const handleCanPlay = () => {
              clearTimeout(timeout);
              audio.removeEventListener('error', handleError);
              resolve();
            };
            
            const handleError = (e) => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', handleCanPlay);
              reject(e);
            };
            
            audio.addEventListener('canplay', handleCanPlay, { once: true });
            audio.addEventListener('error', handleError, { once: true });
          });
        }
        
        // Check again for errors after loading
        if (audio.error) {
          console.error('❌ Audio error after loading:', {
            code: audio.error.code,
            message: audio.error.message,
            src: audio.src
          });
          return;
        }
        
        await audio.play();
        console.log('✅ Background audio (bg2) playing in loop at volume:', audio.volume);
      } catch (error) {
        console.error('❌ Error playing bg2 audio:', error);
        console.error('Audio src:', audio.src);
        console.error('Audio readyState:', audio.readyState);
        console.error('Audio networkState:', audio.networkState);
        if (audio.error) {
          console.error('Audio error code:', audio.error.code);
          console.error('Audio error message:', audio.error.message);
        }
      }
    };
    
    // Add event listeners for debugging
    const handleCanPlay = () => {
      console.log('Background audio (bg2) can play');
    };
    
    const handleLoadedData = () => {
      console.log('Background audio (bg2) loaded');
    };
    
    const handleError = (e) => {
      // Guard against empty src errors
      if (!audio.src || audio.src === window.location.href || audio.src === '') {
        console.warn('Background audio (bg2): Ignoring error with empty/invalid src');
        return;
      }

      console.error('Background audio (bg2) error:', e);
      console.error('Audio src:', audio.src);
      console.error('Audio error code:', audio.error?.code);
      console.error('Audio error message:', audio.error?.message);
      
      // Check for format/CORS errors
      if (audio.error?.code === 4) {
        console.error('❌ Format error - Possible causes:');
        console.error('   1. CORS headers not configured on CloudFront');
        console.error('   2. Content-Type header not set correctly');
        console.error('   3. File may not be accessible at:', audio.src);
        console.error('   Check CloudFront CORS configuration (see CLOUDFRONT_CORS_SETUP.md)');
      }
    };
    
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);
    
    playBg2Audio();
    
    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
    };
  }, [bg2AudioPath, pran, audioPermissionGranted]);
  
  // Table screen is always the audio master
  useEffect(() => {
    const coordinator = getAudioCoordinator();
    coordinator.forceMaster();
    console.log('TableScreen: Forced this tab to be audio master');
    
    // Clear sessionStorage to force fresh permission check
    // This ensures browser requires new user interaction for autoplay
    if (typeof window !== 'undefined' && sessionStorage.getItem('audio_unlocked')) {
      console.log('Clearing audio_unlocked from sessionStorage to force fresh permission check');
      sessionStorage.removeItem('audio_unlocked');
    }
    
    return () => {
      // Don't release on unmount, let it handle naturally
    };
  }, []);

  useEffect(() => {
    if (!socket || !session) return;

    dispatch(setCurrentPhase(session.currentPhase));

    // Handle session reset
    socket.on('session_reset', () => {
      console.log('Session reset received - resetting table screen');
      dispatch(clearCurrentAudio());
      dispatch(resetAudioQueue());
      dispatch(setShowPranSelection(false));
      dispatch(setShowCelebration(false));
      dispatch(setCurrentPhase('INIT'));
      dispatch(resetSession());
      setSelectedPranLabel(null); // Clear selected pran display
      // Stop background audio on reset
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current.currentTime = 0;
      }
      if (bg2AudioRef.current) {
        bg2AudioRef.current.pause();
        bg2AudioRef.current.currentTime = 0;
      }
      setBackgroundAudioPath(null);
      setBg2AudioPath(null);
    });

    // Handle phase changes
    socket.on('phase_changed', ({ phase }) => {
      console.log('Phase changed to:', phase);
      dispatch(setCurrentPhase(phase));
      
      // Reset everything when phase changes to INIT (session reset)
      if (phase === 'INIT') {
        console.log('Phase changed to INIT - resetting table screen');
        dispatch(clearCurrentAudio());
        dispatch(resetAudioQueue());
        dispatch(setShowPranSelection(false));
        dispatch(setShowCelebration(false));
        dispatch(resetSession());
        setSelectedPranLabel(null); // Clear selected pran display
        // Stop background audio on reset
        if (backgroundAudioRef.current) {
          backgroundAudioRef.current.pause();
          backgroundAudioRef.current.currentTime = 0;
        }
        if (bg2AudioRef.current) {
          bg2AudioRef.current.pause();
          bg2AudioRef.current.currentTime = 0;
        }
        setBackgroundAudioPath(null);
        setBg2AudioPath(null);
        return;
      }
      
      // Don't reset pran selection if phase changes to PRAN_SELECTION
      if (phase !== 'PRAN_SELECTION') {
        dispatch(setShowPranSelection(false));
      }
      // Don't reset queue when transitioning from CATEGORY_FLOW to ENDING
      // The audio queue should continue playing remaining audios
      // Also don't reset when transitioning to MOOD_SELECTION (common flow audio still playing)
      if (phase !== 'CATEGORY_FLOW' && phase !== 'PRAN_SELECTION' && phase !== 'ENDING' && phase !== 'MOOD_SELECTION') {
        dispatch(setCurrentQueueIndex(0));
        dispatch(setQueueLoaded(false)); // Reset queue loaded flag
        dispatch(resetAudioQueue()); // Clear queue
      }
      // If phase is ENDING and we have remaining audios, continue playing
      if (phase === 'ENDING' && audioQueue.length > 0 && currentQueueIndex < audioQueue.length - 1) {
        console.log('ENDING phase: Continuing audio queue from index', currentQueueIndex);
        // Don't reset anything, let the audio continue
      }
    });

    // Handle audio events
    socket.on('audio_play', ({ audioPath, audioId }) => {
      dispatch(setCurrentAudio(audioPath));
      dispatch(setCurrentAudioId(audioId));
      
      // Update queue index if this audio is in the queue (for positive flow audio 3 manual play)
      if (audioQueue.length > 0 && audioId) {
        const audioIndex = audioQueue.findIndex(a => a._id === audioId);
        if (audioIndex !== -1 && audioIndex !== currentQueueIndex) {
          console.log(`Updating queue index to ${audioIndex} for audio: ${audioQueue[audioIndex]?.fileName}`);
          dispatch(setCurrentQueueIndex(audioIndex));
        }
      }
      
      // Check if this is audio 8 (Choosing-Emotion) in COMMON flow
      // Fallback: Show mood selection even if cue point is not set
      if (currentPhase === 'COMMON_FLOW' && audioQueue.length > 0) {
        // Find current audio in queue by matching audioId or path
        const currentAudioInQueue = audioQueue.find(a => 
          a._id === audioId || 
          a.filePath === audioPath ||
          (a.sequence === 8 && (audioPath.includes('Choosing-Emotion') || audioPath.includes('choosing-emotion')))
        );
        
        if (currentAudioInQueue && currentAudioInQueue.sequence === 8) {
          console.log('Audio 8 (Choosing-Emotion) detected - showing mood selection as fallback');
          // Set waiting flag - we're waiting for user to select mood
          dispatch(setWaitingForMoodSelection(true));
          // Small delay to ensure state is updated
          setTimeout(() => {
            dispatch(setCurrentPhase('MOOD_SELECTION'));
            if (socket) {
              socket.emit('force_phase', { phase: 'MOOD_SELECTION' });
            }
          }, 100);
        }
      }
      
      // Trigger play event
      window.dispatchEvent(new Event('audio:play'));
    });

    socket.on('audio_pause', () => {
      window.dispatchEvent(new Event('audio:pause'));
    });

    socket.on('audio_stop', () => {
      dispatch(clearCurrentAudio());
      window.dispatchEvent(new Event('audio:stop'));
    });

    // Handle mood selection - reset queue so category flow can load
    socket.on('mood_selected', ({ mood, category }) => {
      console.log('Mood selected:', mood, 'Category:', category);
      // Reset waiting flag - user has selected mood
      dispatch(setWaitingForMoodSelection(false));
      // Reset queue loaded flag so category flow audios can load
      dispatch(setQueueLoaded(false));
      dispatch(setCurrentQueueIndex(0));
      dispatch(resetAudioQueue());
    });

    // Handle pran selection - keep pran selection visible
    socket.on('pran_selected', async ({ pranId }) => {
      console.log('Pran selected:', pranId);
      // Set pran in session state
      dispatch(setPran(pranId));
      // Keep pran selection visible even after phase changes to ENDING
      dispatch(setShowPranSelection(true));
      // Stop background audio (bg1) when pran is selected
      if (backgroundAudioRef.current) {
        console.log('Stopping background audio (bg1) - pran selected');
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current.currentTime = 0;
        setBackgroundAudioPath(null);
      }
      
      // Fetch pran details to display selected promise
      // Note: pranId is the numeric id field (1-12), not MongoDB _id
      try {
        if (session?.category) {
          const pransResponse = await api.get(`/api/pran?category=${session.category}`);
          const pranData = pransResponse.data.find(p => p.id === pranId);
          if (pranData) {
            console.log('Fetched pran details:', pranData);
            setSelectedPranLabel(pranData.label);
          } else {
            console.warn('Pran not found with id:', pranId, 'in category:', session.category);
            // Fallback: try to find by _id if pranId is actually an ObjectId
            const pranById = pransResponse.data.find(p => p._id === pranId);
            if (pranById) {
              setSelectedPranLabel(pranById.label);
            }
          }
        } else {
          // If no category, try fetching all prans
          const pransResponse = await api.get('/api/pran');
          const pranData = pransResponse.data.find(p => p.id === pranId || p._id === pranId);
          if (pranData) {
            console.log('Fetched pran details from all prans:', pranData);
            setSelectedPranLabel(pranData.label);
          }
        }
      } catch (error) {
        console.error('Error fetching pran details:', error);
      }
      
      // Continue to next audio now that pran is selected
      if (currentQueueIndex < audioQueue.length - 1) {
        const nextIndex = currentQueueIndex + 1;
        const nextAudio = audioQueue[nextIndex];
        console.log('Pran selected - Continuing to next audio:', nextAudio.fileName);
        dispatch(setCurrentQueueIndex(nextIndex));
        if (socket) {
          socket.emit('audio_play', {
            audioPath: nextAudio.filePath,
            audioId: nextAudio._id,
            cue: nextIndex
          });
        }
      }
      
      // Load and start bg2 audio
      try {
        const response = await api.get('/api/audio?category=COMMON');
        const bg2Audio = response.data.find(audio => {
          const fileName = audio.fileName.toLowerCase();
          return fileName === 'bg2.mp3' || (fileName.includes('bg2') && fileName.endsWith('.mp3'));
        });
        
        if (bg2Audio) {
          console.log('Found bg2 audio:', bg2Audio);
          // Validate URL before setting
          const audioUrl = bg2Audio.filePath.startsWith('http://') || bg2Audio.filePath.startsWith('https://')
            ? bg2Audio.filePath
            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${bg2Audio.filePath}`;
          
          try {
            new URL(audioUrl); // This will throw if URL is invalid
            console.log('✅ Valid bg2 audio URL:', audioUrl);
            console.log('Starting background audio (bg2):', bg2Audio.fileName, 'at path:', bg2Audio.filePath);
            setBg2AudioPath(bg2Audio.filePath);
          } catch (err) {
            console.error('❌ Invalid bg2 audio URL:', audioUrl, err);
          }
        } else {
          console.warn('bg2.mp3 not found in COMMON audio files. Available files:', response.data.map(a => a.fileName));
          // Fallback: try to use the direct path if bg2 exists in the Common folder
          const fallbackPath = '/assets/Audio/Common/bg2.mp3';
          const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${fallbackPath}`;
          console.log('Attempting fallback path for bg2:', fallbackPath);
          try {
            new URL(fallbackUrl);
            setBg2AudioPath(fallbackPath);
          } catch (err) {
            console.error('❌ Invalid fallback bg2 URL:', fallbackUrl, err);
          }
        }
      } catch (error) {
        console.error('Error loading bg2 audio:', error);
      }
    });

    // Handle cue points
    socket.on('cue_trigger', ({ cuePoint, data }) => {
      console.log('Cue triggered:', cuePoint, data);
      if (cuePoint === 'PRAN_SELECTION') {
        console.log('PRAN_SELECTION cue triggered - showing pran buttons');
        dispatch(setShowPranSelection(true));
        // Force phase update
        dispatch(setCurrentPhase('PRAN_SELECTION'));
        // Also update session phase via socket
        if (socket) {
          socket.emit('force_phase', { phase: 'PRAN_SELECTION' });
        }
      } else if (cuePoint === 'MOOD_SELECTION') {
        console.log('MOOD_SELECTION cue triggered - showing mood selection immediately');
        // Set waiting flag - we're waiting for user to select mood
        dispatch(setWaitingForMoodSelection(true));
        // Immediately update phase to show mood selection
        dispatch(setCurrentPhase('MOOD_SELECTION'));
        // Also update session phase via socket
        if (socket) {
          socket.emit('force_phase', { phase: 'MOOD_SELECTION' });
        }
      }
    });

    return () => {
      socket.off('phase_changed');
      socket.off('session_reset');
      socket.off('audio_play');
      socket.off('audio_pause');
      socket.off('audio_stop');
      socket.off('mood_selected');
      socket.off('pran_selected');
      socket.off('cue_trigger');
    };
  }, [socket, session, dispatch, currentPhase, audioQueue, currentQueueIndex, pran]);

  // Load audio queue when phase changes (only once per phase)
  useEffect(() => {
    const loadAudioQueue = async () => {
      if (currentPhase === 'COMMON_FLOW' && !queueLoaded) {
        console.log('Loading COMMON_FLOW audio queue...');
        const response = await api.get('/api/audio?category=COMMON');
        // Filter out Welcome_to_Yatra audio
        const filtered = response.data.filter(audio => 
          !audio.fileName.toLowerCase().includes('welcome_to_yatra') && 
          !audio.fileName.toLowerCase().includes('welcome-to-yatra')
        );
        const sorted = filtered.sort((a, b) => a.sequence - b.sequence);
        dispatch(setAudioQueue(sorted));
        dispatch(setCurrentQueueIndex(0));
        dispatch(setQueueLoaded(true));
        
        // Load and start background audio (bg1)
        // Search in the full response data (before filtering) to find bg1
        const bg1Audio = response.data.find(audio => {
          const fileName = audio.fileName.toLowerCase();
          return fileName === 'bg1.mp3' || (fileName.includes('bg1') && fileName.endsWith('.mp3'));
        });
        
        if (bg1Audio) {
          console.log('Found bg1 audio:', bg1Audio);
          console.log('bg1 filePath:', bg1Audio.filePath);
          console.log('bg1 fileName:', bg1Audio.fileName);
          if (!pran) {
            // Validate URL before setting
            const audioUrl = bg1Audio.filePath.startsWith('http://') || bg1Audio.filePath.startsWith('https://')
              ? bg1Audio.filePath
              : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${bg1Audio.filePath}`;
            
            try {
              new URL(audioUrl); // This will throw if URL is invalid
              console.log('✅ Valid bg1 audio URL:', audioUrl);
              console.log('Starting background audio (bg1):', bg1Audio.fileName, 'at path:', bg1Audio.filePath);
              setBackgroundAudioPath(bg1Audio.filePath);
            } catch (err) {
              console.error('❌ Invalid bg1 audio URL:', audioUrl, err);
            }
          }
        } else {
          console.warn('bg1.mp3 not found in COMMON audio files. Available files:', response.data.map(a => a.fileName));
          // Fallback: try to use the direct path if bg1 exists in the Common folder
          const fallbackPath = '/assets/Audio/Common/bg1.mp3';
          const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${fallbackPath}`;
          console.log('Attempting fallback path for bg1:', fallbackPath);
          try {
            new URL(fallbackUrl);
            if (!pran) {
              setBackgroundAudioPath(fallbackPath);
            }
          } catch (err) {
            console.error('❌ Invalid fallback bg1 URL:', fallbackUrl, err);
          }
        }
        
        // Auto-play first audio
        if (sorted.length > 0 && socket) {
          console.log(`Playing first audio: ${sorted[0].fileName} (sequence: ${sorted[0].sequence}, cuePoint: ${sorted[0].cuePoint})`);
          socket.emit('audio_play', {
            audioPath: sorted[0].filePath,
            audioId: sorted[0]._id,
            cue: 0
          });
        }
      } else if (currentPhase === 'CATEGORY_FLOW' && session?.category && !queueLoaded) {
        console.log(`Loading CATEGORY_FLOW audio queue for ${session.category}...`);
        const response = await api.get(`/api/audio?category=${session.category}`);
        const sorted = response.data.sort((a, b) => a.sequence - b.sequence);
        dispatch(setAudioQueue(sorted));
        dispatch(setCurrentQueueIndex(0));
        dispatch(setQueueLoaded(true));
        // Auto-play first audio
        if (sorted.length > 0 && socket) {
          console.log(`Playing first audio: ${sorted[0].fileName} (sequence: ${sorted[0].sequence}, cuePoint: ${sorted[0].cuePoint})`);
          socket.emit('audio_play', {
            audioPath: sorted[0].filePath,
            audioId: sorted[0]._id,
            cue: 0
          });
        }
      }
    };

    loadAudioQueue();
  }, [currentPhase, session?.category, socket, queueLoaded, dispatch, pran]);

  const handleAudioEnd = () => {
    console.log(`Audio ended. Current index: ${currentQueueIndex}, Queue length: ${audioQueue.length}, Phase: ${currentPhase}, Waiting for mood: ${waitingForMoodSelection}`);
    
    // Emit audio_stop event so mirror screen can react (e.g., show images after audio 2)
    if (socket) {
      console.log('Emitting audio_stop event to mirror screen');
      socket.emit('audio_stop');
    }
    
    // Special handling for audio 8 (Choosing-Emotion) in COMMON flow
    if (currentPhase === 'COMMON_FLOW' || currentPhase === 'MOOD_SELECTION') {
      const currentAudioInQueue = audioQueue[currentQueueIndex];
      if (currentAudioInQueue && currentAudioInQueue.sequence === 8) {
        console.log('Audio 8 (Choosing-Emotion) finished. Waiting for mood selection...');
        // If waiting for mood selection, don't play next audio
        if (waitingForMoodSelection) {
          console.log('Waiting for user to select mood - not playing next audio');
          // Stop audio but don't clear - wait for mood selection
          dispatch(clearCurrentAudio());
          return; // Don't continue to next audio
        }
      }
    }
    
    // Get current audio in queue for checks
    const currentAudioInQueue = audioQueue[currentQueueIndex];
    
    // Special handling for Positive Flow: Audio 2 ends - don't auto-play audio 3
    // Images will show for 10 seconds, then mirror.js will manually trigger audio 3
    if (session?.category === 'POSITIVE') {
      if (currentAudioInQueue && currentAudioInQueue.sequence === 2) {
        console.log('Positive Flow: Audio 2 ended - NOT auto-playing audio 3. Images will show for 10 seconds, then audio 3 will play.');
        dispatch(clearCurrentAudio());
        // Don't increment queue index - mirror.js will handle playing audio 3 after images
        return; // Don't continue to next audio
      }
    }
    
    // Special handling for Neutral Flow: Audio 1 ends - don't auto-play audio 2
    // Images will show for 10 seconds, then mirror.js will manually trigger audio 2
    if (session?.category === 'NEUTRAL') {
      if (currentAudioInQueue && currentAudioInQueue.sequence === 1) {
        console.log('Neutral Flow: Audio 1 ended - NOT auto-playing audio 2. Images will show for 10 seconds, then audio 2 will play.');
        dispatch(clearCurrentAudio());
        // Don't increment queue index - mirror.js will handle playing audio 2 after images
        return; // Don't continue to next audio
      }
    }
    
    // Special handling for Negative Flow: Audio 1 ends - don't auto-play audio 2
    // Images will show for 10 seconds, then mirror.js will manually trigger audio 2
    if (session?.category === 'NEGATIVE') {
      if (currentAudioInQueue && currentAudioInQueue.sequence === 1) {
        console.log('Negative Flow: Audio 1 ended - NOT auto-playing audio 2. Images will show for 10 seconds, then audio 2 will play.');
        dispatch(clearCurrentAudio());
        // Don't increment queue index - mirror.js will handle playing audio 2 after images
        return; // Don't continue to next audio
      }
    }
    
    // Special handling for Negative Flow: Audio 2 ends - don't auto-play audio 3
    // Images will show for 10 seconds, then mirror.js will manually trigger audio 3
    if (session?.category === 'NEGATIVE') {
      if (currentAudioInQueue && currentAudioInQueue.sequence === 2) {
        console.log('Negative Flow: Audio 2 ended - NOT auto-playing audio 3. Images will show for 10 seconds, then audio 3 will play.');
        dispatch(clearCurrentAudio());
        // Don't increment queue index - mirror.js will handle playing audio 3 after images
        return; // Don't continue to next audio
      }
    }
    
    // Special handling for PRAN_SELECTION: Wait until pran is selected
    if (currentAudioInQueue && currentAudioInQueue.cuePoint === 'PRAN_SELECTION') {
      // If pran hasn't been selected yet, don't play next audio
      if (!pran) {
        console.log('PRAN_SELECTION audio ended - Waiting for user to select pran before playing next audio');
        dispatch(clearCurrentAudio());
        return; // Don't continue to next audio until pran is selected
      } else {
        console.log('PRAN_SELECTION audio ended - Pran already selected, continuing to next audio');
      }
    }
    
    // Also check if we're in PRAN_SELECTION phase and pran hasn't been selected
    if (currentPhase === 'PRAN_SELECTION' && !pran) {
      console.log('In PRAN_SELECTION phase but pran not selected - waiting for pran selection');
      dispatch(clearCurrentAudio());
      return; // Don't play next audio until pran is selected
    }
    
    // Play next audio in queue (continue even if phase is ENDING)
    if (currentQueueIndex < audioQueue.length - 1) {
      // Check if we're waiting for mood selection
      if (waitingForMoodSelection && currentPhase === 'MOOD_SELECTION') {
        console.log('Still waiting for mood selection - not playing next audio');
        dispatch(clearCurrentAudio());
        return; // Don't play next audio until mood is selected
      }
      
      const nextIndex = currentQueueIndex + 1;
      const nextAudio = audioQueue[nextIndex];
      
      // Calculate pause duration based on current audio and phase
      let pauseDuration = 0;
      
      // Special handling for COMMON_FLOW pauses
      if (currentPhase === 'COMMON_FLOW') {
        if (currentAudioInQueue) {
          // After audio 7 (Dark-Room-Entry), pause for 8 seconds before audio 8
          if (currentAudioInQueue.sequence === 7) {
            pauseDuration = 8000; // 8 seconds
            console.log(`COMMON_FLOW: Audio 7 ended - Pausing for 8 seconds before audio 8 (Ankho ki Patti hataye)`);
          } else {
            // After all other audios in COMMON_FLOW, pause for 4 seconds
            pauseDuration = 4000; // 4 seconds
            console.log(`COMMON_FLOW: Audio ${currentAudioInQueue.sequence} ended - Pausing for 4 seconds before next audio`);
          }
        }
      }
      
      // Play next audio after pause (if any)
      const playNextAudio = () => {
        console.log(`Playing next audio: ${nextAudio.fileName} (sequence: ${nextAudio.sequence}, index: ${nextIndex}, cuePoint: ${nextAudio.cuePoint})`);
        dispatch(setCurrentQueueIndex(nextIndex));
        if (socket) {
          socket.emit('audio_play', {
            audioPath: nextAudio.filePath,
            audioId: nextAudio._id,
            cue: nextIndex
          });
        }
      };
      
      if (pauseDuration > 0) {
        setTimeout(playNextAudio, pauseDuration);
      } else {
        playNextAudio();
      }
    } else {
      // Queue finished
      console.log('Audio queue finished. Phase:', currentPhase);
      dispatch(clearCurrentAudio());
      dispatch(setQueueLoaded(false)); // Reset for next flow
      
      // If common flow finished and waiting for mood, don't do anything
      if (waitingForMoodSelection && currentPhase === 'MOOD_SELECTION') {
        console.log('Common flow finished - waiting for mood selection');
        return;
      }
      
      // If common flow finished, show mood selection
      if (currentPhase === 'COMMON_FLOW' && socket) {
        // Don't force phase change if already in MOOD_SELECTION
        // The cue point should have already triggered it
        console.log('Common flow finished - mood selection should already be visible');
      }
      // If ENDING phase and queue finished, journey is complete
      if (currentPhase === 'ENDING') {
        console.log('Journey complete - all audios finished');
        // Auto-reset after 5 seconds to allow user to see completion
        setTimeout(() => {
          console.log('Auto-resetting both screens after session completion');
          // Reset via socket to ensure both screens reset together
          if (socket) {
            socket.emit('reset_session');
          }
        }, 2000); // 2 second delay before reset
      }
    }
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-2xl">Connecting...</div>
      </div>
    );
  }

  const renderPhase = () => {
    // Only show mood selection and pran selection screens
    // All other phases show blank black screen
    // If pran is selected, hide PranSelection and only show SelectedPranDisplay
    switch (currentPhase) {
      case 'MOOD_SELECTION':
        return <MoodSelection socket={socket} />;
      
      case 'PRAN_SELECTION':
        // If pran is already selected, don't show selection buttons
        if (pran || selectedPranLabel) {
          return <div className="w-screen h-screen bg-black" />;
        }
        return session?.category ? (
          <PranSelection socket={socket} category={session.category} />
        ) : (
          <div className="w-screen h-screen bg-black" />
        );
      
      case 'CATEGORY_FLOW':
        // If pran is already selected, don't show selection buttons
        if (pran || selectedPranLabel) {
          return <div className="w-screen h-screen bg-black" />;
        }
        // Show pran selection if cue triggered, otherwise black screen
        if (showPranSelection && session?.category) {
          return <PranSelection socket={socket} category={session.category} />;
        }
        return <div className="w-screen h-screen bg-black" />;
      
      case 'ENDING':
        // If pran is selected, don't show selection buttons - only SelectedPranDisplay will show
        if (pran || selectedPranLabel) {
          return <div className="w-screen h-screen bg-black" />;
        }
        return <div className="w-screen h-screen bg-black" />;
      
      default:
        // All other phases (INIT, AGE_SELECTION, COMMON_FLOW) show black screen
        return <div className="w-screen h-screen bg-black" />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Audio Permission Prompt - Show first, block everything until granted */}
      {!audioPermissionGranted && (
        <AudioPermissionPrompt
          onPermissionGranted={() => {
            console.log('✅ Audio permission granted - enabling audio playback');
            setAudioPermissionGranted(true);
          }}
        />
      )}
      {renderPhase()}
      {showCelebration && (
        <CelebrationAnimation
          onComplete={() => {
            dispatch(setShowCelebration(false));
          }}
        />
      )}
      {/* Display selected promise with continuous animation */}
      {selectedPranLabel && session?.category && (
        <SelectedPranDisplay 
          pranLabel={selectedPranLabel} 
          category={session.category}
        />
      )}
      {audioPermissionGranted && currentAudio && (
        <AudioPlayer
          audioPath={currentAudio}
          onEnded={handleAudioEnd}
          forcePlay={true}
        />
      )}
      {/* Background audio (bg1) - plays in loop until pran is selected */}
      {audioPermissionGranted && backgroundAudioPath && (
        <audio
          ref={backgroundAudioRef}
          src={backgroundAudioPath.startsWith('http://') || backgroundAudioPath.startsWith('https://') 
            ? backgroundAudioPath 
            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${encodeURI(backgroundAudioPath)}`}
          loop
          preload="auto"
          style={{ display: 'none' }}
          crossOrigin="anonymous"
          onPlay={() => {
            console.log('Background audio (bg1) started playing');
            console.log('Audio src:', backgroundAudioRef.current?.src);
            console.log('Audio volume:', backgroundAudioRef.current?.volume);
          }}
          onError={(e) => {
            console.error('Background audio error:', e);
            console.error('Audio src:', backgroundAudioRef.current?.src);
            console.error('Audio error details:', backgroundAudioRef.current?.error);
          }}
          onLoadedMetadata={() => {
            console.log('Background audio (bg1) metadata loaded');
            console.log('Duration:', backgroundAudioRef.current?.duration);
          }}
        />
      )}
      {/* Background audio (bg2) - plays in loop after pran is selected */}
      {audioPermissionGranted && bg2AudioPath && pran && (
        <audio
          ref={bg2AudioRef}
          src={bg2AudioPath.startsWith('http://') || bg2AudioPath.startsWith('https://') 
            ? bg2AudioPath 
            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${encodeURI(bg2AudioPath)}`}
          loop
          preload="auto"
          style={{ display: 'none' }}
          crossOrigin="anonymous"
          onPlay={() => {
            console.log('Background audio (bg2) started playing');
            console.log('Audio src:', bg2AudioRef.current?.src);
            console.log('Audio volume:', bg2AudioRef.current?.volume);
          }}
          onError={(e) => {
            console.error('Background audio (bg2) error:', e);
            console.error('Audio src:', bg2AudioRef.current?.src);
            console.error('Audio error details:', bg2AudioRef.current?.error);
          }}
          onLoadedMetadata={() => {
            console.log('Background audio (bg2) metadata loaded');
            console.log('Duration:', bg2AudioRef.current?.duration);
          }}
        />
      )}
    </div>
  );
};

export default TableScreen;
