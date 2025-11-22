import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentAudio: null,
  currentAudioId: null,
  audioQueue: [],
  currentQueueIndex: 0,
  queueLoaded: false,
  isPlaying: false,
  isPaused: false,
  waitingForMoodSelection: false,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setCurrentAudio: (state, action) => {
      state.currentAudio = action.payload;
    },
    setCurrentAudioId: (state, action) => {
      state.currentAudioId = action.payload;
    },
    setAudioQueue: (state, action) => {
      state.audioQueue = action.payload;
    },
    setCurrentQueueIndex: (state, action) => {
      state.currentQueueIndex = action.payload;
    },
    incrementQueueIndex: (state) => {
      state.currentQueueIndex += 1;
    },
    setQueueLoaded: (state, action) => {
      state.queueLoaded = action.payload;
    },
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setIsPaused: (state, action) => {
      state.isPaused = action.payload;
    },
    setWaitingForMoodSelection: (state, action) => {
      state.waitingForMoodSelection = action.payload;
    },
    resetAudioQueue: (state) => {
      state.audioQueue = [];
      state.currentQueueIndex = 0;
      state.queueLoaded = false;
      state.currentAudio = null;
      state.currentAudioId = null;
    },
    clearCurrentAudio: (state) => {
      state.currentAudio = null;
      state.currentAudioId = null;
    },
  },
});

export const {
  setCurrentAudio,
  setCurrentAudioId,
  setAudioQueue,
  setCurrentQueueIndex,
  incrementQueueIndex,
  setQueueLoaded,
  setIsPlaying,
  setIsPaused,
  setWaitingForMoodSelection,
  resetAudioQueue,
  clearCurrentAudio,
} = audioSlice.actions;

export default audioSlice.reducer;

