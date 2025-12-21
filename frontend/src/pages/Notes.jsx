import { useState, useEffect, useRef } from 'react';
import { FiUpload, FiFile, FiImage, FiSearch, FiTrash2, FiEdit, FiDownload } from 'react-icons/fi';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import API from '../api/axios.js';
import { toast } from 'react-hot-toast';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: '',
    subject: ''
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await API.get('/notes');
      setNotes(response.data.notes);
    } catch (error) {
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', noteForm.title || file.name);
    formData.append('content', noteForm.content);
    formData.append('tags', noteForm.tags);
    formData.append('subject', noteForm.subject);

    try {
      setUploading(true);
      const response = await API.post('/notes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Note uploaded successfully');
      setNotes([response.data, ...notes]);
      setShowUploadModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to upload note');
    } finally {
      setUploading(false);
    }
  };

  const handleTextNoteSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/notes', noteForm);
      toast.success('Note created successfully');
      setNotes([response.data, ...notes]);
      setShowUploadModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchNotes();
      return;
    }
    try {
      const response = await API.get(`/notes/search?q=${searchQuery}`);
      setNotes(response.data);
    } catch (error) {
      toast.error('Failed to search notes');
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await API.delete(`/notes/${id}`);
      toast.success('Note deleted successfully');
      setNotes(notes.filter(note => note._id !== id));
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const resetForm = () => {
    setNoteForm({
      title: '',
      content: '',
      tags: '',
      subject: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return <FiFile className="w-5 h-5 text-red-500" />;
      case 'image': return <FiImage className="w-5 h-5 text-green-500" />;
      default: return <FiFile className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold">Notes & Resources</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload, organize, and manage your study materials
                </p>
              </div>
              
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary flex items-center"
              >
                <FiUpload className="w-4 h-4 mr-2" />
                Upload Note
              </button>
            </div>

            {/* Search Bar */}
            <div className="card mb-6">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search notes by title, content, or tags..."
                    className="pl-10 input-field"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="btn-primary px-6"
                >
                  Search
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    fetchNotes();
                  }}
                  className="btn-secondary px-6"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Notes Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <div key={note._id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        {note.fileType && getFileIcon(note.fileType)}
                        <h3 className="font-semibold ml-2 truncate">{note.title}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                        {note.fileUrl && (
                          <a
                            href={note.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <FiDownload className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {note.aiSummary && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          AI Summary
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                          {note.aiSummary}
                        </p>
                      </div>
                    )}

                    {note.content && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        {note.content}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {note.tags?.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags?.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{note.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{note.subject || 'General'}</span>
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {notes.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <FiFile className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Upload your first note to get started
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary"
                >
                  Upload Note
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Upload Note</h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Note Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 text-center"
                    >
                      <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium">Upload File</p>
                      <p className="text-sm text-gray-500">PDF, Images, Documents</p>
                    </button>
                    <div className="p-4 border-2 border-gray-300 rounded-lg">
                      <FiFile className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium">Text Note</p>
                      <p className="text-sm text-gray-500">Write directly</p>
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
                  className="hidden"
                />

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
                    className="input-field"
                    placeholder="Enter note title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Content
                  </label>
                  <textarea
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                    className="input-field h-32"
                    placeholder="Enter note content or description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={noteForm.tags}
                      onChange={(e) => setNoteForm({...noteForm, tags: e.target.value})}
                      className="input-field"
                      placeholder="math, physics, important"
                    />
                    <p className="text-xs text-gray-500 mt-1">Comma separated</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={noteForm.subject}
                      onChange={(e) => setNoteForm({...noteForm, subject: e.target.value})}
                      className="input-field"
                      placeholder="Mathematics, Programming, etc."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      resetForm();
                    }}
                    className="btn-secondary px-6"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTextNoteSubmit}
                    disabled={uploading || !noteForm.title}
                    className="btn-primary px-6"
                  >
                    {uploading ? 'Uploading...' : 'Save Note'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;