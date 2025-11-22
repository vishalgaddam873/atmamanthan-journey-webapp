import './Admin.css';

const Analytics = ({ analytics, onRefresh }) => {
  if (!analytics) {
    return (
      <div className="analytics">
        <p>Loading analytics...</p>
      </div>
    );
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h2>Analytics</h2>
        <button className="btn btn-secondary" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      <div className="analytics-grid">
        <div className="stat-card">
          <h3>Total Sessions</h3>
          <p className="stat-value">{analytics.totalSessions}</p>
        </div>

        <div className="stat-card">
          <h3>Completed Sessions</h3>
          <p className="stat-value">{analytics.completedSessions}</p>
        </div>

        <div className="stat-card">
          <h3>Average Duration</h3>
          <p className="stat-value">{formatDuration(analytics.averageDuration)}</p>
        </div>
      </div>

      <div className="analytics-section">
        <h3>Emotion Distribution</h3>
        <div className="distribution-list">
          {analytics.emotionDistribution && analytics.emotionDistribution.length > 0 ? (
            analytics.emotionDistribution.map((item) => (
              <div key={item._id} className="distribution-item">
                <span className="distribution-label">{item._id}:</span>
                <div className="distribution-bar">
                  <div
                    className="distribution-fill"
                    style={{ width: `${(item.count / analytics.totalSessions) * 100}%` }}
                  />
                </div>
                <span className="distribution-count">{item.count}</span>
              </div>
            ))
          ) : (
            <p>No emotion data available</p>
          )}
        </div>
      </div>

      <div className="analytics-section">
        <h3>Category Distribution</h3>
        <div className="distribution-list">
          {analytics.categoryDistribution && analytics.categoryDistribution.length > 0 ? (
            analytics.categoryDistribution.map((item) => (
              <div key={item._id} className="distribution-item">
                <span className="distribution-label">{item._id}:</span>
                <div className="distribution-bar">
                  <div
                    className="distribution-fill"
                    style={{ width: `${(item.count / analytics.totalSessions) * 100}%` }}
                  />
                </div>
                <span className="distribution-count">{item.count}</span>
              </div>
            ))
          ) : (
            <p>No category data available</p>
          )}
        </div>
      </div>

      <div className="analytics-section">
        <h3>Sessions Per Day (Last 30 Days)</h3>
        <div className="sessions-chart">
          {analytics.sessionsPerDay && analytics.sessionsPerDay.length > 0 ? (
            analytics.sessionsPerDay.map((item) => (
              <div key={item._id} className="chart-item">
                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{ height: `${(item.count / Math.max(...analytics.sessionsPerDay.map(d => d.count))) * 200}px` }}
                  />
                </div>
                <span className="chart-label">{item._id}</span>
                <span className="chart-count">{item.count}</span>
              </div>
            ))
          ) : (
            <p>No session data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

