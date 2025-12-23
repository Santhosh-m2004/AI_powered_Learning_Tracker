import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User.js';
import LearningSession from '../models/LearningSession.js';
import StudyPlan from '../models/StudyPlan.js';
import Note from '../models/Note.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await User.deleteMany({});
    await LearningSession.deleteMany({});
    await StudyPlan.deleteMany({});
    await Note.deleteMany({});

    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      preferences: {
        dailyGoal: 180,
        theme: 'dark',
        notifications: true
      }
    });

    const userPassword = await bcrypt.hash('user123', 10);
    const regularUser = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: userPassword,
      role: 'user',
      preferences: {
        dailyGoal: 120,
        theme: 'light',
        notifications: true
      },
      streak: {
        current: 7,
        longest: 14,
        lastActive: new Date()
      }
    });

    const sampleSessions = [
      {
        user: regularUser._id,
        subject: 'Mathematics',
        topic: 'Calculus - Derivatives',
        timeSpent: 60,
        difficulty: 'hard',
        date: new Date(Date.now() - 86400000),
        productivityScore: 8,
        tags: ['calculus', 'derivatives', 'advanced']
      },
      {
        user: regularUser._id,
        subject: 'Programming',
        topic: 'React Hooks',
        timeSpent: 45,
        difficulty: 'medium',
        date: new Date(),
        productivityScore: 9,
        tags: ['react', 'hooks', 'frontend']
      },
      {
        user: regularUser._id,
        subject: 'Physics',
        topic: 'Quantum Mechanics',
        timeSpent: 90,
        difficulty: 'hard',
        date: new Date(Date.now() - 2 * 86400000),
        productivityScore: 7,
        tags: ['quantum', 'physics', 'advanced']
      },
      {
        user: adminUser._id,
        subject: 'Machine Learning',
        topic: 'Neural Networks',
        timeSpent: 120,
        difficulty: 'hard',
        date: new Date(),
        productivityScore: 8,
        tags: ['ml', 'ai', 'neural-networks']
      }
    ];

    await LearningSession.insertMany(sampleSessions);

    const samplePlans = [
      {
        user: regularUser._id,
        title: 'Weekly Math & Programming Study',
        type: 'weekly',
        tasks: [
          {
            subject: 'Mathematics',
            topic: 'Linear Algebra',
            estimatedTime: 60,
            priority: 'high',
            completed: true
          },
          {
            subject: 'Programming',
            topic: 'React Context API',
            estimatedTime: 45,
            priority: 'medium',
            completed: true
          },
          {
            subject: 'Mathematics',
            topic: 'Differential Equations',
            estimatedTime: 90,
            priority: 'high'
          },
          {
            subject: 'Programming',
            topic: 'Redux Toolkit',
            estimatedTime: 60,
            priority: 'medium'
          }
        ],
        date: new Date(),
        status: 'in-progress',
        aiGenerated: true
      }
    ];

    await StudyPlan.insertMany(samplePlans);

    const sampleNotes = [
      {
        user: regularUser._id,
        title: 'Calculus Notes',
        content:
          'Key concepts in differential calculus including limits, derivatives, and applications.',
        aiSummary:
          'Covers fundamental calculus concepts: limits, derivatives, chain rule, optimization, and related rates problems.',
        tags: ['calculus', 'mathematics', 'derivatives'],
        subject: 'Mathematics',
        fileType: 'text'
      },
      {
        user: adminUser._id,
        title: 'React Best Practices',
        content:
          'Collection of React best practices including component structure, state management, and performance optimization.',
        aiSummary:
          'React development guidelines covering component design, hooks usage, state management patterns, and performance optimization techniques.',
        tags: ['react', 'frontend', 'best-practices'],
        subject: 'Programming',
        fileType: 'text'
      }
    ];

    await Note.insertMany(sampleNotes);

    console.log('Database seeded successfully');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: user@example.com / user123');

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}
