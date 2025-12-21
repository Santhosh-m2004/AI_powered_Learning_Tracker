import User from '../models/User.js';
import LearningSession from '../models/LearningSession.js';
import StudyPlan from '../models/StudyPlan.js';
import Note from '../models/Note.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });
    
    // Learning session statistics
    const totalSessions = await LearningSession.countDocuments();
    const totalLearningTime = await LearningSession.aggregate([
      { $group: { _id: null, total: { $sum: "$timeSpent" } } }
    ]);
    
    // Study plan statistics
    const totalPlans = await StudyPlan.countDocuments();
    const completedPlans = await StudyPlan.countDocuments({ status: 'completed' });
    
    // Note statistics
    const totalNotes = await Note.countDocuments();
    const notesWithFiles = await Note.countDocuments({ fileUrl: { $exists: true } });
    
    // Daily activity for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyActivity = await LearningSession.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          sessions: { $sum: 1 },
          totalTime: { $sum: "$timeSpent" },
          users: { $addToSet: "$user" }
        }
      },
      {
        $project: {
          date: "$_id",
          sessions: 1,
          totalTime: 1,
          activeUsers: { $size: "$users" }
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    // User engagement metrics
    const activeUsers = await LearningSession.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: "$user",
          sessions: { $sum: 1 },
          totalTime: { $sum: "$timeSpent" }
        }
      },
      {
        $match: {
          sessions: { $gte: 5 }
        }
      },
      {
        $count: "activeUsers"
      }
    ]);
    
    res.json({
      overview: {
        totalUsers,
        newUsersThisMonth,
        totalSessions,
        totalLearningMinutes: totalLearningTime[0]?.total || 0,
        totalPlans,
        planCompletionRate: totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0,
        totalNotes,
        fileUploadRate: totalNotes > 0 ? (notesWithFiles / totalNotes) * 100 : 0
      },
      dailyActivity,
      engagement: {
        activeUsers: activeUsers[0]?.activeUsers || 0,
        engagementRate: totalUsers > 0 ? ((activeUsers[0]?.activeUsers || 0) / totalUsers) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user activity
    const sessions = await LearningSession.find({ user: req.params.id })
      .sort({ date: -1 })
      .limit(10);
    
    const totalTime = await LearningSession.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, total: { $sum: "$timeSpent" } } }
    ]);
    
    const plans = await StudyPlan.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    const notes = await Note.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      user,
      activity: {
        totalSessions: sessions.length,
        totalLearningMinutes: totalTime[0]?.total || 0,
        recentSessions: sessions,
        recentPlans: plans,
        recentNotes: notes
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};