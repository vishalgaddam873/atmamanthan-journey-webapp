import { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { getCommonAudio, getEmotionAudio, getAgeGroupImages } from '../../services/api';
import AudioPlayer from './AudioPlayer';
import AudioPermissionModal from './AudioPermissionModal';
import './MirrorScreen.css';

const MirrorDisplay = () => {
  const { socket, isConnected, session } = useWebSocket('mirror');
  const [currentStep, setCurrentStep] = useState('common_audio');
  const [commonAudioFiles, setCommonAudioFiles] = useState([]);
  const [emotionAudioFiles, setEmotionAudioFiles] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [images, setImages] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [emotionCategory, setEmotionCategory] = useState(null);
  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);

  // Load common audio files
  useEffect(() => {
    if (session && currentStep === 'common_audio') {
      loadCommonAudio();
    }
  }, [session, currentStep]);

  // Load emotion audio files
  useEffect(() => {
    if (emotionCategory && currentStep === 'emotion_flow') {
      loadEmotionAudio();
      loadImages();
    }
  }, [emotionCategory, currentStep, session]);

  const loadCommonAudio = async () => {
    try {
      const response = await getCommonAudio();
      setCommonAudioFiles(response.data);
    } catch (error) {
      console.error('Error loading common audio:', error);
    }
  };

  const loadEmotionAudio = async () => {
    try {
      const response = await getEmotionAudio(emotionCategory);
      setEmotionAudioFiles(response.data);
    } catch (error) {
      console.error('Error loading emotion audio:', error);
    }
  };

  const loadImages = async () => {
    if (!session || !emotionCategory) return;
    
    try {
      const response = await getAgeGroupImages(session.ageGroup, emotionCategory);
      setImages(response.data);
      if (response.data.length > 0) {
        setCurrentImage(response.data[0]);
        setImageIndex(0);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  // Handle WebSocket events
  useEffect(() => {
    if (!socket) return;

    socket.on('session:started', (data) => {
      setCurrentStep('common_audio');
      setEmotionCategory(null);
      setImages([]);
      setCurrentImage(null);
    });

    socket.on('emotion:selected', (data) => {
      setEmotionCategory(data.emotionCategory);
      setCurrentStep('emotion_flow');
      // Reset image index when emotion is selected
      setImageIndex(0);
    });

    socket.on('pran:selected', (data) => {
      setCurrentStep('pran_selected');
      if (socket) {
        socket.emit('step:update', {
          step: 'pran_selected',
          message: 'Pran selected, continuing with enlightenment flow',
        });
      }
    });

    socket.on('session:stopped', () => {
      setCurrentStep('common_audio');
      setEmotionCategory(null);
      setImages([]);
      setCurrentImage(null);
      setCommonAudioFiles([]);
      setEmotionAudioFiles([]);
    });

    return () => {
      socket.off('session:started');
      socket.off('emotion:selected');
      socket.off('pran:selected');
      socket.off('session:stopped');
    };
  }, [socket]);

  // Update images based on audio progress
  useEffect(() => {
    if (images.length > 0 && emotionAudioFiles.length > 0 && currentStep === 'emotion_flow') {
      // Show images sequentially - update every few seconds or based on audio file index
      const interval = setInterval(() => {
        setImageIndex((prev) => {
          const next = (prev + 1) % images.length;
          setCurrentImage(images[next]);
          return next;
        });
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [images, emotionAudioFiles, currentStep]);

  const handleCommonAudioEnd = () => {
    setCurrentStep('waiting_emotion');
    if (socket) {
      socket.emit('step:update', {
        step: 'waiting_emotion',
        message: 'Common audio completed, waiting for emotion selection',
      });
    }
  };

  const handleEmotionAudioEnd = () => {
    setCurrentStep('waiting_pran');
    if (socket) {
      socket.emit('step:update', {
        step: 'waiting_pran',
        message: 'Emotion flow audio completed, waiting for pran selection',
      });
    }
  };

  // Handle session completion
  useEffect(() => {
    if (!socket) return;

    socket.on('session:completed', () => {
      setCurrentStep('completed');
      // Optionally show completion message
    });

    return () => {
      socket.off('session:completed');
    };
  }, [socket]);

  const getCurrentAudioFiles = () => {
    if (currentStep === 'common_audio') {
      return commonAudioFiles;
    } else if (currentStep === 'emotion_flow') {
      return emotionAudioFiles;
    }
    return [];
  };

  const handlePermissionGranted = () => {
    console.log('handlePermissionGranted called in MirrorDisplay');
    setAudioPermissionGranted(true);
    // Force a re-render to ensure AudioPlayer is shown
    console.log('Audio permission granted state updated');
  };

  // Check permission on mount
  useEffect(() => {
    const permissionGranted = localStorage.getItem('audioPermissionGranted');
    if (permissionGranted === 'true') {
      setAudioPermissionGranted(true);
    }
  }, []);

  return (
    <div className="mirror-screen">
      {!audioPermissionGranted && (
        <AudioPermissionModal onPermissionGranted={handlePermissionGranted} />
      )}
      <div className="mirror-header">
        <h1>Mirror Screen</h1>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="mirror-content">
        {currentImage && (
          <div className="image-display">
            <img src={currentImage.url} alt="Current display" />
          </div>
        )}

        {!currentImage && (
          <div className="placeholder">
            <p>Waiting for session to start...</p>
          </div>
        )}

        {audioPermissionGranted && (
          <AudioPlayer
            audioFiles={getCurrentAudioFiles()}
            onAudioEnd={
              currentStep === 'common_audio' ? handleCommonAudioEnd : handleEmotionAudioEnd
            }
            autoPlay={currentStep === 'common_audio' || currentStep === 'emotion_flow'}
            hasPermission={audioPermissionGranted}
          />
        )}
      </div>

      <div className="mirror-info">
        <p>Step: {currentStep}</p>
        {session && <p>Age Group: {session.ageGroup}</p>}
        {emotionCategory && <p>Category: {emotionCategory}</p>}
      </div>
    </div>
  );
};

export default MirrorDisplay;

