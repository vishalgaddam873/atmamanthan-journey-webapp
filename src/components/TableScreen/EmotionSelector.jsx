import { useState, useEffect } from 'react';
import { getEmotionImages } from '../../services/api';
import './TableScreen.css';

const EmotionSelector = ({ socket, onEmotionSelected, session }) => {
  const [emotions, setEmotions] = useState([]);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [isForced, setIsForced] = useState(false);

  useEffect(() => {
    loadEmotions();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('force:emotion', () => {
      setIsForced(true);
    });

    socket.on('session:started', () => {
      setSelectedEmotion(null);
      setIsForced(false);
    });

    return () => {
      socket.off('force:emotion');
      socket.off('session:started');
    };
  }, [socket]);

  const loadEmotions = async () => {
    try {
      const response = await getEmotionImages();
      setEmotions(response.data);
    } catch (error) {
      console.error('Error loading emotions:', error);
    }
  };

  const handleEmotionClick = (emotion) => {
    if (!session) {
      alert('No active session. Please wait for admin to start a session.');
      return;
    }

    setSelectedEmotion(emotion.name);
    setIsForced(false);

    if (socket) {
      socket.emit('emotion:selected', { emotion: emotion.name });
    }

    if (onEmotionSelected) {
      onEmotionSelected(emotion.name);
    }
  };

  if (!session) {
    return (
      <div className="emotion-selector">
        <p className="waiting-message">Waiting for session to start...</p>
      </div>
    );
  }

  return (
    <div className="emotion-selector">
      <h2>Select Your Emotion</h2>
      {isForced && (
        <div className="force-message">
          Admin has requested you to select an emotion
        </div>
      )}
      <div className="emotion-grid">
        {emotions.map((emotion) => (
          <button
            key={emotion.name}
            className={`emotion-button ${selectedEmotion === emotion.name ? 'selected' : ''}`}
            onClick={() => handleEmotionClick(emotion)}
          >
            <img src={emotion.url} alt={emotion.name} />
            <span>{emotion.name}</span>
          </button>
        ))}
      </div>
      {selectedEmotion && (
        <div className="selected-message">
          Selected: <strong>{selectedEmotion}</strong>
        </div>
      )}
    </div>
  );
};

export default EmotionSelector;

