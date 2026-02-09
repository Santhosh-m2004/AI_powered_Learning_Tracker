import GrokAIService from '../services/grokAIService.js';
import LearningSession from '../models/LearningSession.js';
import StudyPlan from '../models/StudyPlan.js';

/* -----------------------------------------
   GET AI LEARNING INSIGHTS
----------------------------------------- */
export const getInsights = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

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

    // Prepare dataset for Grok AI
    const learningData = {
      totalSessions: sessions.length,
      totalTime: sessions.reduce((sum, s) => sum + s.timeSpent, 0),
      subjects: {},
      avgDifficulty: 0
    };

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
        session.difficulty === 'easy' ? 1 :
        session.difficulty === 'medium' ? 2 : 3;
    });

    // 🔥 AI analyzing the data
    const insights = await GrokAIService.analyzeLearningData(learningData);

    // 🔥 AI motivation
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

/* -----------------------------------------
   GENERATE AI STUDY PLAN
----------------------------------------- */
export const generateStudyPlan = async (req, res) => {
  try {
    const {
      subjects = [],
      weakSubjects = [],
      dailyGoal = 120,
      learningStyle = 'visual'
    } = req.body;

    if (!subjects.length) {
      return res.status(400).json({ message: 'Subjects are required' });
    }

    const userData = { subjects, weakSubjects, dailyGoal, learningStyle };

    // 🔥 Generate AI plan
    const aiPlan = await GrokAIService.generateStudyPlan(userData);

    if (!aiPlan || !aiPlan.topics) {
      return res.status(500).json({ message: 'Failed to generate valid study plan' });
    }

    // Convert AI plan → DB structure
    const studyPlan = new StudyPlan({
      user: req.user._id,
      title: `AI-Generated ${subjects.join(', ')} Study Plan`,
      type: 'weekly',
      aiGenerated: true,
      date: new Date(),
      notes: `AI-generated plan focusing on: ${subjects.join(', ')}`,
      tasks: aiPlan.topics.map((topic, i) => ({
        subject: subjects[i % subjects.length] || subjects[0],
        topic: typeof topic === 'string' ? topic : topic.name || `Topic ${i + 1}`,
        estimatedTime: 60,
        priority: i < 3 ? 'high' : 'medium',
        completed: false
      })),
      status: 'pending'
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

/* -----------------------------------------
   ANALYZE WEAK SUBJECTS
----------------------------------------- */
export const analyzeWeakSubjects = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const sessions = await LearningSession.find({
      user: req.user._id,
      date: { $gte: startDate }
    });

    if (!sessions.length) {
      return res.json({
        weakSubjects: [],
        message: 'Insufficient data for analysis'
      });
    }

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

      const difficultyValue =
        session.difficulty === 'easy' ? 1 :
        session.difficulty === 'medium' ? 2 : 3;

      subjectPerformance[session.subject].difficultySum += difficultyValue;
    });

    const subjectScores = Object.entries(subjectPerformance).map(([subject, data]) => {
      const timeScore = data.time / (parseInt(days) * 60);
      const difficultyScore = data.difficultySum / data.sessions;
      const frequencyScore = data.sessions / parseInt(days);

      const totalScore = (timeScore * 0.4) + (difficultyScore * 0.4) + (frequencyScore * 0.2);

      return { 
        subject, 
        score: totalScore, 
        details: data,
        averageTimePerSession: data.time / data.sessions
      };
    });

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