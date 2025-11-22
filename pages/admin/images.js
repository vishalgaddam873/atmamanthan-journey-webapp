import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import AdminNavbar from '../../components/AdminNavbar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const ImageManagement = () => {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    ageGroup: '',
    type: '',
  });
  const [uploadData, setUploadData] = useState({
    category: 'NEGATIVE',
    ageGroup: '4-9',
    type: 'POS-EMOTION',
    displayOrder: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadImages();
  }, [router, filters]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.ageGroup) params.ageGroup = filters.ageGroup;
      if (filters.type) params.type = filters.type;

      const response = await api.get('/api/images', { params });
      console.log('Loaded images:', response.data);
      console.log('API Base URL:', API_BASE_URL);
      console.log('Frontend running on:', typeof window !== 'undefined' ? window.location.origin : 'SSR');
      setImages(response.data);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickUpload = async (file, category, ageGroup, type) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);
    formData.append('ageGroup', ageGroup);
    formData.append('type', type);

    try {
      const uploadResponse = await api.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Create image record
      await api.post('/api/images', {
        category: category,
        ageGroup: ageGroup,
        type: type,
        filePath: uploadResponse.data.filePath,
        fileName: uploadResponse.data.fileName,
      });

      loadImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', uploadData.category);
    formData.append('ageGroup', uploadData.ageGroup);
    formData.append('type', uploadData.type);

    try {
      const uploadResponse = await api.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Create image record
      await api.post('/api/images', {
        category: uploadData.category,
        ageGroup: uploadData.ageGroup,
        type: uploadData.type,
        filePath: uploadResponse.data.filePath,
        fileName: uploadResponse.data.fileName,
        displayOrder: parseInt(uploadData.displayOrder) || 0,
      });

      loadImages();
      e.target.value = ''; // Reset file input
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await api.delete(`/api/images/${id}`);
      loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleUpdateDisplayOrder = async (id, newOrder) => {
    try {
      await api.put(`/api/images/${id}`, {
        displayOrder: parseInt(newOrder) || 0
      });
      loadImages();
    } catch (error) {
      console.error('Error updating display order:', error);
      alert('Error updating display order: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">
            Image Management
          </h1>
          <p className="text-gray-500">Upload and manage exhibition images</p>
        </div>

        {/* Quick Upload for Emotion Images */}
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-xl p-6 lg:p-8 mb-6 text-white">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gray-800 bg-opacity-20 rounded-xl mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Quick Upload: Emotion Images</h2>
              <p className="text-pink-100 text-sm mt-1">Upload emotion images (defaults to 4-9 age group, change in General Upload)</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
              <label className="block text-sm font-semibold mb-3 text-white">Negative Emotion</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleQuickUpload(file, 'NEGATIVE', '4-9', 'POS-EMOTION');
                    e.target.value = '';
                  }
                }}
                disabled={uploading}
                className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:bg-opacity-20 file:text-white hover:file:bg-opacity-30 cursor-pointer"
              />
            </div>
            
            <div className="bg-gray-800 bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
              <label className="block text-sm font-semibold mb-3 text-white">Positive Emotion</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleQuickUpload(file, 'POSITIVE', '4-9', 'POS-EMOTION');
                    e.target.value = '';
                  }
                }}
                disabled={uploading}
                className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:bg-opacity-20 file:text-white hover:file:bg-opacity-30 cursor-pointer"
              />
            </div>
            
            <div className="bg-gray-800 bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
              <label className="block text-sm font-semibold mb-3 text-white">Neutral Emotion</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleQuickUpload(file, 'NEUTRAL', '4-9', 'POS-EMOTION');
                    e.target.value = '';
                  }
                }}
                disabled={uploading}
                className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:bg-opacity-20 file:text-white hover:file:bg-opacity-30 cursor-pointer"
              />
            </div>
          </div>
          
          {uploading && (
            <div className="mt-4 flex items-center justify-center text-white">
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </div>
          )}
        </div>

        {/* General Upload Section */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border border-gray-700">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">General Image Upload</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
              <select
                value={uploadData.category}
                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all text-gray-200"
              >
                <option value="NEGATIVE">Negative</option>
                <option value="POSITIVE">Positive</option>
                <option value="NEUTRAL">Neutral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Age Group</label>
              <select
                value={uploadData.ageGroup}
                onChange={(e) => setUploadData({ ...uploadData, ageGroup: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all text-gray-200"
              >
                <option value="4-9">4-9 years</option>
                <option value="9-14">9-14 years</option>
                <option value="15+">15+ years</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Type</label>
              <select
                value={uploadData.type}
                onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all text-gray-200"
              >
                <option value="NEG-EMOTION">Negative Emotion</option>
                <option value="POS-EMOTION">Positive Emotion</option>
                <option value="TRANSITION">Transition</option>
                <option value="PRAN">Pran</option>
                <option value="ENDING">Ending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Display Order</label>
              <input
                type="number"
                min="0"
                value={uploadData.displayOrder}
                onChange={(e) => setUploadData({ ...uploadData, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all text-gray-200"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Lower = shown first</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Upload File</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-indigo-500 file:to-purple-600 file:text-white hover:file:from-indigo-600 hover:file:to-purple-700 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border border-gray-700">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Filter Images</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all text-gray-200"
              >
                <option value="">All Categories</option>
                <option value="NEGATIVE">Negative</option>
                <option value="POSITIVE">Positive</option>
                <option value="NEUTRAL">Neutral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Age Group</label>
              <select
                value={filters.ageGroup}
                onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all text-gray-200"
              >
                <option value="">All Age Groups</option>
                <option value="4-9">4-9 years</option>
                <option value="9-14">9-14 years</option>
                <option value="15+">15+ years</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all text-gray-200"
              >
                <option value="">All Types</option>
                <option value="NEG-EMOTION">Negative Emotion</option>
                <option value="POS-EMOTION">Positive Emotion</option>
                <option value="TRANSITION">Transition</option>
                <option value="PRAN">Pran</option>
                <option value="ENDING">Ending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        {loading ? (
          <div className="bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-700">
            <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500 font-medium">Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-700">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 font-medium text-lg">No images found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or upload new images</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Group images by Category and Age Group */}
            {['POSITIVE', 'NEGATIVE', 'NEUTRAL'].map((category) => {
              const categoryImages = images.filter(img => img.category === category);
              if (categoryImages.length === 0) return null;

              return (
                <div key={category} className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
                  <div className="flex items-center mb-6">
                    <h3 className={`text-2xl font-bold ${
                      category === 'NEGATIVE' ? 'text-red-400' :
                      category === 'POSITIVE' ? 'text-green-400' :
                      'text-blue-400'
                    }`}>
                      {category} Flow
                    </h3>
                    <span className="ml-4 px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                      {categoryImages.length} images
                    </span>
                  </div>

                  {/* Age Group Sections */}
                  <div className="space-y-6">
                    {['4-9', '9-14', '15+'].map((ageGroup) => {
                      const ageImages = categoryImages.filter(img => img.ageGroup === ageGroup);
                      if (ageImages.length === 0) return null;

                      return (
                        <div key={ageGroup} className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-white">
                              Age Group: {ageGroup} years
                            </h4>
                            <span className="px-3 py-1 bg-indigo-600 rounded-full text-sm text-white font-semibold">
                              {ageImages.length} / 8 images
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                            {ageImages.map((image) => {
                              // Construct image URL - use relative path for Next.js proxy
                              let imageUrl = image.filePath;
                              if (!imageUrl) {
                                console.warn('Image missing filePath:', image);
                                imageUrl = '';
                              } else if (!imageUrl.startsWith('http')) {
                                // Use relative path - Next.js will proxy /assets/* to backend
                                imageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
                              }
                              
                              return (
                                <div key={image._id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-indigo-500 transition-all group">
                                  <div className="relative aspect-square bg-gray-900">
                                    <img
                                      src={imageUrl}
                                      alt={image.fileName || image.type}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        console.error('Image load error:', {
                                          filePath: image.filePath,
                                          fullUrl: imageUrl,
                                          apiBaseUrl: API_BASE_URL,
                                          imageData: image
                                        });
                                        // Show error placeholder
                                        e.target.style.display = 'none';
                                        if (!e.target.parentElement.querySelector('.error-placeholder')) {
                                          const errorDiv = document.createElement('div');
                                          errorDiv.className = 'error-placeholder absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-gray-400 text-xs p-2 text-center';
                                          errorDiv.innerHTML = '<div>Failed to load</div><div class="text-xs mt-1 opacity-75">Check console</div>';
                                          e.target.parentElement.appendChild(errorDiv);
                                        }
                                      }}
                                      onLoad={() => {
                                        console.log('✓ Image loaded:', imageUrl);
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                      <button
                                        onClick={() => handleDelete(image._id)}
                                        className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-xs font-semibold"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                  <div className="p-2">
                                    <p className="text-xs text-gray-400 truncate">{image.type}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <label className="text-xs text-gray-500">Order:</label>
                                      <input
                                        type="number"
                                        min="0"
                                        value={image.displayOrder || 0}
                                        onChange={(e) => handleUpdateDisplayOrder(image._id, e.target.value)}
                                        className="w-16 px-2 py-1 text-xs bg-gray-900 border border-gray-600 rounded text-gray-300 focus:outline-none focus:border-indigo-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            {/* Placeholder slots for remaining images */}
                            {Array.from({ length: 8 - ageImages.length }).map((_, idx) => (
                              <div key={`placeholder-${idx}`} className="bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 aspect-square flex items-center justify-center">
                                <span className="text-gray-600 text-xs">Empty</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Fallback: If no category grouping, show simple grid */}
            {images.length > 0 && !['POSITIVE', 'NEGATIVE', 'NEUTRAL'].some(cat => 
              images.some(img => img.category === cat)
            ) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((image) => {
                  // Use relative path - Next.js will proxy /assets/* to backend
                  const imageUrl = image.filePath?.startsWith('http') 
                    ? image.filePath 
                    : (image.filePath?.startsWith('/') ? image.filePath : `/${image.filePath}`);
                  
                  return (
              <div key={image._id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 hover:shadow-xl transition-all transform hover:scale-105">
                <div className="relative">
                  <img
                        src={imageUrl}
                        alt={image.fileName || image.type}
                    className="w-full h-56 object-cover"
                        onError={(e) => {
                          console.error('Image load error:', {
                            filePath: image.filePath,
                            fullUrl: imageUrl,
                            apiBaseUrl: API_BASE_URL,
                            imageData: image
                          });
                          e.target.style.display = 'none';
                          if (!e.target.parentElement.querySelector('.error-placeholder')) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'error-placeholder absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-gray-400 text-xs p-2 text-center';
                            errorDiv.innerHTML = '<div>Failed to load</div><div class="text-xs mt-1 opacity-75">Check console</div>';
                            e.target.parentElement.appendChild(errorDiv);
                          }
                        }}
                        onLoad={() => {
                          console.log('✓ Image loaded:', imageUrl);
                        }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      image.category === 'NEGATIVE' ? 'bg-red-100 text-red-700' :
                      image.category === 'POSITIVE' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {image.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{image.ageGroup}</p>
                    <p className="text-sm font-bold text-white">{image.type}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(image._id)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all shadow-md font-semibold text-sm flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageManagement;

