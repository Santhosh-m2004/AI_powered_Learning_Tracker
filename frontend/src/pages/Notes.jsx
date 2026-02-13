import { useState, useEffect, useRef } from 'react';
import {
  FiUpload,
  FiFile,
  FiImage,
  FiSearch,
  FiTrash2,
  FiDownload,
  FiExternalLink,
  FiEye,
  FiX
} from 'react-icons/fi';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import API from '../api/axios.js';
import { toast } from 'react-hot-toast';
import { LoadingPage } from '../components/LoadingSpinner.jsx';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [noteType, setNoteType] = useState('text'); // 'text' or 'file'
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    note: null
  });

  const fileInputRef = useRef(null);

  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: '',
    subject: ''
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  /* ---------------------------------- FETCH NOTES ---------------------------------- */
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await API.get('/notes');
      setNotes(response?.data?.notes || []);
    } catch (error) {
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------- UPLOAD FILE ---------------------------------- */
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', noteForm.title || selectedFile.name);
    formData.append('content', noteForm.content || '');
    formData.append('subject', noteForm.subject || '');
    formData.append('tags', noteForm.tags || '');

    try {
      setUploading(true);
      const response = await API.post('/notes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Note uploaded successfully');

      setNotes(prev => [response.data, ...prev]);
      closeModal();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload note');
    } finally {
      setUploading(false);
    }
  };

  /* ---------------------------------- TEXT NOTE SUBMIT ---------------------------------- */
  const handleTextNoteSubmit = async () => {
    if (!noteForm.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      setUploading(true);
      const response = await API.post('/notes', {
        ...noteForm,
        tags: noteForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      });

      toast.success('Note created successfully');
      setNotes(prev => [response.data, ...prev]);
      closeModal();
    } catch (error) {
      toast.error('Failed to create note');
    } finally {
      setUploading(false);
    }
  };

  /* ---------------------------------- HANDLE SUBMIT ---------------------------------- */
  const handleSubmit = () => {
    if (noteType === 'file') {
      handleFileUpload();
    } else {
      handleTextNoteSubmit();
    }
  };

  /* ---------------------------------- FILE SELECTION ---------------------------------- */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Set default title if not already set
    if (!noteForm.title.trim()) {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setNoteForm(prev => ({
        ...prev,
        title: fileNameWithoutExt
      }));
    }
  };

  /* ---------------------------------- HANDLE DOWNLOAD/VIEW ---------------------------------- */
  const handleDownload = async (note) => {
    try {
      if (note.fileUrl) {
        // If it's a direct file URL, open in new tab for view/download
        window.open(note.fileUrl, '_blank');
      } else if (note.fileId) {
        // If backend has fileId, use download endpoint
        const response = await API.get(`/notes/${note._id}/download`, {
          responseType: 'blob'
        });
        
        // Create blob and download
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', note.title || 'note.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.error('Failed to download file');
      console.error('Download error:', error);
    }
  };

  /* ---------------------------------- HANDLE VIEW/OPEN ---------------------------------- */
  const handleView = (note) => {
    if (!note.fileUrl) {
      toast.error('No file available to view');
      return;
    }

    // Check if it's an image or PDF for preview
    const fileType = note.fileType?.toLowerCase() || '';
    const fileName = note.title?.toLowerCase() || '';

    if (fileType.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
      // Open image in new tab for viewing
      window.open(note.fileUrl, '_blank');
    } else if (fileType.includes('pdf') || /\.pdf$/i.test(fileName)) {
      // Open PDF in new tab (most browsers can display PDFs)
      window.open(note.fileUrl, '_blank');
    } else {
      // For other file types, try to open or download
      window.open(note.fileUrl, '_blank');
    }
  };

  /* ---------------------------------- PREVIEW FILE ---------------------------------- */
  const handlePreview = (note) => {
    if (!note.fileUrl) {
      toast.error('No file available to preview');
      return;
    }

    setPreviewModal({
      isOpen: true,
      note: note
    });
  };

  /* ---------------------------------- CLOSE PREVIEW ---------------------------------- */
  const closePreview = () => {
    setPreviewModal({
      isOpen: false,
      note: null
    });
  };

  /* ---------------------------------- SEARCH NOTES ---------------------------------- */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return fetchNotes();

    try {
      const response = await API.get(`/notes/search?q=${searchQuery}`);
      setNotes(response.data || []);
    } catch {
      toast.error('Failed to search notes');
    }
  };

  /* ---------------------------------- DELETE NOTE ---------------------------------- */
  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await API.delete(`/notes/${id}`);
      toast.success('Note deleted');
      setNotes(prev => prev.filter(n => n._id !== id));
    } catch {
      toast.error('Failed to delete note');
    }
  };

  /* ---------------------------------- RESET FORM ---------------------------------- */
  const resetForm = () => {
    setNoteForm({
      title: '',
      content: '',
      tags: '',
      subject: ''
    });
    setSelectedFile(null);
    setNoteType('text');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeModal = () => {
    setShowUploadModal(false);
    resetForm();
  };

  /* ---------------------------------- FILE ICON ---------------------------------- */
  const getFileIcon = (fileType, fileName = '') => {
    if (!fileType && !fileName) return <FiFile className="w-5 h-5 text-blue-500" />;

    const type = (fileType || '').toLowerCase();
    const name = (fileName || '').toLowerCase();

    if (type.includes('pdf') || name.endsWith('.pdf')) return <FiFile className="w-5 h-5 text-red-500" />;
    if (type.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(name)) return <FiImage className="w-5 h-5 text-green-500" />;
    if (type.includes('word') || /\.(doc|docx)$/i.test(name)) return <FiFile className="w-5 h-5 text-blue-600" />;
    return <FiFile className="w-5 h-5 text-blue-500" />;
  };

  /* ---------------------------------- UI ---------------------------------- */

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">

            {/* HEADER */}
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

            {/* SEARCH BAR */}
            <div className="card mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">

                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search notes..."
                    className="pl-10 input-field"
                  />
                </div>

                <button onClick={handleSearch} className="btn-primary px-6">
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

            {/* NOTES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <div key={note._id} className="card hover:shadow-lg transition-shadow">

                  {/* HEADER */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      {getFileIcon(note.fileType, note.title)}
                      <h3 className="font-semibold ml-2 truncate">{note.title}</h3>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Delete note"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>

                      {note.fileUrl && (
                        <>
                          <button
                            onClick={() => handleView(note)}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            title="View file"
                          >
                            <FiExternalLink className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDownload(note)}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                            title="Download file"
                          >
                            <FiDownload className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* AI SUMMARY */}
                  {note.aiSummary && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">
                        AI Summary
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {note.aiSummary}
                      </p>
                    </div>
                  )}

                  {/* CONTENT */}
                  {note.content && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {note.content}
                    </p>
                  )}

                  {/* TAGS */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {note.tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}

                    {note.tags?.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{note.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* FOOTER */}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{note.subject || 'General'}</span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* FILE INFO */}
                  {note.fileUrl && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center text-xs text-gray-500">
                        <FiFile className="w-3 h-3 mr-1" />
                        <span className="truncate">
                          {note.fileType || 'File'} • 
                          {(note.fileSize && note.fileSize > 0) 
                            ? ` ${(note.fileSize / 1024 / 1024).toFixed(2)} MB`
                            : ' Unknown size'}
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* EMPTY STATE */}
            {notes.length === 0 && (
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

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* HEADER */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Upload Note</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Note Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Note Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* File Upload Button */}
                    <button
                      onClick={() => {
                        setNoteType('file');
                        fileInputRef.current?.click();
                      }}
                      className={`p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
                        noteType === 'file' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium">Upload File</p>
                      <p className="text-sm text-gray-500">PDF, Images, Documents</p>
                    </button>

                    {/* Text Note */}
                    <button
                      onClick={() => setNoteType('text')}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        noteType === 'text' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      <FiFile className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium">Text Note</p>
                      <p className="text-sm text-gray-500">Write directly</p>
                    </button>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx,.ppt,.pptx"
                  className="hidden"
                />

                {/* Selected File Info */}
                {selectedFile && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FiFile className="w-5 h-5 text-blue-500 mr-2" />
                        <span className="truncate">{selectedFile.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                )}

                {/* TITLE */}
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                    className="input-field"
                    placeholder="Enter note title"
                    required
                  />
                </div>

                {/* CONTENT (Only for text notes or additional notes) */}
                {noteType === 'text' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <textarea
                      value={noteForm.content}
                      onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                      className="input-field h-32"
                      placeholder="Enter note content..."
                    />
                  </div>
                )}

                {/* TAGS + SUBJECT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <input
                      value={noteForm.tags}
                      onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                      className="input-field"
                      placeholder="math, physics, important"
                    />
                    <p className="text-xs text-gray-500 mt-1">Comma separated</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input
                      value={noteForm.subject}
                      onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                      className="input-field"
                      placeholder="Mathematics, Programming, etc."
                    />
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex justify-end gap-3">
                  <button onClick={closeModal} className="btn-secondary px-6">
                    Cancel
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={uploading || !noteForm.title.trim() || (noteType === 'file' && !selectedFile)}
                    className="btn-primary px-6"
                  >
                    {uploading ? (
                      noteType === 'file' ? 'Uploading...' : 'Saving...'
                    ) : (
                      noteType === 'file' ? 'Upload File' : 'Save Note'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewModal.isOpen && previewModal.note && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{previewModal.note.title}</h3>
              <button onClick={closePreview} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 h-[70vh]">
              {previewModal.note.fileType?.includes('image') ? (
                <div className="h-full flex items-center justify-center">
                  <img 
                    src={previewModal.note.fileUrl} 
                    alt={previewModal.note.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : previewModal.note.fileType?.includes('pdf') || previewModal.note.title?.endsWith('.pdf') ? (
                <div className="h-full">
                  <iframe 
                    src={previewModal.note.fileUrl} 
                    title={previewModal.note.title}
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <FiFile className="w-16 h-16 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium mb-2">Preview not available</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This file type cannot be previewed in the browser
                  </p>
                  <button
                    onClick={() => handleDownload(previewModal.note)}
                    className="btn-primary"
                  >
                    <FiDownload className="w-4 h-4 mr-2" />
                    Download File
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={closePreview} className="btn-secondary px-6">
                Close
              </button>
              <button
                onClick={() => handleDownload(previewModal.note)}
                className="btn-primary px-6 flex items-center"
              >
                <FiDownload className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;