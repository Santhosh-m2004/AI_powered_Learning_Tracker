import { useState, useEffect } from 'react';
import { FiCheckCircle, FiCircle, FiPlus, FiCalendar } from 'react-icons/fi';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import API from '../api/axios.js';
import { toast } from 'react-hot-toast';

const StudyPlanner = () => {
  const [plans, setPlans] = useState([]);
  const [todayPlan, setTodayPlan] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    type: 'daily',
    tasks: []
  });

  useEffect(() => {
    fetchPlans();
    fetchTodayPlan();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await API.get('/plans');
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const fetchTodayPlan = async () => {
    try {
      const response = await API.get('/plans/today');
      setTodayPlan(response.data);
    } catch (error) {
      console.error('Failed to fetch today plan:', error);
    }
  };

  const handleTaskToggle = async (planId, taskId, completed) => {
    try {
      await API.put(`/plans/${planId}/tasks/${taskId}`, { completed });
      
      if (todayPlan && todayPlan._id === planId) {
        fetchTodayPlan();
      }
      fetchPlans();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleCreatePlan = async () => {
    try {
      await API.post('/plans', newPlan);
      toast.success('Plan created successfully');
      setShowCreateForm(false);
      setNewPlan({ title: '', type: 'daily', tasks: [] });
      fetchPlans();
    } catch (error) {
      toast.error('Failed to create plan');
    }
  };

  const generateAIPlan = async () => {
    try {
      const response = await API.post('/ai/generate-plan', {
        subjects: ['Mathematics', 'Programming'],
        weakSubjects: [],
        dailyGoal: 120,
        learningStyle: 'visual'
      });
      
      toast.success('AI plan generated');
      fetchPlans();
    } catch (error) {
      toast.error('Failed to generate AI plan');
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
                <h1 className="text-2xl font-bold">Study Planner</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Plan and organize your study sessions
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary flex items-center"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Create Plan
                </button>
                
                <button
                  onClick={generateAIPlan}
                  className="btn-secondary flex items-center"
                >
                  <FiCalendar className="w-4 h-4 mr-2" />
                  AI Generate
                </button>
              </div>
            </div>

            {/* Today's Plan */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Today's Plan</h2>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </span>
              </div>

              {todayPlan ? (
                <div className="card">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">{todayPlan.title}</h3>
                    <div className="flex items-center mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${todayPlan.progress}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm">{todayPlan.progress}%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {todayPlan.tasks.map((task, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center">
                          <button
                            onClick={() => handleTaskToggle(todayPlan._id, task._id, !task.completed)}
                            className="mr-3"
                          >
                            {task.completed ? (
                              <FiCheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <FiCircle className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <div>
                            <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                              {task.topic}
                            </h4>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-sm text-gray-500">{task.subject}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-gray-500">{task.estimatedTime} min</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card text-center py-8">
                  <p className="text-gray-500 mb-4">No plan for today</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="btn-primary"
                  >
                    Create Daily Plan
                  </button>
                </div>
              )}
            </div>

            {/* All Plans */}
            <div>
              <h2 className="text-xl font-semibold mb-4">All Study Plans</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div key={plan._id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{plan.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(plan.date).toLocaleDateString()} • {plan.type}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                        plan.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{plan.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${plan.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {plan.tasks.slice(0, 3).map((task, index) => (
                        <div key={index} className="flex items-center">
                          {task.completed ? (
                            <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <FiCircle className="w-4 h-4 text-gray-400 mr-2" />
                          )}
                          <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}>
                            {task.topic}
                          </span>
                        </div>
                      ))}
                      {plan.tasks.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{plan.tasks.length - 3} more tasks
                        </p>
                      )}
                    </div>

                    <button className="w-full btn-secondary text-sm">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudyPlanner;