import { useState, useEffect } from 'react';
import {
  FiUsers,
  FiBarChart2,
  FiClock,
  FiTrendingUp,
  FiSearch
} from 'react-icons/fi';
import Navbar from '../components/Navbar.jsx';
import API from '../api/axios.js';
import { toast } from 'react-hot-toast';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/analytics')
      ]);

      setUsers(usersRes.data.users || []);
      setAnalytics(analyticsRes.data || null);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)
    );
  });

  const updateUserRole = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalUsers = analytics?.overview?.totalUsers || 0;
  const totalMinutes = analytics?.overview?.totalLearningMinutes || 0;
  const planRate = analytics?.overview?.planCompletionRate || 0;
  const engagementRate = analytics?.engagement?.engagementRate || 0;

  const activeUsers = analytics?.engagement?.activeUsers || 0;

  const dailyActivity = analytics?.dailyActivity || [];
  const lastDayActive =
    dailyActivity.length > 0
      ? dailyActivity[dailyActivity.length - 1].activeUsers || 0
      : 0;

  const dailyActivePercent =
    totalUsers > 0 ? (lastDayActive / totalUsers) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
              </div>
            </div>

            {/* Total Learning Time */}
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <FiClock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Learning Time</p>
                  <p className="text-2xl font-bold">
                    {(totalMinutes / 60).toFixed(0)}h
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Completion Rate */}
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <FiBarChart2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plan Completion Rate</p>
                  <p className="text-2xl font-bold">{planRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Engagement Rate */}
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                  <FiTrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Engagement Rate</p>
                  <p className="text-2xl font-bold">
                    {engagementRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Users</h2>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="pl-10 input-field w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Joined</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
                    >
                      <td className="py-3 px-4 font-medium">{u.name}</td>
                      <td className="py-3 px-4">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u._id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Platform Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Statistics */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">
                Platform Statistics
              </h3>
              <div className="space-y-4">
                {analytics &&
                  Object.entries(analytics.overview).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="font-medium">
                        {typeof value === 'number' && key.includes('Rate')
                          ? `${value.toFixed(1)}%`
                          : typeof value === 'number' &&
                            key.includes('Minutes')
                          ? `${(value / 60).toFixed(0)} hours`
                          : value}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* User Engagement */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">User Engagement</h3>
              <div className="space-y-4">

                {/* Active Users */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Active Users</span>
                    <span>{activeUsers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width:
                          totalUsers > 0
                            ? `${(activeUsers / totalUsers) * 100}%`
                            : '0%'
                      }}
                    ></div>
                  </div>
                </div>

                {/* Daily Active Users */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Daily Active Users</span>
                    <span>{lastDayActive}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width:
                          totalUsers > 0
                            ? `${dailyActivePercent.toFixed(1)}%`
                            : '0%'
                      }}
                    ></div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Admin;
