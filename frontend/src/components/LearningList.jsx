import { useState } from 'react';
import { FiEdit, FiTrash2, FiFilter } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import API from '../api/axios.js';

const LearningList = ({ sessions, onEdit, onDelete }) => {
  const [filters, setFilters] = useState({
    subject: '',
    difficulty: '',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  const filterByDateRange = (sessionDate) => {
    if (filters.dateRange === 'all') return true;

    const date = new Date(sessionDate);
    if (isNaN(date)) return false;

    const now = new Date();
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);

    if (filters.dateRange === 'week') return diffDays <= 7;
    if (filters.dateRange === 'month') return diffDays <= 30;

    return true;
  };

  const filteredSessions = sessions.filter((session) => {
    if (!filterByDateRange(session.date)) return false;

    if (
      filters.subject &&
      !session.subject?.toLowerCase().includes(filters.subject.toLowerCase())
    ) {
      return false;
    }

    if (filters.difficulty && session.difficulty !== filters.difficulty) {
      return false;
    }

    return true;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/learning/sessions/${id}`);
      toast.success('Session deleted successfully');
      onDelete();
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Learning Sessions</h2>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 btn-secondary"
        >
          <FiFilter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                value={filters.subject}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, subject: e.target.value }))
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, difficulty: e.target.value }))
                }
                className="input-field"
              >
                <option value="">All</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
                }
                className="input-field"
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Subject</th>
              <th className="text-left py-3 px-4">Topic</th>
              <th className="text-left py-3 px-4">Time</th>
              <th className="text-left py-3 px-4">Difficulty</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredSessions.map((session) => (
              <tr
                key={session._id}
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
              >
                <td className="py-3 px-4">
                  {session.date
                    ? format(new Date(session.date), 'MMM dd, yyyy')
                    : '—'}
                </td>

                <td className="py-3 px-4 font-medium">
                  {session.subject || '—'}
                </td>

                <td className="py-3 px-4">{session.topic || '—'}</td>

                <td className="py-3 px-4">
                  {session.timeSpent ? `${session.timeSpent} min` : '—'}
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                      session.difficulty
                    )}`}
                  >
                    {session.difficulty || '—'}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(session)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(session._id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No learning sessions found.
        </div>
      )}
    </div>
  );
};

export default LearningList;
