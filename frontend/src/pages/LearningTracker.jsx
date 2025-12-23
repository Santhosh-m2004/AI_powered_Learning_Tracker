import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import LearningForm from '../components/LearningForm.jsx';
import LearningList from '../components/LearningList.jsx';
import { ProgressChart } from '../components/Charts.jsx';
import API from '../api/axios.js';
import { LoadingPage } from '../components/LoadingSpinner.jsx';
import { FiX } from 'react-icons/fi';

const LearningTracker = () => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        API.get('/learning/sessions'),
        API.get('/learning/stats')
      ]);

      setSessions(sessionsRes?.data?.sessions || []);
      setStats(statsRes?.data || null);
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

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSession(null);
    fetchData();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold">Learning Tracker</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Track and analyze your learning sessions
                </p>
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                + Add Session
              </button>
            </div>

            {/* Stats Summary */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                <div className="card">
                  <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Total Learning Time
                  </h3>
                  <p className="text-3xl font-bold">
                    {((stats?.totalTime ?? 0) / 60).toFixed(1)} hours
                  </p>
                </div>

                <div className="card">
                  <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Average Session Time
                  </h3>
                  <p className="text-3xl font-bold">
                    {(stats?.avgSessionTime ?? 0).toFixed(0)} minutes
                  </p>
                </div>

                <div className="card">
                  <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Productivity Score
                  </h3>
                  <p className="text-3xl font-bold">
                    {(stats?.productivityScore ?? 0)}/10
                  </p>
                </div>

              </div>
            )}

            {/* Progress Chart */}
            <div className="mb-8">
              <ProgressChart />
            </div>

            {/* Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex 
                              items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg 
                                max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">
                        {editingSession ? 'Edit Session' : 'Add Learning Session'}
                      </h2>

                      <button
                        onClick={() => {
                          setShowForm(false);
                          setEditingSession(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 
                                   dark:hover:text-gray-300"
                        aria-label="Close"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>

                    <LearningForm
                      initialData={editingSession}
                      onSuccess={handleFormSuccess}
                    />
                  </div>

                </div>
              </div>
            )}

            {/* Sessions List */}
            <LearningList
              sessions={sessions}
              onEdit={handleEdit}
              onDelete={fetchData}
            />

          </div>
        </main>
      </div>
    </div>
  );
};

export default LearningTracker;
