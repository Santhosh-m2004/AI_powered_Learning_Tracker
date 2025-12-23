import { useState, useEffect } from 'react';
import {
  FiCheckCircle,
  FiCircle,
  FiPlus,
  FiCalendar,
  FiX
} from 'react-icons/fi';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import API from '../api/axios.js';
import { toast } from 'react-hot-toast';
import { LoadingPage } from '../components/LoadingSpinner.jsx';

const StudyPlanner = () => {
  const [plans, setPlans] = useState([]);
  const [todayPlan, setTodayPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New Plan Fields
  const [newPlan, setNewPlan] = useState({
    title: '',
    type: 'daily',
    tasks: [
      { topic: '', subject: '', estimatedTime: '', priority: 'medium' }
    ]
  });

  useEffect(() => {
    fetchPlans();
    fetchTodayPlan();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await API.get('/plans');
      setPlans(res.data.plans || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayPlan = async () => {
    try {
      const res = await API.get('/plans/today');
      setTodayPlan(res.data || null);
    } catch (error) {
      console.error('Failed to fetch today plan:', error);
    }
  };

  const handleTaskToggle = async (planId, taskId, completed) => {
    try {
      await API.put(`/plans/${planId}/tasks/${taskId}`, { completed });
      fetchTodayPlan();
      fetchPlans();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const addTaskField = () => {
    setNewPlan(prev => ({
      ...prev,
      tasks: [...prev.tasks, { topic: '', subject: '', estimatedTime: '', priority: 'medium' }]
    }));
  };

  const removeTaskField = (index) => {
    setNewPlan(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  const updateTaskField = (index, key, value) => {
    setNewPlan(prev => {
      const tasks = [...prev.tasks];
      tasks[index][key] = value;
      return { ...prev, tasks };
    });
  };

  const validatePlan = () => {
    if (!newPlan.title.trim()) {
      toast.error('Plan title is required');
      return false;
    }
    if (newPlan.tasks.length === 0) {
      toast.error('Add at least one task');
      return false;
    }
    for (const t of newPlan.tasks) {
      if (!t.topic.trim() || !t.subject.trim() || !t.estimatedTime) {
        toast.error('Fill all task fields');
        return false;
      }
    }
    return true;
  };

  const handleCreatePlan = async () => {
    if (!validatePlan()) return;

    try {
      await API.post('/plans', newPlan);
      toast.success('Plan created');
      setShowCreateForm(false);
      setNewPlan({
        title: '',
        type: 'daily',
        tasks: [{ topic: '', subject: '', estimatedTime: '', priority: 'medium' }]
      });
      fetchPlans();
    } catch {
      toast.error('Failed to create plan');
    }
  };

  const generateAIPlan = async () => {
    try {
      await API.post('/ai/generate-plan', {
        subjects: ['Mathematics', 'Programming'],
        weakSubjects: [],
        dailyGoal: 120,
        learningStyle: 'visual'
      });

      toast.success('AI plan generated');
      fetchPlans();
    } catch {
      toast.error('Failed to generate AI plan');
    }
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
                          style={{ width: `${todayPlan.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm">
                        {todayPlan.progress || 0}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {todayPlan.tasks?.map((task) => (
                      <div
                        key={task._id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center">
                          <button
                            onClick={() =>
                              handleTaskToggle(todayPlan._id, task._id, !task.completed)
                            }
                            className="mr-3"
                          >
                            {task.completed ? (
                              <FiCheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <FiCircle className="w-5 h-5 text-gray-400" />
                            )}
                          </button>

                          <div>
                            <h4
                              className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}
                            >
                              {task.topic}
                            </h4>

                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-sm text-gray-500">
                                {task.subject}
                              </span>
                              <span className="text-sm text-gray-500">•</span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  task.priority === 'high'
                                    ? 'bg-red-100 text-red-800'
                                    : task.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="text-gray-500">
                          {task.estimatedTime} min
                        </span>
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
                          {new Date(plan.date || Date.now()).toLocaleDateString()}
                          {' • '}
                          {plan.type}
                        </p>
                      </div>

                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          plan.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : plan.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {plan.status || 'pending'}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{plan.progress || 0}%</span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${plan.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {plan.tasks?.slice(0, 3).map((t) => (
                        <div key={t._id} className="flex items-center">
                          {t.completed ? (
                            <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <FiCircle className="w-4 h-4 text-gray-400 mr-2" />
                          )}
                          <span
                            className={`text-sm ${t.completed ? 'line-through text-gray-500' : ''}`}
                          >
                            {t.topic}
                          </span>
                        </div>
                      ))}

                      {plan.tasks?.length > 3 && (
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

      {/* Create Plan Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Create Study Plan</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={newPlan.title}
                onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                className="input-field"
                placeholder="e.g., Daily Study Plan"
              />
            </div>

            {/* Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Plan Type</label>
              <select
                value={newPlan.type}
                onChange={(e) => setNewPlan({ ...newPlan, type: e.target.value })}
                className="input-field"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Tasks */}
            <div>
              <h3 className="font-semibold mb-3">Tasks</h3>

              {newPlan.tasks.map((task, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg mb-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <input
                      type="text"
                      placeholder="Topic *"
                      value={task.topic}
                      onChange={(e) => updateTaskField(idx, 'topic', e.target.value)}
                      className="input-field"
                    />

                    <input
                      type="text"
                      placeholder="Subject *"
                      value={task.subject}
                      onChange={(e) => updateTaskField(idx, 'subject', e.target.value)}
                      className="input-field"
                    />

                    <input
                      type="number"
                      placeholder="Estimated time (min) *"
                      value={task.estimatedTime}
                      onChange={(e) => updateTaskField(idx, 'estimatedTime', e.target.value)}
                      className="input-field"
                    />

                    <select
                      value={task.priority}
                      onChange={(e) => updateTaskField(idx, 'priority', e.target.value)}
                      className="input-field"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>

                  </div>

                  {newPlan.tasks.length > 1 && (
                    <button
                      onClick={() => removeTaskField(idx)}
                      className="text-red-600 text-sm mt-3"
                    >
                      Remove Task
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addTaskField}
                className="btn-secondary w-full"
              >
                + Add Task
              </button>
            </div>

            {/* Submit */}
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary px-6"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlan}
                className="btn-primary px-6"
              >
                Create Plan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default StudyPlanner;
