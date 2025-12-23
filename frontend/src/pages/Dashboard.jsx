import { useState, useEffect } from 'react';
import { 
  FiBook, 
  FiClock, 
  FiTrendingUp, 
  FiTarget,
  FiCalendar,
  FiStar
} from 'react-icons/fi';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import StatsCard from '../components/StatsCard.jsx';
import { TimeSpentChart, SubjectDistributionChart, ProgressChart } from '../components/Charts.jsx';
import AIInsights from '../components/AIInsights.jsx';
import API from '../api/axios.js';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [todayPlan, setTodayPlan] = useState(null);
  const [weeklyChart, setWeeklyChart] = useState([]);
  const [subjectChart, setSubjectChart] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, sessionsRes, planRes] = await Promise.all([
        API.get('/learning/stats'),
        API.get('/learning/sessions?limit=5'),
        API.get('/plans/today')
      ]);

      const statsData = statsRes.data || {};

      setStats(statsData);
      setRecentSessions(sessionsRes.data.sessions || []);
      setTodayPlan(planRes.data || null);

      // Convert weekly breakdown to recharts format
      const weeklyData = (statsData.weeklyBreakdown || []).map((item) => ({
        day: item.day,
        studyTime: item.minutes || 0
      }));
      setWeeklyChart(weeklyData);

      // Convert subject distribution to recharts format
      const subjectData = (statsData.subjectDistribution || []).map((s) => ({
        name: s.subject,
        value: s.minutes || 0
      }));
      setSubjectChart(subjectData);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                icon={FiBook}
                title="Total Sessions"
                value={stats?.totalSessions || 0}
                color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
              />
              
              <StatsCard
                icon={FiClock}
                title="Total Time"
                value={
                  stats ? `${(stats.totalTime / 60).toFixed(1)}h` : '0h'
                }
                color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
              />
              
              <StatsCard
                icon={FiTrendingUp}
                title="Productivity"
                value={stats?.productivityScore || 0}
                color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
              />
              
              <StatsCard
                icon={FiTarget}
                title="Current Streak"
                value={`${stats?.streak?.current || 0} days`}
                color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <TimeSpentChart data={weeklyChart} />
              <SubjectDistributionChart data={subjectChart} />
            </div>

            <div className="mb-8">
              <ProgressChart />
            </div>

            {/* Today's Plan & Recent Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

              {/* Today's Plan */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FiCalendar className="w-5 h-5 mr-2" />
                    Today's Study Plan
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>

                {todayPlan ? (
                  <div className="space-y-3">
                    {todayPlan.tasks?.slice(0, 3).map((task, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{task.topic}</h4>
                          <p className="text-sm text-gray-500">{task.subject}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {task.estimatedTime} min
                          </span>

                          {/* placeholder handler */}
                          <input
                            type="checkbox"
                            checked={task.completed}
                            readOnly
                            className="w-4 h-4 rounded"
                          />
                        </div>
                      </div>
                    ))}

                    <Link to="/planner" className="w-full btn-secondary mt-4 inline-block text-center">
                      View Full Plan
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No plan for today</p>
                    <Link to="/planner" className="btn-primary mt-4 inline-block">
                      Create Daily Plan
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Sessions */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FiStar className="w-5 h-5 mr-2" />
                    Recent Learning Sessions
                  </h3>
                  <Link to="/learning" className="text-sm text-blue-600">
                    View All
                  </Link>
                </div>

                {recentSessions.length > 0 ? (
                  <div className="space-y-3">
                    {recentSessions.map((session) => (
                      <div
                        key={session._id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{session.subject}</h4>
                          <p className="text-sm text-gray-500">{session.topic}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {session.timeSpent} min
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(session.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent sessions</p>
                    <Link to="/learning" className="btn-primary mt-4 inline-block">
                      Start Tracking
                    </Link>
                  </div>
                )}
              </div>

            </div>

            {/* AI Insights */}
            <AIInsights />

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
