import { useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import EmotionSelector from './EmotionSelector';
import PranSelector from './PranSelector';
import './TableScreen.css';

const TableScreen = () => {
  const { socket, isConnected, session } = useWebSocket('table');
  const [selectedEmotion, setSelectedEmotion] = useState(null);

  const handleEmotionSelected = (emotion) => {
    setSelectedEmotion(emotion);
  };

  const handlePranSelected = (pran) => {
    // Pran selection handled by component
  };

  return (
    <div className="table-screen">
      <div className="table-header">
        <h1>Table Screen</h1>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="table-content">
        <div className="selector-section">
          <EmotionSelector
            socket={socket}
            onEmotionSelected={handleEmotionSelected}
            session={session}
          />
        </div>

        <div className="selector-section">
          <PranSelector
            socket={socket}
            onPranSelected={handlePranSelected}
            session={session}
            selectedEmotion={selectedEmotion}
          />
        </div>
      </div>

      <div className="table-info">
        {session && (
          <>
            <p>Session ID: {session.sessionId}</p>
            <p>Age Group: {session.ageGroup}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default TableScreen;

