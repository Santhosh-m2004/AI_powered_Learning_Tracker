import StudyPlan from '../models/StudyPlan.js';

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

export const getPlanById = async (req, res) => {
  try {
    const plan = await StudyPlan.findById(req.params.id);

    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    if (plan.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTaskCompletion = async (req, res) => {
  try {
    const { completed } = req.body;
    const plan = await StudyPlan.findById(req.params.id);

    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    if (plan.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    const taskIndex = plan.tasks.findIndex(
      task => task._id.toString() === req.params.taskId
    );

    if (taskIndex === -1)
      return res.status(404).json({ message: 'Task not found' });

    plan.tasks[taskIndex].completed = completed;
    plan.tasks[taskIndex].completedAt = completed ? new Date() : null;

    const completedTasks = plan.tasks.filter(t => t.completed).length;
    plan.progress = Math.round((completedTasks / plan.tasks.length) * 100);

    if (plan.progress === 100) plan.status = 'completed';
    else if (plan.progress > 0) plan.status = 'in-progress';

    const updatedPlan = await plan.save();
    res.json(updatedPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findById(req.params.id);

    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    if (plan.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    Object.assign(plan, req.body);
    const updatedPlan = await plan.save();

    res.json(updatedPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findById(req.params.id);

    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    if (plan.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    await plan.deleteOne();
    res.json({ message: 'Plan removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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
      const weeklyPlan = await StudyPlan.findOne({
        user: req.user._id,
        type: 'weekly',
        status: { $in: ['pending', 'in-progress'] }
      }).sort({ date: -1 });

      if (weeklyPlan) {
        const dailyTasks = weeklyPlan.tasks
          .filter(task => !task.completed)
          .slice(0, 3);

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
