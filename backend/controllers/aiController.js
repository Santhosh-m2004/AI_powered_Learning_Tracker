import GrokAIService from '../services/grokAIService.js';
import LearningSession from '../models/LearningSession.js';

// @desc    Get AI learning insights
// @route   GET /api/ai/insights
// @access  Private
export const getInsights = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    // Get learning data for specified period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const sessions = await LearningSession.find({
      user: req.user._id,
      date: { $gte: startDate }
    });
    
    if (sessions.length === 0) {
      return res.json({
        message: 'No learning data available for analysis',
        recommendations: 'Start tracking your learning sessions to get personalized insights'
      });
    }
    
    // Prepare data for AI analysis
    const learningData = {
      totalSessions: sessions.length,
      totalTime: sessions.reduce((sum, session) => sum + session.timeSpent, 0),
      subjects: {},
      avgDifficulty: 0
    };
    
    // Group by subject
    sessions.forEach(session => {
      if (!learningData.subjects[session.subject]) {
        learningData.subjects[session.subject] = {
          time: 0,
          sessions: 0,
          difficulty: 0
        };
      }
      learningData.subjects[session.subject].time += session.timeSpent;
      learningData.subjects[session.subject].sessions++;
      learningData.subjects[session.subject].difficulty += 
        session.difficulty === 'easy' ? 1 : session.difficulty === 'medium' ? 2 : 3;
    });
    
    // Get AI insights
    const insights = await GrokAIService.analyzeLearningData(learningData);
    
    // Get motivational message
    const motivation = await GrokAIService.getMotivationalMessage();
    
    res.json({
      insights,
      motivation,
      summary: {
        periodDays: days,
        totalSessions: learningData.totalSessions,
        totalHours: (learningData.totalTime / 60).toFixed(1)
      }
    });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ message: 'Failed to generate AI insights' });
  }
};

// @desc    Generate study plan
// @route   POST /api/ai/generate-plan
// @access  Private
export const generateStudyPlan = async (req, res) => {
  try {
    const { subjects, weakSubjects, dailyGoal, learningStyle } = req.body;
    
    // Validate input
    if (!subjects || subjects.length === 0) {
      return res.status(400).json({ message: 'Subjects are required' });
    }
    
    // Prepare user data
    const userData = {
      dailyGoal: dailyGoal || 120,
      subjects: subjects,
      weakSubjects: weakSubjects || [],
      learningStyle: learningStyle || 'visual'
    };
    
    // Generate plan using AI
    const aiPlan = await GrokAIService.generateStudyPlan(userData, userData);
    
    // Convert AI plan to database format
    const studyPlan = new StudyPlan({
      user: req.user._id,
      title: `AI-Generated ${userData.subjects.join(', ')} Study Plan`,
      type: 'weekly',
      aiGenerated: true,
      tasks: aiPlan.topics.map((topic, index) => ({
        subject: userData.subjects[0],
        topic: topic,
        estimatedTime: 60,
        priority: index < 3 ? 'high' : 'medium'
      })),
      date: new Date(),
      notes: `AI-generated plan focusing on: ${userData.subjects.join(', ')}`
    });
    
    const savedPlan = await studyPlan.save();
    
    res.json({
      plan: savedPlan,
      aiRecommendations: aiPlan
    });
  } catch (error) {
    console.error('Study plan generation error:', error);
    res.status(500).json({ message: 'Failed to generate study plan' });
  }
};

// @desc    Get weak subjects analysis
// @route   GET /api/ai/weak-subjects
// @access  Private
export const analyzeWeakSubjects = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const sessions = await LearningSession.find({
      user: req.user._id,
      date: { $gte: startDate }
    });
    
    if (sessions.length === 0) {
      return res.json({
        weakSubjects: [],
        message: 'Insufficient data for analysis'
      });
    }
    
    // Calculate subject performance
    const subjectPerformance = {};
    
    sessions.forEach(session => {
      if (!subjectPerformance[session.subject]) {
        subjectPerformance[session.subject] = {
          time: 0,
          sessions: 0,
          difficultySum: 0
        };
      }
      
      subjectPerformance[session.subject].time += session.timeSpent;
      subjectPerformance[session.subject].sessions++;
      
      // Convert difficulty to numeric
      const difficultyValue = session.difficulty === 'easy' ? 1 : 
                             session.difficulty === 'medium' ? 2 : 3;
      subjectPerformance[session.subject].difficultySum += difficultyValue;
    });
    
    // Calculate scores
    const subjectScores = Object.entries(subjectPerformance).map(([subject, data]) => {
      const timeScore = data.time / (days * 60); // hours per day
      const difficultyScore = data.difficultySum / data.sessions;
      const frequencyScore = data.sessions / days;
      
      // Weighted total score
      const totalScore = (timeScore * 0.4) + (difficultyScore * 0.4) + (frequencyScore * 0.2);
      
      return {
        subject,
        score: totalScore,
        details: data
      };
    });
    
    // Sort by score (lowest = weakest)
    subjectScores.sort((a, b) => a.score - b.score);
    
    const weakSubjects = subjectScores.slice(0, 3).map(item => item.subject);
    
    res.json({
      weakSubjects,
      performanceAnalysis: subjectScores,
      recommendations: `Focus on improving ${weakSubjects.join(', ')} with targeted practice`
    });
  } catch (error) {
    console.error('Weak subjects analysis error:', error);
    res.status(500).json({ message: 'Analysis failed' });
  }
};