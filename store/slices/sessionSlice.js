import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  socket: null,
  connected: false,
  session: null, // Session data from backend
  ageGroup: null,
  mood: null,
  category: null,
  pran: null,
  currentPhase: 'INIT',
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
    setSession: (state, action) => {
      state.session = action.payload;
      // Sync session data to individual fields
      if (action.payload) {
        state.ageGroup = action.payload.ageGroup;
        state.mood = action.payload.mood;
        state.category = action.payload.category;
        state.pran = action.payload.pran;
        state.currentPhase = action.payload.currentPhase || state.currentPhase;
      }
    },
    setAgeGroup: (state, action) => {
      state.ageGroup = action.payload;
      if (state.session) {
        state.session.ageGroup = action.payload;
      }
    },
    setMood: (state, action) => {
      state.mood = action.payload;
      if (state.session) {
        state.session.mood = action.payload;
      }
    },
    setCategory: (state, action) => {
      state.category = action.payload;
      if (state.session) {
        state.session.category = action.payload;
      }
    },
    setPran: (state, action) => {
      state.pran = action.payload;
      if (state.session) {
        state.session.pran = action.payload;
      }
    },
    setCurrentPhase: (state, action) => {
      state.currentPhase = action.payload;
      if (state.session) {
        state.session.currentPhase = action.payload;
      }
    },
    resetSession: (state) => {
      state.ageGroup = null;
      state.mood = null;
      state.category = null;
      state.pran = null;
      state.currentPhase = 'INIT';
      if (state.session) {
        state.session.ageGroup = null;
        state.session.mood = null;
        state.session.category = null;
        state.session.pran = null;
        state.session.currentPhase = 'INIT';
      }
    },
  },
});

export const {
  setSocket,
  setConnected,
  setSession,
  setAgeGroup,
  setMood,
  setCategory,
  setPran,
  setCurrentPhase,
  resetSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;

