import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './slices/sessionSlice';
import audioReducer from './slices/audioSlice';
import uiReducer from './slices/uiSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    audio: audioReducer,
    ui: uiReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['audio/setSocket', 'session/setSocket'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.socket', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['audio.socket', 'session.socket'],
      },
    }),
});

// Type definitions for TypeScript (if needed in future)
// For now, using JavaScript - types are inferred
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

