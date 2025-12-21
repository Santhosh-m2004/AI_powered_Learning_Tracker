import { useState } from 'react';
import { FiZap, FiTrendingUp, FiInfo } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import API from '../api/axios.js';

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await API.get('/ai/insights');
      setInsights(response.data);
      toast.success('AI insights generated!');
    } catch (error) {
      toast.error('Failed to fetch AI insights');
    } finally {
      setLoading(false);
    }
  };

  const generateStudyPlan = async () => {
    if (!insights) {
      toast.error('Please generate AI insights first');
      return;
    }

    setGeneratingPlan(true);
    try {
      await API.post('/ai/generate-plan', {
        subjects: ['Mathematics', 'Programming', 'Physics'],
        weakSubjects: insights?.insights?.weakSubjects || [],
        dailyGoal: 120,
        learningStyle: 'visual',
      });

      toast.success('Study plan generated!');
    } catch (error) {
      toast.error('Failed to generate study plan');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const getWeakSubjects = async () => {
    try {
      const response = await API.get('/ai/weak-subjects');
      toast.success('Weak subjects analyzed');
      return response.data;
    } catch (error) {
      toast.error('Failed to analyze weak subjects');
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <FiZap className="w-5 h-5 mr-2 text-yellow-500" />
            AI Insights
          </h2>
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Analyzing...' : 'Get AI Insights'}
          </button>
        </div>

        {insights ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Motivation
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {insights?.motivation || 'Stay consistent and keep improving daily.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center">
                  <FiInfo className="w-4 h-4 mr-2" />
                  Recommendations
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {insights?.insights?.recommendations ||
                    'Focus on consistent daily practice'}
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2 flex items-center">
                  <FiTrendingUp className="w-4 h-4 mr-2" />
                  Study Tips
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {insights?.insights?.studyTips ||
                    'Use spaced repetition for better retention'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Click "Get AI Insights" to analyze your learning patterns and get
            personalized recommendations.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Generate Study Plan</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get a personalized study plan based on your learning patterns and
            goals.
          </p>
          <button
            onClick={generateStudyPlan}
            disabled={generatingPlan}
            className="w-full btn-primary"
          >
            {generatingPlan ? 'Generating...' : 'Generate Plan'}
          </button>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Weak Subjects Analysis
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Identify areas that need more focus based on your performance data.
          </p>
          <button
            onClick={getWeakSubjects}
            className="w-full btn-secondary"
          >
            Analyze Weak Subjects
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
