import { useState } from 'react';
import './Admin.css';

const SessionControl = ({ socket, currentSession, onSessionUpdate }) => {
  const [ageGroup, setAgeGroup] = useState('Kids');
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const handleStartSession = () => {
    if (!socket || !socket.connected) {
      alert('Not connected to server');
      return;
    }

    setIsStarting(true);
    socket.emit('session:start', { ageGroup }, (response) => {
      setIsStarting(false);
      if (response && response.error) {
        alert('Error starting session: ' + response.error);
      } else {
        if (onSessionUpdate) {
          onSessionUpdate();
        }
      }
    });
  };

  const handleStopSession = () => {
    if (!socket || !socket.connected) {
      alert('Not connected to server');
      return;
    }

    if (!currentSession) {
      alert('No active session to stop');
      return;
    }

    setIsStopping(true);
    socket.emit('session:stop', (response) => {
      setIsStopping(false);
      if (response && response.error) {
        alert('Error stopping session: ' + response.error);
      } else {
        if (onSessionUpdate) {
          onSessionUpdate();
        }
      }
    });
  };

  const handleForceEmotion = () => {
    if (!socket || !socket.connected) {
      alert('Not connected to server');
      return;
    }

    socket.emit('admin:force:emotion');
  };

  const handleForcePran = () => {
    if (!socket || !socket.connected) {
      alert('Not connected to server');
      return;
    }

    socket.emit('admin:force:pran');
  };

  return (
    <div className="session-control">
      <div className="control-section">
        <h2>Start Session</h2>
        <div className="form-group">
          <label>Age Group:</label>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            disabled={!!currentSession}
          >
            <option value="Kids">Kids</option>
            <option value="PreTeens">PreTeens</option>
            <option value="TeenPlus">TeenPlus</option>
          </select>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleStartSession}
          disabled={isStarting || !!currentSession}
        >
          {isStarting ? 'Starting...' : 'Start Session'}
        </button>
      </div>

      {currentSession && (
        <div className="control-section">
          <h2>Active Session</h2>
          <div className="session-info">
            <p><strong>Session ID:</strong> {currentSession.sessionId}</p>
            <p><strong>Age Group:</strong> {currentSession.ageGroup}</p>
            <p><strong>Status:</strong> {currentSession.status}</p>
            <p><strong>Current Step:</strong> {currentSession.currentStep}</p>
            {currentSession.emotion && (
              <p><strong>Emotion:</strong> {currentSession.emotion}</p>
            )}
            {currentSession.pran && (
              <p><strong>Pran:</strong> {currentSession.pran}</p>
            )}
          </div>

          <div className="control-actions">
            <button
              className="btn btn-secondary"
              onClick={handleForceEmotion}
              disabled={isStopping}
            >
              Force Emotion Selection
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleForcePran}
              disabled={isStopping}
            >
              Force Pran Selection
            </button>
            <button
              className="btn btn-danger"
              onClick={handleStopSession}
              disabled={isStopping}
            >
              {isStopping ? 'Stopping...' : 'Stop Session'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionControl;

