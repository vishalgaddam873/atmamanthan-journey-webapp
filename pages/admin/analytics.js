import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import AdminNavbar from '../../components/AdminNavbar';

const AdminAnalytics = () => {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setAuthenticated(true);
    loadAnalytics();
  }, [router, filter]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [statsRes, sessionsRes] = await Promise.all([
        api.get('/api/analytics/stats', { params: filter }),
        api.get('/api/analytics', { params: filter })
      ]);
      
      setStats(statsRes.data.stats);
      setSessions(sessionsRes.data.data || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const getMaxValue = (obj) => {
    return Math.max(...Object.values(obj));
  };

  if (!authenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Analytics Dashboard</h1>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-end bg-gray-800 rounded-xl shadow-md p-5 border border-gray-700">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={filter.startDate}
                  onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={filter.endDate}
                  onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <button
              onClick={() => setFilter({ startDate: '', endDate: '' })}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-all font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        {stats && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-sm font-medium opacity-90 mb-2">Total Sessions</div>
                <div className="text-5xl font-bold">{stats.total || 0}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-sm font-medium opacity-90 mb-2">Recent (7 days)</div>
                <div className="text-5xl font-bold">{stats.recentSessions || 0}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-sm font-medium opacity-90 mb-2">Age Groups</div>
                <div className="text-5xl font-bold">{Object.keys(stats.ageGroupDistribution || {}).length}</div>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-sm font-medium opacity-90 mb-2">Moods Tracked</div>
                <div className="text-5xl font-bold">{Object.keys(stats.moodDistribution || {}).length}</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Age Group Distribution */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">Age Group Distribution</h2>
                <div className="space-y-5">
                  {Object.entries(stats.ageGroupDistribution || {}).map(([ageGroup, count]) => {
                    const percentage = getPercentage(count, stats.total);
                    const maxValue = getMaxValue(stats.ageGroupDistribution || {});
                    const width = maxValue > 0 ? (count / maxValue) * 100 : 0;
                    
                    return (
                      <div key={ageGroup}>
                        <div className="flex justify-between items-center text-white mb-2">
                          <span className="font-semibold text-lg">{ageGroup}</span>
                          <span className="text-sm font-medium text-gray-400">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-700 shadow-sm"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(stats.ageGroupDistribution || {}).length === 0 && (
                    <div className="text-center py-8 text-gray-400">No data available</div>
                  )}
                </div>
              </div>

              {/* Mood Distribution */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">Mood Distribution</h2>
                <div className="space-y-5">
                  {Object.entries(stats.moodDistribution || {}).map(([mood, count]) => {
                    const percentage = getPercentage(count, stats.total);
                    const maxValue = getMaxValue(stats.moodDistribution || {});
                    const width = maxValue > 0 ? (count / maxValue) * 100 : 0;
                    
                    const moodColors = {
                      'ANXIETY': 'from-emerald-500 to-teal-600',
                      'SAD': 'from-blue-500 to-blue-600',
                      'ANGRY': 'from-red-500 to-red-600',
                      'HAPPY': 'from-orange-400 to-yellow-500',
                      'LOVE': 'from-pink-500 to-fuchsia-600',
                      'CONFUSED': 'from-amber-500 to-orange-600'
                    };
                    
                    return (
                      <div key={mood}>
                        <div className="flex justify-between items-center text-white mb-2">
                          <span className="font-semibold text-lg">{mood}</span>
                          <span className="text-sm font-medium text-gray-400">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                          <div
                            className={`h-full bg-gradient-to-r ${moodColors[mood] || 'from-gray-500 to-gray-600'} rounded-full transition-all duration-700 shadow-sm`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(stats.moodDistribution || {}).length === 0 && (
                    <div className="text-center py-8 text-gray-400">No data available</div>
                  )}
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">Category Distribution</h2>
                <div className="space-y-5">
                  {Object.entries(stats.categoryDistribution || {}).map(([category, count]) => {
                    const percentage = getPercentage(count, stats.total);
                    const maxValue = getMaxValue(stats.categoryDistribution || {});
                    const width = maxValue > 0 ? (count / maxValue) * 100 : 0;
                    
                    const categoryColors = {
                      'NEGATIVE': 'from-red-500 to-red-600',
                      'POSITIVE': 'from-green-500 to-green-600',
                      'NEUTRAL': 'from-amber-500 to-orange-600'
                    };
                    
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center text-white mb-2">
                          <span className="font-semibold text-lg">{category}</span>
                          <span className="text-sm font-medium text-gray-400">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                          <div
                            className={`h-full bg-gradient-to-r ${categoryColors[category] || 'from-gray-500 to-gray-600'} rounded-full transition-all duration-700 shadow-sm`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(stats.categoryDistribution || {}).length === 0 && (
                    <div className="text-center py-8 text-gray-400">No data available</div>
                  )}
                </div>
              </div>

              {/* Pran Distribution */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">Pran Selection Distribution</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.entries(stats.pranDistribution || {})
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([pran, count]) => {
                      const percentage = getPercentage(count, stats.total);
                      
                      return (
                        <div key={pran} className="bg-gradient-to-br from-purple-900/80 to-violet-900/80 rounded-lg p-4 text-center border border-purple-500 hover:shadow-md hover:border-purple-400 transition-shadow">
                          <div className="text-xl font-bold text-white mb-1">Pran {pran}</div>
                          <div className="text-2xl text-purple-300 font-bold mb-1">{count}</div>
                          <div className="text-xs text-purple-200 font-medium">{percentage}%</div>
                        </div>
                      );
                    })}
                  {Object.keys(stats.pranDistribution || {}).length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-400">No data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Daily Stats */}
            {stats.dailyStats && Object.keys(stats.dailyStats).length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Daily Sessions (Last 7 Days)</h2>
                <div className="flex items-end gap-3 h-64">
                  {Object.entries(stats.dailyStats).map(([date, count]) => {
                    const maxCount = Math.max(...Object.values(stats.dailyStats));
                    const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    const dateObj = new Date(date);
                    const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
                    
                    return (
                      <div key={date} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex flex-col items-center justify-end h-full mb-2">
                          <div
                            className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all duration-500 hover:from-purple-600 hover:to-purple-500 shadow-md hover:shadow-lg cursor-pointer"
                            style={{ height: `${height}%`, minHeight: count > 0 ? '8px' : '0' }}
                            title={`${date}: ${count} sessions`}
                          />
                        </div>
                        <div className="text-xs text-gray-300 text-center">
                          <div className="font-semibold mb-1">{dayName}</div>
                          <div className="text-purple-600 font-bold text-sm">{count}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Sessions Table */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Sessions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b-2 border-gray-600">
                      <th className="text-left py-4 px-4 font-semibold text-gray-300">Date</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-300">Age Group</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-300">Mood</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-300">Category</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-300">Pran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.slice(0, 20).map((session, index) => (
                      <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                        <td className="py-4 px-4 text-sm text-gray-300">{formatDate(session.completedAt)}</td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1.5 bg-purple-900/50 text-purple-300 rounded-lg text-sm font-medium border border-purple-700/50">{session.ageGroup}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1.5 bg-blue-900/50 text-blue-300 rounded-lg text-sm font-medium border border-blue-700/50">{session.mood}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                            session.category === 'NEGATIVE' ? 'bg-red-900/50 text-red-300 border-red-700/50' :
                            session.category === 'POSITIVE' ? 'bg-green-900/50 text-green-300 border-green-700/50' :
                            'bg-amber-900/50 text-amber-300 border-amber-700/50'
                          }`}>
                            {session.category}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1.5 bg-pink-900/50 text-pink-300 rounded-lg text-sm font-bold border border-pink-700/50">Pran {session.pran}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sessions.length === 0 && (
                  <div className="text-center py-12 text-gray-400">No sessions found</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
