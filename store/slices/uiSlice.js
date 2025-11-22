import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Mirror screen state
  showImages: false,
  imageType: null,
  fadeIn: false,
  showMirrorReflection: false,
  showLightAnimation: false,
  showParticles: false,
  lightIntensity: 0.5,
  dialogueText: null,
  showDialogue: false,
  
  // Table screen state
  showPranSelection: false,
  showCelebration: false,
  
  // Loading states
  loading: false,
  loadingMessage: null,
  
  // Error states
  error: null,
  errorMessage: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Mirror screen actions
    setShowImages: (state, action) => {
      state.showImages = action.payload;
    },
    setImageType: (state, action) => {
      state.imageType = action.payload;
    },
    setFadeIn: (state, action) => {
      state.fadeIn = action.payload;
    },
    setShowMirrorReflection: (state, action) => {
      state.showMirrorReflection = action.payload;
    },
    setShowLightAnimation: (state, action) => {
      state.showLightAnimation = action.payload;
    },
    setShowParticles: (state, action) => {
      state.showParticles = action.payload;
    },
    setLightIntensity: (state, action) => {
      state.lightIntensity = action.payload;
    },
    setDialogueText: (state, action) => {
      state.dialogueText = action.payload;
    },
    setShowDialogue: (state, action) => {
      state.showDialogue = action.payload;
    },
    resetMirrorState: (state) => {
      state.showImages = false;
      state.imageType = null;
      state.fadeIn = false;
      state.showMirrorReflection = false;
      state.showLightAnimation = false;
      state.showParticles = false;
      state.lightIntensity = 0.5;
      state.dialogueText = null;
      state.showDialogue = false;
    },
    
    // Table screen actions
    setShowPranSelection: (state, action) => {
      state.showPranSelection = action.payload;
    },
    setShowCelebration: (state, action) => {
      state.showCelebration = action.payload;
    },
    
    // Loading actions
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setLoadingMessage: (state, action) => {
      state.loadingMessage = action.payload;
    },
    
    // Error actions
    setError: (state, action) => {
      state.error = action.payload;
    },
    setErrorMessage: (state, action) => {
      state.errorMessage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.errorMessage = null;
    },
  },
});

export const {
  setShowImages,
  setImageType,
  setFadeIn,
  setShowMirrorReflection,
  setShowLightAnimation,
  setShowParticles,
  setLightIntensity,
  setDialogueText,
  setShowDialogue,
  resetMirrorState,
  setShowPranSelection,
  setShowCelebration,
  setLoading,
  setLoadingMessage,
  setError,
  setErrorMessage,
  clearError,
} = uiSlice.actions;

export default uiSlice.reducer;

