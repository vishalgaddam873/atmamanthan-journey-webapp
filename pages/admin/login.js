import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setAuthenticated, setAdminToken } from '../../store/slices/adminSlice';

const AdminLogin = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.admin.isAuthenticated);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      dispatch(setAdminToken(token));
      dispatch(setAuthenticated(true));
      router.push('/admin');
    }
  }, [router, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/admin/login', {
        username,
        password,
      });

      const token = response.data.token;
      localStorage.setItem('admin_token', token);
      dispatch(setAdminToken(token));
      dispatch(setAuthenticated(true));
      router.push('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ 
        background: 'linear-gradient(135deg, #6B3E2E 0%, #8B4E3A 25%, #6B3E2E 50%, #5A3428 75%, #6B3E2E 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 15s ease infinite',
      }}
    >
      <div 
        className="w-full max-w-md p-10 rounded-2xl shadow-2xl transform transition-all"
        style={{
          backgroundColor: 'rgba(255, 245, 230, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="text-center mb-8">
          {/* Lock Icon */}
          <div 
            className="inline-block p-4 rounded-full mb-4"
            style={{
              backgroundColor: 'rgba(255, 190, 70, 0.2)',
            }}
          >
            <svg 
              className="w-12 h-12" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: '#6B3E2E' }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
          
          {/* Title */}
          <h1 
            className="text-4xl font-bold mb-2"
            style={{ color: '#6B3E2E' }}
          >
            Admin Login
          </h1>
          
          {/* Subtitle */}
          <p style={{ color: 'rgba(107, 62, 46, 0.7)' }}>
            Enter your credentials to continue
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: '#6B3E2E' }}
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg 
                  className="h-5 w-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: 'rgba(107, 62, 46, 0.5)' }}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '2px solid rgba(107, 62, 46, 0.2)',
                  color: '#6B3E2E',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 190, 70, 0.6)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 190, 70, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(107, 62, 46, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Enter username"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: '#6B3E2E' }}
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg 
                  className="h-5 w-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: 'rgba(107, 62, 46, 0.5)' }}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '2px solid rgba(107, 62, 46, 0.2)',
                  color: '#6B3E2E',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 190, 70, 0.6)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 190, 70, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(107, 62, 46, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Enter password"
                required
              />
            </div>
          </div>
          
          {error && (
            <div 
              className="mb-4 p-3 border-l-4 rounded-lg text-sm flex items-center"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: '#ef4444',
                color: '#dc2626',
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-4 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: loading ? 'rgba(107, 62, 46, 0.5)' : 'rgba(255, 190, 70, 1)',
              color: '#6B3E2E',
              boxShadow: loading 
                ? 'none' 
                : '0 10px 30px rgba(255, 190, 70, 0.4), 0 0 20px rgba(255, 190, 70, 0.2)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 190, 70, 0.6), 0 0 30px rgba(255, 190, 70, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 190, 70, 0.4), 0 0 20px rgba(255, 190, 70, 0.2)';
              }
            }}
          >
            {/* Shine effect overlay */}
            {!loading && (
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
                }}
              />
            )}
            
            {loading ? (
              <span className="relative z-10 flex items-center justify-center">
                <svg 
                  className="animate-spin -ml-1 mr-3 h-5 w-5" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  style={{ color: '#6B3E2E' }}
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              <span className="relative z-10">Login</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
