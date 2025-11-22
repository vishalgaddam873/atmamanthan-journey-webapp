import { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { getAllSessions, getAnalytics } from '../../services/api';
import SessionControl from './SessionControl';
import Analytics from './Analytics';
import SessionHistory from './SessionHistory';
import './Admin.css';

const AdminDashboard = () => {
  const { socket, isConnected } = useWebSocket('admin');
  const [activeTab, setActiveTab] = useState('control');
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    if (socket) {
      socket.on('session:started', (data) => {
        setCurrentSession(data);
        loadSessions();
      });

      socket.on('session:stopped', () => {
        setCurrentSession(null);
        loadSessions();
      });

      socket.on('session:updated', (data) => {
        setCurrentSession(data);
      });

      // Request current session status
      socket.emit('session:status');
    }

    loadSessions();
    loadAnalytics();
  }, [socket]);

  const loadSessions = async () => {
    try {
      const response = await getAllSessions();
      setSessions(response.data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'control' ? 'active' : ''}`}
          onClick={() => setActiveTab('control')}
        >
          Session Control
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Session History
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'control' && (
          <SessionControl
            socket={socket}
            currentSession={currentSession}
            onSessionUpdate={loadSessions}
          />
        )}
        {activeTab === 'history' && (
          <SessionHistory
            sessions={sessions}
            onRefresh={loadSessions}
          />
        )}
        {activeTab === 'analytics' && (
          <Analytics
            analytics={analytics}
            onRefresh={loadAnalytics}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

