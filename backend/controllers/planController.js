import StudyPlan from '../models/StudyPlan.js';

// @desc    Create study plan
// @route   POST /api/plans
// @access  Private
export const createPlan = async (req, res) => {
  try {
    const plan = new StudyPlan({
      user: req.user._id,
      ...req.body
    });

    const createdPlan = await plan.save();
    res.status(201).json(createdPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all study plans
// @route   GET /api/plans
// @access  Private
export const getPlans = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    
    const query = { user: req.user._id };
    
    if (type) query.type = type;
    if (status) query.status = status;
    
    const plans = await StudyPlan.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await StudyPlan.countDocuments(query);
    
    res.json({
      plans,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get plan by ID
// @route   GET /api/plans/:id
// @access  Private
export const getPlanById = async (req, res) => {
  try {
    const plan = await StudyPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    // Check ownership
    if (plan.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update plan task completion
// @route   PUT /api/plans/:id/tasks/:taskId
// @access  Private
export const updateTaskCompletion = async (req, res) => {
  try {
    const { completed } = req.body;
    const plan = await StudyPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    // Check ownership
    if (plan.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Find and update task
    const taskIndex = plan.tasks.findIndex(
      task => task._id.toString() === req.params.taskId
    );
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    plan.tasks[taskIndex].completed = completed;
    plan.tasks[taskIndex].completedAt = completed ? new Date() : null;
    
    // Update plan status based on progress
    const completedTasks = plan.tasks.filter(task => task.completed).length;
    plan.progress = Math.round((completedTasks / plan.tasks.length) * 100);
    
    if (plan.progress === 100) {
      plan.status = 'completed';
    } else if (plan.progress > 0) {
      plan.status = 'in-progress';
    }
    
    const updatedPlan = await plan.save();
    
    res.json(updatedPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update plan
// @route   PUT /api/plans/:id
// @access  Private
export const updatePlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    // Check ownership
    if (plan.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    Object.assign(plan, req.body);
    const updatedPlan = await plan.save();
    
    res.json(updatedPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete plan
// @route   DELETE /api/plans/:id
// @access  Private
export const deletePlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    // Check ownership
    if (plan.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await plan.deleteOne();
    res.json({ message: 'Plan removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get today's plan
// @route   GET /api/plans/today
// @access  Private
export const getTodayPlan = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const plan = await StudyPlan.findOne({
      user: req.user._id,
      date: { $gte: today, $lt: tomorrow },
      type: 'daily'
    });
    
    if (!plan) {
      // Check for weekly plan and extract today's tasks
      const weeklyPlan = await StudyPlan.findOne({
        user: req.user._id,
        type: 'weekly',
        status: { $in: ['pending', 'in-progress'] }
      }).sort({ date: -1 });
      
      if (weeklyPlan) {
        // Create daily plan from weekly plan
        const dailyTasks = weeklyPlan.tasks
          .filter(task => !task.completed)
          .slice(0, 3); // Get 3 uncompleted tasks
        
        const dailyPlan = new StudyPlan({
          user: req.user._id,
          title: `Daily Plan - ${today.toLocaleDateString()}`,
          type: 'daily',
          tasks: dailyTasks,
          date: today,
          status: 'pending'
        });
        
        const createdPlan = await dailyPlan.save();
        return res.json(createdPlan);
      }
      
      return res.json(null);
    }
    
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};