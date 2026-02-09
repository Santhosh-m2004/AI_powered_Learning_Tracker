import LearningSession from '../models/LearningSession.js';

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

export const getSessions = async (req, res) => {
  try {
    const { startDate, endDate, subject, difficulty, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (subject && subject.trim() !== '') query.subject = new RegExp(subject.trim(), 'i');
    if (difficulty) query.difficulty = difficulty;

    const sessions = await LearningSession.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * parseInt(limit))
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

export const getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sessions = await LearningSession.find(query);
    const totalTime = sessions.reduce((sum, s) => sum + s.timeSpent, 0);

    const subjectStats = sessions.reduce((acc, s) => {
      if (!acc[s.subject]) {
        acc[s.subject] = {
          totalTime: 0,
          sessions: 0,
          difficultySum: 0
        };
      }
      acc[s.subject].totalTime += s.timeSpent;
      acc[s.subject].sessions++;
      const diffMap = { easy: 1, medium: 2, hard: 3 };
      acc[s.subject].difficultySum += diffMap[s.difficulty] || 2;
      return acc;
    }, {});

    Object.keys(subjectStats).forEach(sub => {
      subjectStats[sub].avgDifficulty = (
        subjectStats[sub].difficultySum / subjectStats[sub].sessions
      ).toFixed(2);
      delete subjectStats[sub].difficultySum;
    });

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    last7Days.setHours(0, 0, 0, 0);

    const dailyStats = await LearningSession.aggregate([
      { $match: { user: req.user._id, date: { $gte: last7Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalTime: { $sum: "$timeSpent" },
          sessions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const productivityScore = calculateProductivityScore(sessions);

    res.json({
      totalSessions: sessions.length,
      totalTime,
      subjectStats,
      dailyStats,
      productivityScore,
      avgSessionTime: sessions.length > 0 ? (totalTime / sessions.length).toFixed(2) : 0
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSession = async (req, res) => {
  try {
    const session = await LearningSession.findById(req.params.id);

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    Object.assign(session, req.body);
    const updatedSession = await session.save();
    res.json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const session = await LearningSession.findById(req.params.id);

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    await session.deleteOne();
    res.json({ message: 'Session removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const calculateProductivityScore = (sessions) => {
  if (sessions.length === 0) return 5;

  let score = 5;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const recentSessions = sessions.filter(s => new Date(s.date) >= weekAgo);
  if (recentSessions.length >= 5) score += 2;

  const optimalSessions = sessions.filter(s => s.timeSpent >= 25 && s.timeSpent <= 50);
  const optimalPercentage = optimalSessions.length / sessions.length;
  score += optimalPercentage * 2;

  const uniqueSubjects = [...new Set(sessions.map(s => s.subject))];
  score += Math.min(uniqueSubjects.length / 3, 1);

  return Math.min(Math.round(score), 10);
};