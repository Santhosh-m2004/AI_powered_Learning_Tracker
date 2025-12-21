import LearningSession from '../models/LearningSession.js';
import StudyPlan from '../models/StudyPlan.js';

// @desc    Create learning session
// @route   POST /api/learning/sessions
// @access  Private
export const createSession = async (req, res) => {
  try {
    const session = new LearningSession({
      user: req.user._id,
      ...req.body
    });

    const createdSession = await session.save();
    res.status(201).json(createdSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all learning sessions
// @route   GET /api/learning/sessions
// @access  Private
export const getSessions = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      subject, 
      difficulty, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = { user: req.user._id };
    
    // Date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Subject filtering
    if (subject) {
      query.subject = new RegExp(subject, 'i');
    }
    
    // Difficulty filtering
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    const sessions = await LearningSession.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await LearningSession.countDocuments(query);
    
    res.json({
      sessions,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get session stats
// @route   GET /api/learning/stats
// @access  Private
export const getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { user: req.user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Get all sessions for stats calculation
    const sessions = await LearningSession.find(query);
    
    // Calculate total time
    const totalTime = sessions.reduce((sum, session) => sum + session.timeSpent, 0);
    
    // Group by subject
    const subjectStats = sessions.reduce((acc, session) => {
      if (!acc[session.subject]) {
        acc[session.subject] = {
          totalTime: 0,
          sessions: 0,
          avgDifficulty: 0
        };
      }
      acc[session.subject].totalTime += session.timeSpent;
      acc[session.subject].sessions++;
      
      // Convert difficulty to numeric for average
      const difficultyMap = { easy: 1, medium: 2, hard: 3 };
      acc[session.subject].avgDifficulty += difficultyMap[session.difficulty] || 2;
      
      return acc;
    }, {});
    
    // Calculate averages
    Object.keys(subjectStats).forEach(subject => {
      subjectStats[subject].avgDifficulty = 
        (subjectStats[subject].avgDifficulty / subjectStats[subject].sessions).toFixed(2);
    });
    
    // Get daily stats for the last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const dailyStats = await LearningSession.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalTime: { $sum: "$timeSpent" },
          sessions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Calculate productivity score
    const productivityScore = calculateProductivityScore(sessions);
    
    res.json({
      totalSessions: sessions.length,
      totalTime,
      subjectStats,
      dailyStats,
      productivityScore,
      avgSessionTime: sessions.length > 0 ? totalTime / sessions.length : 0
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update learning session
// @route   PUT /api/learning/sessions/:id
// @access  Private
export const updateSession = async (req, res) => {
  try {
    const session = await LearningSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check ownership
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    Object.assign(session, req.body);
    const updatedSession = await session.save();
    
    res.json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete learning session
// @route   DELETE /api/learning/sessions/:id
// @access  Private
export const deleteSession = async (req, res) => {
  try {
    const session = await LearningSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check ownership
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await session.deleteOne();
    res.json({ message: 'Session removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Helper function to calculate productivity score
const calculateProductivityScore = (sessions) => {
  if (sessions.length === 0) return 5;
  
  let score = 5;
  
  // Factor 1: Consistency (recent sessions)
  const recentSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  });
  
  if (recentSessions.length >= 5) score += 2;
  
  // Factor 2: Session length (optimal 25-50 minutes)
  const optimalSessions = sessions.filter(s => s.timeSpent >= 25 && s.timeSpent <= 50);
  const optimalPercentage = optimalSessions.length / sessions.length;
  score += optimalPercentage * 2;
  
  // Factor 3: Variety of subjects
  const uniqueSubjects = [...new Set(sessions.map(s => s.subject))];
  score += Math.min(uniqueSubjects.length / 3, 1);
  
  return Math.min(Math.round(score), 10);
};