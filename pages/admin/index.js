import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSocket } from '../../hooks/useSocket';
import api from '../../lib/api';
import AdminNavbar from '../../components/AdminNavbar';
import SessionTimeline from '../../components/SessionTimeline';

const AdminDashboard = () => {
  const router = useRouter();
  const { socket, connected, session } = useSocket();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentSessions, setRecentSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [currentAudioScript, setCurrentAudioScript] = useState(null);
  const [loadingAudioScript, setLoadingAudioScript] = useState(false);
  const [prans, setPrans] = useState([]);
  const [selectedPran, setSelectedPran] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setAuthenticated(true);
    setLoading(false);
    loadLiveActivity();
    loadPrans();
  }, [router]);

  useEffect(() => {
    if (session?.pran && prans.length > 0) {
      const pran = prans.find(p => p.id === session.pran);
      setSelectedPran(pran || null);
    } else {
      setSelectedPran(null);
    }
  }, [session?.pran, prans]);

  useEffect(() => {
    if (session?.currentAudio) {
      loadAudioScript(session.currentAudio);
    } else {
      setCurrentAudioScript(null);
    }
  }, [session?.currentAudio]);

  const loadLiveActivity = async () => {
    try {
      setLoadingSessions(true);
      const [sessionsRes, statsRes] = await Promise.all([
        api.get('/api/analytics'),
        api.get('/api/analytics/stats')
      ]);
      setRecentSessions((sessionsRes.data.data || []).slice(0, 10));
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error loading live activity:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadAudioScript = async (audioPath) => {
    if (!audioPath) {
      setCurrentAudioScript(null);
      return;
    }

    try {
      setLoadingAudioScript(true);
      // Extract filename from path
      const fileName = audioPath.split('/').pop();
      
      // Get all audios and find matching one
      const response = await api.get('/api/audio');
      const audios = response.data;
      const audio = audios.find(a => 
        a.filePath === audioPath || 
        a.filePath.includes(fileName) || 
        a.fileName === fileName ||
        a.fileName.includes(fileName.replace(/\.[^/.]+$/, ''))
      );
      
      if (audio && audio.scriptText) {
        setCurrentAudioScript({
          script: audio.scriptText,
          fileName: audio.fileName,
          category: audio.category
        });
      } else {
        setCurrentAudioScript(null);
      }
    } catch (error) {
      console.error('Error loading audio script:', error);
      setCurrentAudioScript(null);
    } finally {
      setLoadingAudioScript(false);
    }
  };

  const loadPrans = async () => {
    try {
      const response = await api.get('/api/pran');
      setPrans(response.data);
    } catch (error) {
      console.error('Error loading prans:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReset = () => {
    if (socket) {
      socket.emit('reset_session');
    }
  };

  const handleForcePhase = (phase) => {
    if (socket) {
      socket.emit('force_phase', { phase });
    }
  };

  const handleAudioControl = (action) => {
    if (socket) {
      socket.emit(`audio_${action}`);
    }
  };

  const handleStartWithAge = (ageGroup) => {
    if (socket) {
      socket.emit('age_selected', { ageGroup });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-indigo-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-300 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Monitor and control the exhibition session</p>
        </div>
     
        {/* Connection Status */}
        <div className="mb-6 flex items-center justify-between">
          <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
            connected ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-red-900/50 text-red-400 border border-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'} ${connected ? 'animate-pulse' : ''}`}></div>
            <span className="text-sm font-semibold">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Session Control - At Top */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Session Control</h2>
                <p className="text-sm text-gray-400">Manage and control active session</p>
              </div>
            </div>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 ${session?.pran ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 mb-6`}>
            <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-xl p-4 border border-blue-700/50">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">Current Phase</p>
              <p className="text-2xl font-bold text-white">{session?.currentPhase || 'INIT'}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-4 border border-purple-700/50">
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">Age Group</p>
              <p className="text-2xl font-bold text-white">{session?.ageGroup || 'Not Selected'}</p>
            </div>
            <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-xl p-4 border border-green-700/50">
              <p className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1">Mood</p>
              <p className="text-2xl font-bold text-white">{session?.mood || 'Not Selected'}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-900/50 to-amber-900/50 rounded-xl p-4 border border-orange-700/50">
              <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-1">Category</p>
              <p className="text-2xl font-bold text-white">{session?.category || 'Not Selected'}</p>
            </div>
            {session?.pran && (
              <div className="bg-gradient-to-br from-pink-900/50 to-rose-900/50 rounded-xl p-4 border border-pink-700/50">
                <p className="text-xs font-semibold text-pink-400 uppercase tracking-wide mb-1">Pran Selected</p>
                <p className="text-xl font-bold text-white mb-1">Pran {session.pran}</p>
                {selectedPran && (
                  <p className="text-sm text-gray-300 italic line-clamp-2">{selectedPran.label}</p>
                )}
              </div>
            )}
          </div>

          {/* Age Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Start Session with Age Group</h3>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => handleStartWithAge('KIDS')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-lg flex items-center ${
                  session?.ageGroup === 'KIDS'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white ring-4 ring-blue-300'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                KIDS (2-9)
              </button>
              <button
                onClick={() => handleStartWithAge('PRE-TEEN')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-lg flex items-center ${
                  session?.ageGroup === 'PRE-TEEN'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-700 text-white ring-4 ring-purple-300'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                PRE-TEEN (10-14)
              </button>
              <button
                onClick={() => handleStartWithAge('TEEN+')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-lg flex items-center ${
                  session?.ageGroup === 'TEEN+'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white ring-4 ring-green-300'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:scale-105'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                TEEN+ (15+)
              </button>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all shadow-lg font-semibold flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Session
            </button>
            <button
              onClick={() => handleForcePhase('MOOD_SELECTION')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg font-semibold flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Force Mood Selection
            </button>
            <button
              onClick={() => handleForcePhase('PRAN_SELECTION')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all shadow-lg font-semibold flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Force Pran Selection
            </button>
          </div>
        </div>

        {/* Audio Control & Live Tracking - Combined */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border border-gray-700">
          {/* Audio Control Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Audio Control</h2>
                  <p className="text-sm text-gray-400">Control audio playback</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap mb-6">
              <button
                onClick={() => handleAudioControl('play')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all shadow-lg font-semibold flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Play
              </button>
              <button
                onClick={() => handleAudioControl('pause')}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:from-yellow-600 hover:to-amber-700 transform hover:scale-105 transition-all shadow-lg font-semibold flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pause
              </button>
              <button
                onClick={() => handleAudioControl('stop')}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all shadow-lg font-semibold flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Stop
              </button>
              <button
                onClick={() => handleAudioControl('restart')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg font-semibold flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Restart
              </button>
            </div>

            {/* Current Audio Display - Fully Visible */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-4 border border-indigo-700/50 mb-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">Current Audio</p>
                  <p className="text-base font-bold text-white break-words">
                    {session?.currentAudio || 'None'}
                  </p>
                  {currentAudioScript && (
                    <p className="text-xs text-gray-400 mt-1">
                      Category: <span className="font-semibold text-gray-300">{currentAudioScript.category}</span>
                    </p>
                  )}
                </div>
                {loadingAudioScript && (
                  <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </div>
              
              {/* Audio Script */}
              {currentAudioScript && currentAudioScript.script && (
                <div className="mt-4 pt-4 border-t border-indigo-700/50">
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">Audio Script</p>
                  <div className="bg-gray-900 rounded-lg p-4 border border-indigo-800/50 max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {currentAudioScript.script}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 my-8"></div>

          {/* Session Timeline - Step by Step Tracking */}
          <div>
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Live Session Tracking</h2>
                <p className="text-sm text-gray-400">Real-time session progress</p>
              </div>
            </div>
            <SessionTimeline currentPhase={session?.currentPhase} session={session} selectedPran={selectedPran} showHeader={false} />
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-sm font-medium opacity-90 mb-2">Total Sessions</div>
              <div className="text-4xl font-bold">{stats.total || 0}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-sm font-medium opacity-90 mb-2">Recent (7 days)</div>
              <div className="text-4xl font-bold">{stats.recentSessions || 0}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-sm font-medium opacity-90 mb-2">Age Groups</div>
              <div className="text-4xl font-bold">{Object.keys(stats.ageGroupDistribution || {}).length}</div>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-sm font-medium opacity-90 mb-2">Moods Tracked</div>
              <div className="text-4xl font-bold">{Object.keys(stats.moodDistribution || {}).length}</div>
            </div>
          </div>
        )}

        {/* Live Activity */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Live Activity</h2>
                <p className="text-sm text-gray-400">Recent session completions</p>
              </div>
            </div>
            <button
              onClick={loadLiveActivity}
              className="px-4 py-2 text-sm font-medium text-indigo-400 bg-indigo-900/50 rounded-lg hover:bg-indigo-900/70 transition-all border border-indigo-700/50"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {loadingSessions ? (
            <div className="text-center py-8">
              <svg className="animate-spin h-8 w-8 text-indigo-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-400">Loading activity...</p>
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No recent sessions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.slice(0, 10).map((s, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {s.ageGroup?.[0] || '?'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs font-semibold border border-purple-700/50">{s.ageGroup || 'N/A'}</span>
                        <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs font-semibold border border-blue-700/50">{s.mood || 'N/A'}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                          s.category === 'NEGATIVE' ? 'bg-red-900/50 text-red-300 border-red-700/50' :
                          s.category === 'POSITIVE' ? 'bg-green-900/50 text-green-300 border-green-700/50' :
                          'bg-amber-900/50 text-amber-300 border-amber-700/50'
                        }`}>
                          {s.category || 'N/A'}
                        </span>
                        {s.pran && (
                          <span className="px-2 py-1 bg-pink-900/50 text-pink-300 rounded text-xs font-bold border border-pink-700/50">Pran {s.pran}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(s.completedAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Navigation */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-700">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Content Management</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => router.push('/admin/audio')}
              className="group bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-8 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-white bg-opacity-20 rounded-xl">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Audio Management</h3>
              <p className="text-indigo-100 text-sm">Manage audio files and scripts</p>
            </button>
            
            <button
              onClick={() => router.push('/admin/images')}
              className="group bg-gradient-to-br from-pink-500 to-rose-600 text-white p-8 rounded-xl hover:from-pink-600 hover:to-rose-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-white bg-opacity-20 rounded-xl">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Image Management</h3>
              <p className="text-pink-100 text-sm">Upload and manage images</p>
            </button>
            
            <button
              onClick={() => router.push('/admin/pran')}
              className="group bg-gradient-to-br from-purple-500 to-violet-600 text-white p-8 rounded-xl hover:from-purple-600 hover:to-violet-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-white bg-opacity-20 rounded-xl">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Pran Management</h3>
              <p className="text-purple-100 text-sm">Manage pran selections</p>
            </button>
            
            <button
              onClick={() => router.push('/admin/analytics')}
              className="group bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8 rounded-xl hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-white bg-opacity-20 rounded-xl">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Analytics</h3>
              <p className="text-emerald-100 text-sm">View session analytics and insights</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

