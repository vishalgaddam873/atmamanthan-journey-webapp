import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import AdminNavbar from '../../components/AdminNavbar';

const PranManagement = () => {
  const router = useRouter();
  const [prans, setPran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPran, setEditingPran] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newPran, setNewPran] = useState({
    id: 1,
    category: 'NEGATIVE',
    label: '',
    sequence: 1,
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadPran();
  }, [router]);

  const loadPran = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/pran');
      setPran(response.data.sort((a, b) => {
        const catOrder = { NEGATIVE: 1, POSITIVE: 2, NEUTRAL: 3 };
        if (catOrder[a.category] !== catOrder[b.category]) {
          return catOrder[a.category] - catOrder[b.category];
        }
        return a.sequence - b.sequence;
      }));
    } catch (error) {
      console.error('Error loading prans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pran) => {
    setEditingPran({ ...pran });
  };

  const handleSave = async () => {
    try {
      await api.put(`/api/pran/${editingPran._id}`, {
        label: editingPran.label,
      });
      setEditingPran(null);
      loadPran();
    } catch (error) {
      console.error('Error saving pran:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/api/pran', newPran);
      setShowCreate(false);
      setNewPran({ id: 1, category: 'NEGATIVE', label: '', sequence: 1 });
      loadPran();
    } catch (error) {
      console.error('Error creating pran:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this pran?')) return;

    try {
      await api.delete(`/api/pran/${id}`);
      loadPran();
    } catch (error) {
      console.error('Error deleting pran:', error);
    }
  };

  const categories = ['NEGATIVE', 'POSITIVE', 'NEUTRAL'];

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-2">
              Pran Management
            </h1>
            <p className="text-gray-400">Manage pran selections for each category</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all shadow-lg font-semibold flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Pran
          </button>
        </div>

        {loading ? (
          <div className="bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-700">
            <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-400 font-medium">Loading prans...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => {
              const categoryPran = prans.filter((p) => p.category === category);
              const categoryColors = {
                NEGATIVE: 'from-red-500 to-rose-600',
                POSITIVE: 'from-green-500 to-emerald-600',
                NEUTRAL: 'from-blue-500 to-indigo-600'
              };
              return (
                <div key={category} className="bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-700">
                  <div className="flex items-center mb-6">
                    <div className={`p-3 bg-gradient-to-br ${categoryColors[category]} rounded-xl mr-4`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{category}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((seq) => {
                      const pran = categoryPran.find((p) => p.sequence === seq);
                      return (
                        <div
                          key={seq}
                          className={`border-2 rounded-xl p-5 transition-all ${
                            pran 
                              ? 'border-purple-500 bg-gradient-to-br from-purple-900/80 to-violet-900/80 hover:shadow-lg hover:border-purple-400' 
                              : 'border-gray-600 bg-gray-700/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-xs font-bold">
                              Sequence {seq}
                            </span>
                          </div>
                          {pran ? (
                            <>
                              <p className="font-bold text-white mb-4 text-lg">{pran.label}</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(pran)}
                                  className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-md font-semibold text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(pran._id)}
                                  className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all shadow-md font-semibold text-sm"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-gray-400 text-sm font-medium">Not set</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {editingPran && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Edit Pran</h2>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Label</label>
                <input
                  type="text"
                  value={editingPran.label}
                  onChange={(e) => setEditingPran({ ...editingPran, label: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all text-gray-200"
                  placeholder="Enter pran label"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transform hover:scale-105 transition-all shadow-lg font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingPran(null)}
                  className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transform hover:scale-105 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showCreate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Create Pran</h2>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">ID (1-12)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={newPran.id}
                  onChange={(e) => setNewPran({ ...newPran, id: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all text-gray-200"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
                <select
                  value={newPran.category}
                  onChange={(e) => setNewPran({ ...newPran, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all text-gray-200"
                >
                  <option value="NEGATIVE">Negative</option>
                  <option value="POSITIVE">Positive</option>
                  <option value="NEUTRAL">Neutral</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Sequence (1-4)</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={newPran.sequence}
                  onChange={(e) => setNewPran({ ...newPran, sequence: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all text-gray-200"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Label</label>
                <input
                  type="text"
                  value={newPran.label}
                  onChange={(e) => setNewPran({ ...newPran, label: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all text-gray-200"
                  placeholder="Enter pran label"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleCreate}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all shadow-lg font-semibold"
                >
                  Create Pran
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transform hover:scale-105 transition-all font-semibold"
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

export default PranManagement;

