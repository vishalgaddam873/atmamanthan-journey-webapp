import '../styles/globals.css';
import { Provider } from 'react-redux';
import { store } from '../store';
import { useEffect } from 'react';
import getAudioPermissionManager from '../lib/audioPermissions';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Initialize audio permissions on app load
    // This will unlock audio on first user interaction
    const audioPermissionManager = getAudioPermissionManager();
    
    // Force unlock if needed (optional - can be removed if you want strict user interaction requirement)
    // audioPermissionManager.forceUnlock();
    
    // Cleanup on unmount
    return () => {
      // Note: We don't cleanup the singleton, but we could if needed
    };
  }, []);

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

