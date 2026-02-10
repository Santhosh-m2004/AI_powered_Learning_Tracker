import { useState, useEffect } from 'react';
import { 
  FiBook, 
  FiClock, 
  FiTrendingUp, 
  FiTarget,
  FiCalendar,
  FiStar,
  FiZap,
  FiActivity,
  FiCheckCircle
} from 'react-icons/fi';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import StatsCard from '../components/StatsCard.jsx';
import { TimeSpentChart, SubjectDistributionChart, ProgressChart } from '../components/Charts.jsx';
import AIInsights from '../components/AIInsights.jsx';
import API from '../api/axios.js';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalTime: 0,
    productivityScore: 0,
    avgSessionTime: 0,
    subjectStats: {},
    dailyStats: []
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [todayPlan, setTodayPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weeklyChart, setWeeklyChart] = useState([]);
  const [subjectChart, setSubjectChart] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [statsRes, sessionsRes, planRes] = await Promise.all([
        API.get('/learning/stats'),
        API.get('/learning/sessions?limit=5'),
        API.get('/plans/today')
      ]);

      const statsData = statsRes.data || {};
      setStats(statsData);
      setRecentSessions(sessionsRes.data?.sessions || []);
      setTodayPlan(planRes.data || null);

      // Prepare weekly chart data from dailyStats or create default
      if (statsData.dailyStats && statsData.dailyStats.length > 0) {
        const weeklyData = statsData.dailyStats.map(item => ({
          day: item._id || new Date().toLocaleDateString('en-US', { weekday: 'short' }),
          studyTime: item.totalTime || 0
        }));
        setWeeklyChart(weeklyData);
      } else {
        // Create empty weekly data if none exists
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weeklyData = days.map(day => ({
          day,
          studyTime: 0
        }));
        setWeeklyChart(weeklyData);
      }

      // Prepare subject distribution chart
      if (statsData.subjectStats) {
        const subjectData = Object.entries(statsData.subjectStats).map(([name, data]) => ({
          name: name,
          value: data.totalTime || 0,
          sessions: data.sessions || 0
        }));
        setSubjectChart(subjectData);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakData = () => {
    return user?.streak?.current || 0;
  };

  const getProductivityScore = () => {
    return stats.productivityScore || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow animate-pulse h-64"></div>
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
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                Welcome back, {user?.name || 'Learner'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Here's your learning progress and insights
              </p>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <StatsCard
                  icon={FiBook}
                  title="Total Sessions"
                  value={stats.totalSessions || 0}
                  color="bg-blue-100 dark:bg-blue-900"
                  iconColor="text-blue-600 dark:text-blue-300"
                  description="Learning sessions tracked"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <StatsCard
                  icon={FiClock}
                  title="Total Time"
                  value={stats.totalTime ? `${Math.round(stats.totalTime / 60)}h ${stats.totalTime % 60}m` : '0h 0m'}
                  color="bg-emerald-100 dark:bg-emerald-900"
                  iconColor="text-emerald-600 dark:text-emerald-300"
                  description="Time spent learning"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <StatsCard
                  icon={FiTrendingUp}
                  title="Productivity"
                  value={`${getProductivityScore()}/10`}
                  color="bg-amber-100 dark:bg-amber-900"
                  iconColor="text-amber-600 dark:text-amber-300"
                  description="Your efficiency score"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <StatsCard
                  icon={FiTarget}
                  title="Current Streak"
                  value={`${getStreakData()} days`}
                  color="bg-purple-100 dark:bg-purple-900"
                  iconColor="text-purple-600 dark:text-purple-300"
                  description="Consistency matters!"
                />
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                    <FiActivity className="w-5 h-5 mr-2 text-blue-500" />
                    Weekly Study Time
                  </h3>
                  <span className="text-sm text-gray-500">Last 7 days</span>
                </div>
                <div className="h-64">
                  <TimeSpentChart data={weeklyChart} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                    <FiZap className="w-5 h-5 mr-2 text-purple-500" />
                    Subject Distribution
                  </h3>
                  <span className="text-sm text-gray-500">Time by subject</span>
                </div>
                <div className="h-64">
                  <SubjectDistributionChart data={subjectChart} />
                </div>
              </motion.div>
            </div>

            {/* Today's Plan & Recent Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Today's Plan */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                    <FiCalendar className="w-5 h-5 mr-2 text-emerald-500" />
                    Today's Study Plan
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {todayPlan ? (
                  <div className="space-y-3">
                    {todayPlan.tasks?.slice(0, 3).map((task, index) => (
                      <div
                        key={task._id || index}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                          task.completed 
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800' 
                            : 'bg-gray-50 dark:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center ${
                            task.completed 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                            {task.completed && <FiCheckCircle className="w-3 h-3" />}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">{task.topic}</h4>
                            <p className="text-sm text-gray-500">{task.subject}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-medium text-gray-800 dark:text-white">
                            {task.estimatedTime || 30} min
                          </div>
                          <div className={`text-xs ${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-500' : 'text-gray-500'}`}>
                            {task.priority || 'medium'} priority
                          </div>
                        </div>
                      </div>
                    ))}

                    <Link 
                      to="/plans" 
                      className="block w-full mt-4 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-center rounded-lg font-medium transition-colors duration-200"
                    >
                      View Full Plan
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <FiCalendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No plan for today</p>
                    <Link 
                      to="/plans/create" 
                      className="inline-block py-2 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      Create Daily Plan
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Recent Sessions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                    <FiStar className="w-5 h-5 mr-2 text-amber-500" />
                    Recent Learning Sessions
                  </h3>
                  <Link to="/learning" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    View All
                  </Link>
                </div>

                {recentSessions.length > 0 ? (
                  <div className="space-y-3">
                    {recentSessions.map((session) => (
                      <div
                        key={session._id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`mt-1 w-3 h-3 rounded-full ${
                            session.difficulty === 'easy' ? 'bg-emerald-500' :
                            session.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">{session.subject}</h4>
                            <p className="text-sm text-gray-500">{session.topic}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-800 dark:text-white">
                            {session.timeSpent} min
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <FiBook className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No recent sessions</p>
                    <Link 
                      to="/learning/new" 
                      className="inline-block py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      Start Tracking
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>

            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <AIInsights />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-8"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link 
                  to="/learning/new" 
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <FiClock className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Track Session</h4>
                      <p className="text-sm text-gray-500">Log study time</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  to="/plans/create" 
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                      <FiTarget className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Create Plan</h4>
                      <p className="text-sm text-gray-500">Set daily goals</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  to="/notes/new" 
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                      <FiBook className="w-5 h-5 text-amber-600 dark:text-amber-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Add Notes</h4>
                      <p className="text-sm text-gray-500">Save key concepts</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  to="/ai/insights" 
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <FiTrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">AI Analysis</h4>
                      <p className="text-sm text-gray-500">Get insights</p>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;