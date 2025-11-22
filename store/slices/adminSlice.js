import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  adminToken: null,
  // Audio management
  audios: [],
  selectedCategory: 'COMMON',
  editingAudio: null,
  // Image management
  images: [],
  imageFilters: {
    category: '',
    ageGroup: '',
    type: '',
  },
  uploadData: {
    category: 'NEGATIVE',
    ageGroup: 'KIDS',
    type: 'NEG-EMOTION',
  },
  // Pran management
  prans: [],
  editingPran: null,
  showCreatePran: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setAdminToken: (state, action) => {
      state.adminToken = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.adminToken = null;
    },
    
    // Audio management
    setAudios: (state, action) => {
      state.audios = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setEditingAudio: (state, action) => {
      state.editingAudio = action.payload;
    },
    clearEditingAudio: (state) => {
      state.editingAudio = null;
    },
    
    // Image management
    setImages: (state, action) => {
      state.images = action.payload;
    },
    setImageFilters: (state, action) => {
      state.imageFilters = { ...state.imageFilters, ...action.payload };
    },
    setUploadData: (state, action) => {
      state.uploadData = { ...state.uploadData, ...action.payload };
    },
    
    // Pran management
    setPrans: (state, action) => {
      state.prans = action.payload;
    },
    setEditingPran: (state, action) => {
      state.editingPran = action.payload;
    },
    clearEditingPran: (state) => {
      state.editingPran = null;
    },
    setShowCreatePran: (state, action) => {
      state.showCreatePran = action.payload;
    },
  },
});

export const {
  setAuthenticated,
  setAdminToken,
  logout,
  setAudios,
  setSelectedCategory,
  setEditingAudio,
  clearEditingAudio,
  setImages,
  setImageFilters,
  setUploadData,
  setPrans,
  setEditingPran,
  clearEditingPran,
  setShowCreatePran,
} = adminSlice.actions;

export default adminSlice.reducer;

