import { useState } from 'react';
import './Admin.css';

const SessionHistory = ({ sessions, onRefresh }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAgeGroup, setFilterAgeGroup] = useState('all');

  const filteredSessions = sessions.filter((session) => {
    if (filterStatus !== 'all' && session.status !== filterStatus) {
      return false;
    }
    if (filterAgeGroup !== 'all' && session.ageGroup !== filterAgeGroup) {
      return false;
    }
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="session-history">
      <div className="history-header">
        <h2>Session History</h2>
        <button className="btn btn-secondary" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="stopped">Stopped</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Age Group:</label>
          <select value={filterAgeGroup} onChange={(e) => setFilterAgeGroup(e.target.value)}>
            <option value="all">All</option>
            <option value="Kids">Kids</option>
            <option value="PreTeens">PreTeens</option>
            <option value="TeenPlus">TeenPlus</option>
          </select>
        </div>
      </div>

      <div className="sessions-table">
        <table>
          <thead>
            <tr>
              <th>Session ID</th>
              <th>Age Group</th>
              <th>Status</th>
              <th>Emotion</th>
              <th>Pran</th>
              <th>Duration</th>
              <th>Start Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  No sessions found
                </td>
              </tr>
            ) : (
              filteredSessions.map((session) => (
                <tr key={session._id}>
                  <td>{session.sessionId}</td>
                  <td>{session.ageGroup}</td>
                  <td>
                    <span className={`status-badge status-${session.status}`}>
                      {session.status}
                    </span>
                  </td>
                  <td>{session.emotion || 'N/A'}</td>
                  <td>{session.pran || 'N/A'}</td>
                  <td>{formatDuration(session.duration)}</td>
                  <td>{formatDate(session.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SessionHistory;

