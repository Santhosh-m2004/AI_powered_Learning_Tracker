import { useState, useEffect } from 'react';
import {
  FiUsers,
  FiBarChart2,
  FiClock,
  FiTrendingUp,
  FiSearch,
  FiCalendar,
  FiActivity,
  FiBookOpen,
  FiTarget
} from 'react-icons/fi';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import API from '../api/axios.js';
import { toast } from 'react-hot-toast';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

  useEffect(() => {
    fetchAdminData();
  }, [currentPage]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        API.get(`/admin/users?page=${currentPage}&limit=${usersPerPage}&search=${search}`),
        API.get('/admin/analytics')
      ]);

      setUsers(usersRes.data.users || []);
      setTotalUsers(usersRes.data.total || 0);
      setTotalPages(usersRes.data.pages || 1);
      setAnalytics(analyticsRes.data || null);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search !== '') {
        fetchAdminData();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const updateUserRole = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated successfully');
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  ))}
                </div>
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const engagement = analytics?.engagement || {};
  const dailyActivity = analytics?.dailyActivity || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Monitor platform performance and manage users
              </p>
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Total Users */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                    <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                      {formatNumber(overview.totalUsers || 0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      +{formatNumber(overview.newUsersThisMonth || 0)} this month
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Learning Time */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg mr-4">
                    <FiClock className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Learning Time</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                      {formatTime(overview.totalLearningMinutes || 0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatNumber(overview.totalSessions || 0)} sessions
                    </p>
                  </div>
                </div>
              </div>

              {/* Plan Completion Rate */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg mr-4">
                    <FiTarget className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Plan Completion Rate</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                      {(overview.planCompletionRate || 0).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatNumber(overview.totalPlans || 0)} plans created
                    </p>
                  </div>
                </div>
              </div>

              {/* Engagement Rate */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg mr-4">
                    <FiTrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Engagement Rate</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                      {(engagement.engagementRate || 0).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatNumber(engagement.activeUsers || 0)} active users
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow mb-6 md:mb-8">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Users Management</h2>
                  <div className="relative w-full md:w-64">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={search}
                      onChange={handleSearch}
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">User</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Joined</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <tr
                            key={user._id}
                            className="border-b hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-700"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full mr-3"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                                    <FiUsers className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium text-gray-800 dark:text-white">{user.name}</div>
                                  {user.streak?.current > 0 && (
                                    <div className="text-xs text-gray-500">
                                      {user.streak.current} day streak
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRole(user._id, e.target.value)}
                                className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-gray-500 dark:text-gray-400">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Platform Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Detailed Statistics */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <FiBarChart2 className="w-5 h-5 mr-2 text-blue-500" />
                  Platform Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Total Sessions</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {formatNumber(overview.totalSessions || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Total Notes</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {formatNumber(overview.totalNotes || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">File Upload Rate</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {(overview.fileUploadRate || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Daily Active Users (Avg)</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {engagement.activeUsers || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Engagement */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <FiActivity className="w-5 h-5 mr-2 text-emerald-500" />
                  User Engagement
                </h3>
                <div className="space-y-6">
                  {/* Active Users Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Active Users (30 days)</span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {engagement.activeUsers || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((engagement.activeUsers / Math.max(overview.totalUsers, 1)) * 100, 100).toFixed(1)}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600 dark:text-gray-400">Recent Activity</span>
                      <span className="text-sm text-gray-500">{dailyActivity.length} days</span>
                    </div>
                    <div className="space-y-2">
                      {dailyActivity.slice(-5).map((day, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{day.date}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-500">{day.sessions || 0} sessions</span>
                            <span className="font-medium">{formatTime(day.totalTime || 0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                    <FiCalendar className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">New Users This Month</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                      {formatNumber(overview.newUsersThisMonth || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
                    <FiBookOpen className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notes with Files</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                      {(overview.fileUploadRate || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg mr-3">
                    <FiTarget className="w-4 h-4 text-amber-600 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg Session Time</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                      {overview.totalSessions > 0 ? 
                        Math.round((overview.totalLearningMinutes || 0) / overview.totalSessions) : 0} min
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;