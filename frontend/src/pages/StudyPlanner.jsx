import { useState, useEffect } from 'react';
import {
  FiCheckCircle,
  FiCircle,
  FiPlus,
  FiCalendar,
  FiX,
  FiEdit2,
  FiTrash2,
  FiChevronRight,
  FiChevronLeft,
  FiClock,
  FiTarget,
  FiZap,
  FiBookOpen
} from 'react-icons/fi';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import API from '../api/axios.js';
import { toast } from 'react-hot-toast';
import { LoadingPage } from '../components/LoadingSpinner.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

const StudyPlanner = () => {
  const [plans, setPlans] = useState([]);
  const [todayPlan, setTodayPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  // New Plan Fields
  const [newPlan, setNewPlan] = useState({
    title: '',
    type: 'daily',
    tasks: [
      { topic: '', subject: '', estimatedTime: '', priority: 'medium' }
    ],
    notes: ''
  });

  // AI Plan Generation Fields
  const [aiPlanData, setAiPlanData] = useState({
    subjects: [],
    weakSubjects: [],
    dailyGoal: 120,
    learningStyle: 'visual',
    customTopics: ''
  });

  useEffect(() => {
    if (user) {
      fetchPlans();
      fetchTodayPlan();
    }
  }, [user, page, activeTab]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const type = activeTab === 'all' ? '' : activeTab;
      const res = await API.get(`/plans?type=${type}&page=${page}&limit=9`);
      setPlans(res.data.plans || []);
      setTotalPages(res.data.pages || 1);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Failed to load plans');
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
      toast.success(`Task marked as ${completed ? 'completed' : 'incomplete'}`);
      
      // Update local state immediately for better UX
      if (planId === todayPlan?._id) {
        setTodayPlan(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            tasks: prev.tasks.map(task => 
              task._id === taskId ? { ...task, completed } : task
            ),
            progress: calculateProgress(prev.tasks.map(task => 
              task._id === taskId ? { ...task, completed } : task
            ))
          };
        });
      }
      
      fetchPlans();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const calculateProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter(t => t.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const handleViewDetails = (plan) => {
    setSelectedPlan(plan);
    setShowPlanDetails(true);
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      try {
        await API.delete(`/plans/${planId}`);
        toast.success('Plan deleted successfully');
        
        if (selectedPlan?._id === planId) {
          setShowPlanDetails(false);
          setSelectedPlan(null);
        }
        
        fetchPlans();
        fetchTodayPlan();
      } catch (error) {
        toast.error('Failed to delete plan');
      }
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
      if (t.estimatedTime < 5) {
        toast.error('Estimated time must be at least 5 minutes');
        return false;
      }
    }
    return true;
  };

  const handleCreatePlan = async () => {
    if (!validatePlan()) return;

    try {
      await API.post('/plans', newPlan);
      toast.success('Plan created successfully');
      setShowCreateForm(false);
      setNewPlan({
        title: '',
        type: 'daily',
        tasks: [{ topic: '', subject: '', estimatedTime: '', priority: 'medium' }],
        notes: ''
      });
      fetchPlans();
      fetchTodayPlan();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create plan');
    }
  };

  const handleAISubmit = async () => {
    if (!aiPlanData.subjects.length && !aiPlanData.customTopics) {
      toast.error('Please provide subjects or topics for AI to generate a plan');
      return;
    }

    try {
      let subjects = [...aiPlanData.subjects];
      if (aiPlanData.customTopics) {
        const customTopics = aiPlanData.customTopics.split(',').map(t => t.trim()).filter(t => t);
        subjects = [...subjects, ...customTopics];
      }

      const response = await API.post('/ai/generate-plan', {
        subjects: subjects,
        weakSubjects: aiPlanData.weakSubjects,
        dailyGoal: aiPlanData.dailyGoal,
        learningStyle: aiPlanData.learningStyle
      });

      toast.success('AI plan generated successfully');
      setShowAIPrompt(false);
      setAiPlanData({
        subjects: [],
        weakSubjects: [],
        dailyGoal: 120,
        learningStyle: 'visual',
        customTopics: ''
      });
      fetchPlans();
      fetchTodayPlan();
      
      // Show the generated plan if available
      if (response.data?.plan) {
        setSelectedPlan(response.data.plan);
        setShowPlanDetails(true);
      }
    } catch (error) {
      console.error('AI plan generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate AI plan');
    }
  };

  const completeAllTasks = async (planId) => {
    try {
      const plan = plans.find(p => p._id === planId) || selectedPlan;
      if (!plan) return;

      for (const task of plan.tasks) {
        if (!task.completed) {
          await API.put(`/plans/${planId}/tasks/${task._id}`, { completed: true });
        }
      }

      toast.success('All tasks marked as completed');
      fetchPlans();
      fetchTodayPlan();
      if (selectedPlan?._id === planId) {
        setSelectedPlan(prev => ({
          ...prev,
          tasks: prev.tasks.map(task => ({ ...task, completed: true })),
          progress: 100,
          status: 'completed'
        }));
      }
    } catch (error) {
      toast.error('Failed to complete all tasks');
    }
  };

  const handleSubjectToggle = (subject) => {
    setAiPlanData(prev => {
      const subjects = prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject];
      return { ...prev, subjects };
    });
  };

  const handleWeakSubjectToggle = (subject) => {
    setAiPlanData(prev => {
      const weakSubjects = prev.weakSubjects.includes(subject)
        ? prev.weakSubjects.filter(s => s !== subject)
        : [...prev.weakSubjects, subject];
      return { ...prev, weakSubjects };
    });
  };

  const commonSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Programming', 'Web Development', 'Data Science',
    'History', 'Literature', 'Languages', 'Art', 'Music'
  ];

  if (loading && !plans.length) return <LoadingPage />;

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
                    Study Planner
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Plan, track, and optimize your learning journey
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <FiPlus className="w-5 h-5" />
                    Create Plan
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAIPrompt(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <FiZap className="w-5 h-5" />
                    AI Generate
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 md:mb-8">
              <div className="flex space-x-1 border-b dark:border-gray-700">
                {['today', 'daily', 'weekly', 'monthly', 'all'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setPage(1);
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                      activeTab === tab
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-b-2 border-blue-500'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Today's Plan */}
            {activeTab === 'today' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Today's Plan
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>

                {todayPlan ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
                    <div className="mb-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                          {todayPlan.title}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => completeAllTasks(todayPlan._id)}
                            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm rounded-lg font-medium transition-colors"
                          >
                            Complete All
                          </button>
                          <button
                            onClick={() => handleViewDetails(todayPlan)}
                            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm rounded-lg font-medium transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Progress
                          </span>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">
                            {todayPlan.progress || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${todayPlan.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-3">
                        {todayPlan.tasks?.map((task) => (
                          <div
                            key={task._id}
                            className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                              task.completed
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                            }`}
                          >
                            <div className="flex items-start space-x-4">
                              <button
                                onClick={() => handleTaskToggle(todayPlan._id, task._id, !task.completed)}
                                className="mt-1"
                              >
                                {task.completed ? (
                                  <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <FiCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                                )}
                              </button>
                              <div className="flex-1">
                                <h4
                                  className={`font-medium text-gray-800 dark:text-white ${
                                    task.completed ? 'line-through text-gray-500' : ''
                                  }`}
                                >
                                  {task.topic}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {task.subject}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    task.priority === 'high'
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                      : task.priority === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  }`}>
                                    {task.priority}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <FiClock className="w-4 h-4" />
                                <span className="font-medium">{task.estimatedTime} min</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <FiCalendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No plan for today</p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      <FiPlus className="w-5 h-5" />
                      Create Today's Plan
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* All Plans Grid */}
            {activeTab !== 'today' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Plans
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {plans.length} plans
                  </span>
                </div>

                {plans.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                      {plans.map((plan) => (
                        <motion.div
                          key={plan._id}
                          whileHover={{ y: -4 }}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                        >
                          <div className="p-4 md:p-6">
                            {/* Plan Header */}
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-1 line-clamp-1">
                                  {plan.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                  <FiCalendar className="w-3 h-3" />
                                  {new Date(plan.date).toLocaleDateString()}
                                  <span className="mx-1">•</span>
                                  <span className="capitalize">{plan.type}</span>
                                  {plan.aiGenerated && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <FiZap className="w-3 h-3 text-yellow-500" />
                                      <span>AI</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                plan.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                                  : plan.status === 'in-progress'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {plan.status || 'pending'}
                              </span>
                            </div>

                            {/* Progress */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                <span className="font-medium text-gray-800 dark:text-white">
                                  {plan.progress || 0}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${plan.progress || 0}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Tasks Preview */}
                            <div className="space-y-2 mb-6">
                              {plan.tasks?.slice(0, 3).map((task) => (
                                <div key={task._id} className="flex items-center text-sm">
                                  {task.completed ? (
                                    <FiCheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                                  ) : (
                                    <FiCircle className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                  )}
                                  <span
                                    className={`truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}
                                    title={task.topic}
                                  >
                                    {task.topic}
                                  </span>
                                </div>
                              ))}
                              {plan.tasks?.length > 3 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  +{plan.tasks.length - 3} more tasks
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                              <button
                                onClick={() => handleViewDetails(plan)}
                                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
                              >
                                View Details
                                <FiChevronRight className="w-4 h-4" />
                              </button>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => completeAllTasks(plan._id)}
                                  className="p-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                                  title="Complete All"
                                >
                                  <FiCheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePlan(plan._id)}
                                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  title="Delete Plan"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                          disabled={page === 1}
                          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <FiChevronLeft className="w-4 h-4" />
                          Previous
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Page {page} of {totalPages}
                        </span>
                        <button
                          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={page === totalPages}
                          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Next
                          <FiChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <FiTarget className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No {activeTab} plans found
                    </p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      <FiPlus className="w-5 h-5" />
                      Create {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Plan
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Create Plan Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Create Study Plan
                  </h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newPlan.title}
                    onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                    placeholder="e.g., Daily Study Plan"
                  />
                </div>

                {/* Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">
                    Plan Type
                  </label>
                  <select
                    value={newPlan.type}
                    onChange={(e) => setNewPlan({ ...newPlan, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newPlan.notes}
                    onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                    placeholder="Add any additional notes..."
                    rows="3"
                  />
                </div>

                {/* Tasks */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Tasks</h3>

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
                          className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                        />

                        <input
                          type="text"
                          placeholder="Subject *"
                          value={task.subject}
                          onChange={(e) => updateTaskField(idx, 'subject', e.target.value)}
                          className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                        />

                        <input
                          type="number"
                          placeholder="Estimated time (min) *"
                          value={task.estimatedTime}
                          onChange={(e) => updateTaskField(idx, 'estimatedTime', e.target.value)}
                          min="5"
                          className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                        />

                        <select
                          value={task.priority}
                          onChange={(e) => updateTaskField(idx, 'priority', e.target.value)}
                          className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      {newPlan.tasks.length > 1 && (
                        <button
                          onClick={() => removeTaskField(idx)}
                          className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          Remove Task
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={addTaskField}
                    className="w-full py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                  >
                    + Add Task
                  </button>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePlan}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Create Plan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Plan Generation Modal */}
      <AnimatePresence>
        {showAIPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    AI Plan Generator
                  </h2>
                  <button
                    onClick={() => setShowAIPrompt(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Let AI create a personalized study plan based on your preferences
                </p>

                {/* Subjects */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3 text-gray-800 dark:text-white">
                    Select Subjects
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commonSubjects.map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleSubjectToggle(subject)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          aiPlanData.subjects.includes(subject)
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Topics */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">
                    Custom Topics (comma separated)
                  </label>
                  <textarea
                    value={aiPlanData.customTopics}
                    onChange={(e) => setAiPlanData({ ...aiPlanData, customTopics: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                    placeholder="e.g., Machine Learning, Web Security, Digital Marketing"
                    rows="2"
                  />
                </div>

                {/* Weak Subjects */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3 text-gray-800 dark:text-white">
                    Weak Areas (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commonSubjects.map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleWeakSubjectToggle(subject)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          aiPlanData.weakSubjects.includes(subject)
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Goal & Learning Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">
                      Daily Goal (minutes)
                    </label>
                    <input
                      type="number"
                      value={aiPlanData.dailyGoal}
                      onChange={(e) => setAiPlanData({ ...aiPlanData, dailyGoal: parseInt(e.target.value) || 120 })}
                      min="30"
                      max="480"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">
                      Learning Style
                    </label>
                    <select
                      value={aiPlanData.learningStyle}
                      onChange={(e) => setAiPlanData({ ...aiPlanData, learningStyle: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                    >
                      <option value="visual">Visual</option>
                      <option value="auditory">Auditory</option>
                      <option value="kinesthetic">Kinesthetic</option>
                      <option value="reading">Reading/Writing</option>
                    </select>
                  </div>
                </div>

                {/* Selected Summary */}
                {(aiPlanData.subjects.length > 0 || aiPlanData.weakSubjects.length > 0) && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                      Selected Preferences:
                    </h4>
                    <div className="space-y-1">
                      {aiPlanData.subjects.length > 0 && (
                        <p className="text-sm">
                          <span className="font-medium">Subjects:</span>{' '}
                          {aiPlanData.subjects.join(', ')}
                        </p>
                      )}
                      {aiPlanData.weakSubjects.length > 0 && (
                        <p className="text-sm">
                          <span className="font-medium">Focus Areas:</span>{' '}
                          {aiPlanData.weakSubjects.join(', ')}
                        </p>
                      )}
                      <p className="text-sm">
                        <span className="font-medium">Daily Goal:</span>{' '}
                        {aiPlanData.dailyGoal} minutes
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAIPrompt(false)}
                    className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAISubmit}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Generate AI Plan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Plan Details Modal */}
      <AnimatePresence>
        {showPlanDetails && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 md:p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {selectedPlan.title}
                      </h2>
                      {selectedPlan.aiGenerated && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded-full flex items-center gap-1">
                          <FiZap className="w-3 h-3" />
                          AI Generated
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {new Date(selectedPlan.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <span className="capitalize">• {selectedPlan.type} Plan</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedPlan.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                          : selectedPlan.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {selectedPlan.status || 'pending'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPlanDetails(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-4"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      Overall Progress
                    </span>
                    <span className="text-lg font-bold text-gray-800 dark:text-white">
                      {selectedPlan.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${selectedPlan.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Notes */}
                {selectedPlan.notes && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                      Notes
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedPlan.notes}</p>
                  </div>
                )}

                {/* Tasks */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Tasks ({selectedPlan.tasks?.length || 0})
                    </h3>
                    <button
                      onClick={() => completeAllTasks(selectedPlan._id)}
                      className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm rounded-lg font-medium transition-colors"
                    >
                      Complete All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedPlan.tasks?.map((task, index) => (
                      <div
                        key={task._id || index}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          task.completed
                            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <button
                              onClick={() => handleTaskToggle(selectedPlan._id, task._id, !task.completed)}
                              className="mt-1"
                            >
                              {task.completed ? (
                                <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <FiCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                              )}
                            </button>
                            <div className="flex-1">
                              <h4 className={`font-medium text-gray-800 dark:text-white ${
                                task.completed ? 'line-through text-gray-500' : ''
                              }`}>
                                {task.topic}
                              </h4>
                              <div className="flex flex-wrap items-center gap-3 mt-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {task.subject}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  task.priority === 'high'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                    : task.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                }`}>
                                  {task.priority} priority
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                              <FiClock className="w-4 h-4" />
                              <span className="font-medium">{task.estimatedTime} min</span>
                            </div>
                            {task.completed && task.completedAt && (
                              <span className="text-xs text-gray-500">
                                Completed: {new Date(task.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-6 border-t dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Created: {new Date(selectedPlan.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowPlanDetails(false);
                        setShowCreateForm(true);
                        // Here you would load the selected plan into edit form
                      }}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4 inline mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(selectedPlan._id)}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg font-medium transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4 inline mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyPlanner;