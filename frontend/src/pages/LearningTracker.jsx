import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import LearningForm from '../components/LearningForm.jsx';
import LearningList from '../components/LearningList.jsx';
import { TimeSpentChart, SubjectDistributionChart } from '../components/Charts.jsx';
import API from '../api/axios.js';
import { FiPlus, FiX, FiClock, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

const LearningTracker = () => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    subject: '',
    difficulty: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, page, filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filter.startDate && { startDate: filter.startDate }),
        ...(filter.endDate && { endDate: filter.endDate }),
        ...(filter.subject && { subject: filter.subject }),
        ...(filter.difficulty && { difficulty: filter.difficulty })
      });

      const [sessionsRes, statsRes] = await Promise.all([
        API.get(`/learning/sessions?${queryParams}`),
        API.get('/learning/stats')
      ]);

      setSessions(sessionsRes.data?.sessions || []);
      setTotalPages(sessionsRes.data?.pages || 1);
      setStats(statsRes.data || null);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setShowForm(true);
  };

  const handleDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await API.delete(`/learning/sessions/${sessionId}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSession(null);
    fetchData();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilter({
      startDate: '',
      endDate: '',
      subject: '',
      difficulty: ''
    });
    setPage(1);
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getSubjectStats = () => {
    if (!stats?.subjectStats) return [];
    return Object.entries(stats.subjectStats).map(([subject, data]) => ({
      name: subject,
      value: data.totalTime || 0,
      sessions: data.sessions || 0
    }));
  };

  const getWeeklyData = () => {
    if (!stats?.dailyStats) return [];
    return stats.dailyStats.map(item => ({
      day: item._id || 'Day',
      studyTime: item.totalTime || 0
    }));
  };

  if (loading && !sessions.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  ))}
                </div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                    Learning Tracker
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Track, analyze, and optimize your learning journey
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <FiPlus className="w-5 h-5" />
                  Add Session
                </motion.button>
              </div>
            </div>

            {/* Stats Summary */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                      <FiClock className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-600 dark:text-gray-400">Total Learning Time</h3>
                      <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                        {formatTime(stats.totalTime || 0)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stats.totalSessions || 0} sessions tracked
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg mr-4">
                      <FiActivity className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-600 dark:text-gray-400">Average Session</h3>
                      <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                        {(stats.avgSessionTime || 0).toFixed(0)} min
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Across all subjects
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg mr-4">
                      <FiTrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-600 dark:text-gray-400">Productivity Score</h3>
                      <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                        {(stats.productivityScore || 0).toFixed(1)}/10
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Based on consistency and efficiency
                  </p>
                </motion.div>
              </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Weekly Study Time
                </h3>
                <div className="h-64">
                  <TimeSpentChart data={getWeeklyData()} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Subject Distribution
                </h3>
                <div className="h-64">
                  <SubjectDistributionChart data={getSubjectStats()} />
                </div>
              </motion.div>
            </div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6 mb-6 md:mb-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filter Sessions</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear Filters
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={filter.startDate}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={filter.endDate}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={filter.subject}
                    onChange={handleFilterChange}
                    placeholder="e.g., Mathematics"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={filter.difficulty}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                  >
                    <option value="">All</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {editingSession ? 'Edit Session' : 'Add Learning Session'}
                      </h2>
                      <button
                        onClick={() => {
                          setShowForm(false);
                          setEditingSession(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        aria-label="Close"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>

                    <LearningForm
                      initialData={editingSession}
                      onSuccess={handleFormSuccess}
                      onCancel={() => {
                        setShowForm(false);
                        setEditingSession(null);
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            )}

            {/* Sessions List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow"
            >
              <LearningList
                sessions={sessions}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 md:p-6 border-t dark:border-gray-700">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LearningTracker;