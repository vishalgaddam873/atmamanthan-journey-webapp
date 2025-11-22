import { useState, useEffect } from 'react';
import { getPranOptions } from '../../services/api';
import { getEmotionCategory, getPranOptions as getLocalPranOptions } from '../../utils/emotionCategories';
import './TableScreen.css';

const PranSelector = ({ socket, onPranSelected, session, selectedEmotion }) => {
  const [pranOptions, setPranOptions] = useState([]);
  const [selectedPran, setSelectedPran] = useState(null);
  const [isForced, setIsForced] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    if (selectedEmotion) {
      const category = getEmotionCategory(selectedEmotion);
      if (category) {
        const options = getLocalPranOptions(category);
        setPranOptions(options);
        setShowSelector(true);
      }
    } else {
      setShowSelector(false);
      setSelectedPran(null);
    }
  }, [selectedEmotion]);

  useEffect(() => {
    if (!socket) return;

    socket.on('force:pran', () => {
      setIsForced(true);
    });

    socket.on('session:started', () => {
      setSelectedPran(null);
      setIsForced(false);
      setShowSelector(false);
    });

    return () => {
      socket.off('force:pran');
      socket.off('session:started');
    };
  }, [socket]);

  const handlePranClick = (pran) => {
    if (!session) {
      alert('No active session. Please wait for admin to start a session.');
      return;
    }

    setSelectedPran(pran);
    setIsForced(false);

    if (socket) {
      socket.emit('pran:selected', { pran });
    }

    if (onPranSelected) {
      onPranSelected(pran);
    }
  };

  if (!showSelector) {
    return (
      <div className="pran-selector">
        <p className="waiting-message">
          {selectedEmotion ? 'Loading pran options...' : 'Please select an emotion first'}
        </p>
      </div>
    );
  }

  return (
    <div className="pran-selector">
      <h2>Select Your Pran (Promise)</h2>
      {isForced && (
        <div className="force-message">
          Admin has requested you to select a pran
        </div>
      )}
      <div className="pran-list">
        {pranOptions.map((pran, index) => (
          <button
            key={index}
            className={`pran-button ${selectedPran === pran ? 'selected' : ''}`}
            onClick={() => handlePranClick(pran)}
          >
            {pran}
          </button>
        ))}
      </div>
      {selectedPran && (
        <div className="selected-message">
          Selected: <strong>{selectedPran}</strong>
        </div>
      )}
    </div>
  );
};

export default PranSelector;

