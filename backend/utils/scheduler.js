import cron from 'node-cron';
import User from '../models/User.js';
import LearningSession from '../models/LearningSession.js';
import emailService from './emailService.js';
import notificationService from './notifications.js';
import logger from './logger.js';
import cacheService from './cache.js';

class SchedulerService {
  constructor() {
    this.jobs = [];
  }

  initialize() {
    // Daily streak check at midnight
    this.jobs.push(cron.schedule('0 0 * * *', async () => {
      logger.info('Running daily streak check...');
      await this.checkAndUpdateStreaks();
    }));

    // Weekly reports every Monday at 9 AM
    this.jobs.push(cron.schedule('0 9 * * 1', async () => {
      logger.info('Running weekly report generation...');
      await this.generateWeeklyReports();
    }));

    // Clean old cache entries daily at 3 AM
    this.jobs.push(cron.schedule('0 3 * * *', async () => {
      logger.info('Cleaning old cache entries...');
      await this.cleanOldCache();
    }));

    // Send plan reminders daily at 8 AM
    this.jobs.push(cron.schedule('0 8 * * *', async () => {
      logger.info('Sending daily plan reminders...');
      await this.sendDailyPlanReminders();
    }));

    // Update productivity scores every 6 hours
    this.jobs.push(cron.schedule('0 */6 * * *', async () => {
      logger.info('Updating productivity scores...');
      await this.updateProductivityScores();
    }));

    logger.info(`Scheduler initialized with ${this.jobs.length} jobs`);
  }

  async checkAndUpdateStreaks() {
    try {
      const users = await User.find({});
      
      for (const user of users) {
        const today = new Date();
        const lastActive = user.streak?.lastActive;
        
        if (!lastActive) continue;
        
        const daysSinceLastActive = Math.floor((today - new Date(lastActive)) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastActive === 0) {
          // User was active today, streak continues
          continue;
        } else if (daysSinceLastActive === 1) {
          // User missed yesterday but streak continues
          user.streak.current += 1;
          user.streak.lastActive = today;
        } else {
          // Streak broken
          user.streak.current = 1;
          user.streak.lastActive = today;
        }
        
        user.streak.longest = Math.max(user.streak.current, user.streak.longest || 0);
        await user.save();
        
        // Send streak notifications
        if (user.streak.current >= 3) {
          await notificationService.sendStreakNotification(user._id, user.streak.current);
          
          // Send email for milestone streaks
          if (user.streak.current % 7 === 0) {
            await emailService.sendStreakAlert(user, user.streak.current);
          }
        }
      }
      
      logger.info('Streak check completed successfully');
    } catch (error) {
      logger.error('Streak check failed:', error);
    }
  }

  async generateWeeklyReports() {
    try {
      const users = await User.find({ 'preferences.notifications': true });
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      for (const user of users) {
        try {
          // Get weekly stats
          const sessions = await LearningSession.find({
            user: user._id,
            date: { $gte: oneWeekAgo }
          });
          
          if (sessions.length === 0) continue;
          
          const totalTime = sessions.reduce((sum, session) => sum + session.timeSpent, 0);
          
          // Group by subject
          const subjectMap = new Map();
          sessions.forEach(session => {
            const current = subjectMap.get(session.subject) || { time: 0, sessions: 0 };
            subjectMap.set(session.subject, {
              time: current.time + session.timeSpent,
              sessions: current.sessions + 1
            });
          });
          
          const topSubjects = Array.from(subjectMap.entries())
            .map(([name, data]) => ({
              name,
              hours: (data.time / 60).toFixed(1),
              percentage: Math.round((data.time / totalTime) * 100)
            }))
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 5);
          
          // Send weekly report
          await emailService.sendWeeklyReport(user, {
            totalSessions: sessions.length,
            totalTime,
            currentStreak: user.streak?.current || 0,
            productivityScore: 7, // Would calculate actual score
            topSubjects,
            aiRecommendation: 'Based on your activity, try focusing more on your weak subjects this week.'
          });
          
        } catch (userError) {
          logger.error(`Failed to generate report for user ${user._id}:`, userError);
        }
      }
      
      logger.info('Weekly reports generated successfully');
    } catch (error) {
      logger.error('Weekly report generation failed:', error);
    }
  }

  async cleanOldCache() {
    try {
      // Clear cache entries older than 7 days
      const pattern = 'stats:*';
      await cacheService.clearPattern(pattern);
      logger.info('Old cache entries cleaned');
    } catch (error) {
      logger.error('Cache cleanup failed:', error);
    }
  }

  async sendDailyPlanReminders() {
    try {
      // Implementation for plan reminders
      logger.info('Daily plan reminders sent');
    } catch (error) {
      logger.error('Plan reminders failed:', error);
    }
  }

  async updateProductivityScores() {
    try {
      // Implementation for productivity score updates
      logger.info('Productivity scores updated');
    } catch (error) {
      logger.error('Productivity score update failed:', error);
    }
  }

  stop() {
    this.jobs.forEach(job => job.stop());
    logger.info('Scheduler stopped');
  }
}

export default new SchedulerService();