import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import AdminNavbar from '../../components/AdminNavbar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const AudioManagement = () => {
  const router = useRouter();
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('COMMON');
  const [editingAudio, setEditingAudio] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [replacingAudio, setReplacingAudio] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadAudios();
  }, [router, selectedCategory]);

  const loadAudios = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/audio?category=${selectedCategory}`);
      setAudios(response.data.sort((a, b) => a.sequence - b.sequence));
    } catch (error) {
      console.error('Error loading audios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (audio) => {
    setEditingAudio({ ...audio });
  };

  const handleSave = async () => {
    try {
      await api.put(`/api/audio/${editingAudio._id}`, {
        scriptText: editingAudio.scriptText,
        cuePoint: editingAudio.cuePoint,
      });
      setEditingAudio(null);
      loadAudios();
    } catch (error) {
      console.error('Error saving audio:', error);
      alert(`Error saving: ${error.response?.data?.error || error.message}`);
    }
  };

  const getAudioUrl = (audio) => {
    if (!audio.filePath) return null;
    return audio.filePath.startsWith('http') 
      ? audio.filePath 
      : `${API_BASE_URL}${audio.filePath}`;
  };

  const handlePlay = (audio) => {
    if (playingAudio === audio._id) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(audio._id);
    }
  };

  const handleReplaceAudio = async (e, audio) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!confirm(`Are you sure you want to replace "${audio.fileName}"? The old file will be kept but the database will point to the new file.`)) {
      e.target.value = '';
      return;
    }

    setReplacingAudio(audio._id);
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('category', audio.category);

    try {
      // Step 1: Upload the new file
      const uploadResponse = await api.post('/api/upload/audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Step 2: Update the audio record with new file info
      await api.put(`/api/audio/${audio._id}`, {
        fileName: uploadResponse.data.fileName,
        filePath: uploadResponse.data.filePath,
        // Keep existing scriptText and cuePoint
        scriptText: audio.scriptText,
        cuePoint: audio.cuePoint,
      });
      
      // Step 3: Reload the audio list
      await loadAudios();
      
      // Reset the file input
      e.target.value = '';
      
      setUploadMessage({ type: 'success', text: 'Audio file replaced successfully!' });
      setTimeout(() => setUploadMessage(null), 5000);
    } catch (error) {
      console.error('Error replacing audio:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to replace audio';
      setUploadMessage({ type: 'error', text: `Error: ${errorMsg}` });
      setTimeout(() => setUploadMessage(null), 7000);
    } finally {
      setReplacingAudio(null);
    }
  };

  const handleDelete = async (audio) => {
    if (!confirm(`Are you sure you want to delete "${audio.fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/api/audio/${audio._id}`);
      await loadAudios();
      setUploadMessage({ type: 'success', text: 'Audio deleted successfully!' });
      setTimeout(() => setUploadMessage(null), 5000);
    } catch (error) {
      console.error('Error deleting audio:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to delete audio';
      setUploadMessage({ type: 'error', text: `Error: ${errorMsg}` });
      setTimeout(() => setUploadMessage(null), 7000);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('category', selectedCategory);

    try {
      // Step 1: Upload the file
      const uploadResponse = await api.post('/api/upload/audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Step 2: Get the next sequence number for this category
      const existingAudios = await api.get(`/api/audio?category=${selectedCategory}`);
      const maxSequence = existingAudios.data.length > 0 
        ? Math.max(...existingAudios.data.map(a => a.sequence || 0))
        : 0;
      const nextSequence = maxSequence + 1;

      // Step 3: Create the audio record in the database
      const audioRecord = {
        fileName: uploadResponse.data.fileName,
        filePath: uploadResponse.data.filePath,
        category: selectedCategory,
        sequence: nextSequence,
        cuePoint: 'NONE',
        scriptText: '',
      };

      await api.post('/api/audio', audioRecord);
      
      // Step 4: Reload the audio list
      await loadAudios();
      
      // Reset the file input
      e.target.value = '';
      
      // Show success message
      setUploadMessage({ type: 'success', text: 'Audio uploaded successfully!' });
      setTimeout(() => setUploadMessage(null), 5000);
    } catch (error) {
      console.error('Error uploading audio:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to upload audio';
      setUploadMessage({ type: 'error', text: `Error: ${errorMsg}` });
      setTimeout(() => setUploadMessage(null), 7000);
    } finally {
      setUploading(false);
    }
  };

  const categories = ['COMMON', 'NEGATIVE', 'POSITIVE', 'NEUTRAL'];

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Audio Management
          </h1>
          <p className="text-gray-400">Manage audio files and scripts</p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8 mb-6 border border-gray-700">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Category & Upload</h2>
          </div>
          
          <div className="flex gap-3 mb-6 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Upload Audio File
              <span className="text-xs text-gray-500 ml-2">(Max 50MB, MP3, WAV, etc.)</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept="audio/*"
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-indigo-500 file:to-blue-600 file:text-white hover:file:from-indigo-600 hover:file:to-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                id="audio-upload-input"
              />
              {uploading && (
                <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center rounded-lg">
                  <div className="flex items-center text-indigo-400">
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-medium">Uploading and creating record...</span>
                  </div>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              The audio will be uploaded and automatically added to the {selectedCategory} category with the next sequence number.
            </p>
            {uploadMessage && (
              <div className={`mt-3 p-3 rounded-lg flex items-center ${
                uploadMessage.type === 'success' 
                  ? 'bg-green-900/50 text-green-300 border border-green-700/50' 
                  : 'bg-red-900/50 text-red-300 border border-red-700/50'
              }`}>
                {uploadMessage.type === 'success' ? (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="text-sm font-medium">{uploadMessage.text}</span>
                <button
                  onClick={() => setUploadMessage(null)}
                  className="ml-auto text-gray-400 hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-700">
            <svg className="animate-spin h-12 w-12 text-indigo-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-300 font-medium">Loading audio files...</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-900/50 to-blue-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Sequence</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">File Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Cue Point</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Preview</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {audios.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No audio files found for this category
                      </td>
                    </tr>
                  ) : (
                    audios.map((audio) => {
                      const audioUrl = getAudioUrl(audio);
                      const isPlaying = playingAudio === audio._id;
                      
                      return (
                        <tr key={audio._id} className="hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm font-semibold border border-indigo-700/50">
                              {audio.sequence}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                              </svg>
                              <span className="font-medium text-gray-200">{audio.fileName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium border border-gray-600">
                              {audio.cuePoint || 'NONE'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {audioUrl ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handlePlay(audio)}
                                  className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all shadow-md"
                                  title={isPlaying ? 'Stop' : 'Play'}
                                >
                                  {isPlaying ? (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                  )}
                                </button>
                                {isPlaying && (
                                  <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-2 border border-gray-700">
                                    <audio
                                      src={audioUrl}
                                      controls
                                      autoPlay
                                      className="h-8 max-w-xs"
                                      onEnded={() => setPlayingAudio(null)}
                                      onPause={() => setPlayingAudio(null)}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">No file</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => handleEdit(audio)}
                                className="px-3 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg hover:from-indigo-600 hover:to-blue-700 transform hover:scale-105 transition-all shadow-md font-semibold text-xs"
                                title="Edit script and cue point"
                              >
                                Edit
                              </button>
                              <label className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all shadow-md font-semibold text-xs cursor-pointer relative disabled:opacity-50" title="Replace audio file">
                                {replacingAudio === audio._id ? (
                                  <span className="flex items-center">
                                    <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Replacing...
                                  </span>
                                ) : (
                                  'Replace'
                                )}
                                <input
                                  type="file"
                                  accept="audio/*"
                                  onChange={(e) => handleReplaceAudio(e, audio)}
                                  disabled={replacingAudio === audio._id}
                                  className="hidden"
                                />
                              </label>
                              <button
                                onClick={() => handleDelete(audio)}
                                className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all shadow-md font-semibold text-xs"
                                title="Delete audio"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {editingAudio && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full border border-gray-700">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Edit Audio</h2>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Script Text</label>
                <textarea
                  value={editingAudio.scriptText}
                  onChange={(e) => setEditingAudio({ ...editingAudio, scriptText: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all text-gray-200"
                  rows={6}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Cue Point</label>
                <select
                  value={editingAudio.cuePoint}
                  onChange={(e) => setEditingAudio({ ...editingAudio, cuePoint: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all text-gray-200"
                >
                  <option value="NONE">None</option>
                  <option value="MIRROR_FADE">Mirror Fade</option>
                  <option value="SHOW_NEG_IMAGES">Show Negative Images</option>
                  <option value="SHOW_POS_IMAGES">Show Positive Images</option>
                  <option value="MOOD_SELECTION">Mood Selection</option>
                  <option value="PRAN_SELECTION">Pran Selection</option>
                  <option value="ENDING">Ending</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingAudio(null)}
                  className="px-6 py-3 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transform hover:scale-105 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioManagement;

