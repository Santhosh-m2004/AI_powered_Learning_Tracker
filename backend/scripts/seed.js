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
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-tracker');
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await LearningSession.deleteMany({});
    await StudyPlan.deleteMany({});
    await Note.deleteMany({});

    // Create admin user
    console.log('Creating users...');
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
      },
      streak: {
        current: 15,
        longest: 30,
        lastActive: new Date()
      }
    });

    // Create regular user
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
        lastActive: new Date(Date.now() - 86400000) // Yesterday
      }
    });

    // Create learning sessions
    console.log('Creating learning sessions...');
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000);

    const sampleSessions = [
      // Regular user sessions
      {
        user: regularUser._id,
        subject: 'Mathematics',
        topic: 'Calculus - Derivatives',
        timeSpent: 60,
        difficulty: 'hard',
        date: yesterday,
        notes: 'Practiced chain rule and implicit differentiation',
        productivityScore: 8,
        tags: ['calculus', 'derivatives', 'advanced']
      },
      {
        user: regularUser._id,
        subject: 'Programming',
        topic: 'React Hooks',
        timeSpent: 45,
        difficulty: 'medium',
        date: today,
        notes: 'Learned useEffect and useState hooks',
        productivityScore: 9,
        tags: ['react', 'hooks', 'frontend']
      },
      {
        user: regularUser._id,
        subject: 'Physics',
        topic: 'Quantum Mechanics',
        timeSpent: 90,
        difficulty: 'hard',
        date: twoDaysAgo,
        notes: 'Schrödinger equation and wave functions',
        productivityScore: 7,
        tags: ['quantum', 'physics', 'advanced']
      },
      {
        user: regularUser._id,
        subject: 'History',
        topic: 'World War II',
        timeSpent: 30,
        difficulty: 'easy',
        date: threeDaysAgo,
        notes: 'Causes and major events',
        productivityScore: 6,
        tags: ['history', 'war', '20th-century']
      },
      // Admin user sessions
      {
        user: adminUser._id,
        subject: 'Machine Learning',
        topic: 'Neural Networks',
        timeSpent: 120,
        difficulty: 'hard',
        date: today,
        notes: 'Backpropagation and gradient descent',
        productivityScore: 8,
        tags: ['ml', 'ai', 'neural-networks']
      },
      {
        user: adminUser._id,
        subject: 'Data Structures',
        topic: 'Binary Trees',
        timeSpent: 75,
        difficulty: 'medium',
        date: yesterday,
        notes: 'Traversal algorithms: inorder, preorder, postorder',
        productivityScore: 9,
        tags: ['algorithms', 'data-structures', 'trees']
      }
    ];

    await LearningSession.insertMany(sampleSessions);

    // Create study plans
    console.log('Creating study plans...');
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
            completed: true,
            completedAt: yesterday,
            notes: 'Vectors and matrices basics'
          },
          {
            subject: 'Programming',
            topic: 'React Context API',
            estimatedTime: 45,
            priority: 'medium',
            completed: true,
            completedAt: yesterday,
            notes: 'Global state management'
          },
          {
            subject: 'Mathematics',
            topic: 'Differential Equations',
            estimatedTime: 90,
            priority: 'high',
            completed: false,
            notes: 'First order equations'
          },
          {
            subject: 'Programming',
            topic: 'Redux Toolkit',
            estimatedTime: 60,
            priority: 'medium',
            completed: false,
            notes: 'State management library'
          },
          {
            subject: 'Physics',
            topic: 'Thermodynamics',
            estimatedTime: 75,
            priority: 'low',
            completed: false
          }
        ],
        date: new Date(),
        status: 'in-progress',
        aiGenerated: true,
        notes: 'Focus on core math concepts and modern frontend frameworks'
      },
      {
        user: adminUser._id,
        title: 'Machine Learning Crash Course',
        type: 'monthly',
        tasks: [
          {
            subject: 'Machine Learning',
            topic: 'Supervised Learning',
            estimatedTime: 120,
            priority: 'high',
            completed: true,
            completedAt: threeDaysAgo
          },
          {
            subject: 'Machine Learning',
            topic: 'Unsupervised Learning',
            estimatedTime: 90,
            priority: 'medium',
            completed: true,
            completedAt: yesterday
          },
          {
            subject: 'Mathematics',
            topic: 'Probability & Statistics',
            estimatedTime: 120,
            priority: 'high',
            completed: false
          },
          {
            subject: 'Programming',
            topic: 'TensorFlow Basics',
            estimatedTime: 90,
            priority: 'medium',
            completed: false
          }
        ],
        date: new Date(),
        status: 'in-progress',
        aiGenerated: false,
        notes: 'Complete ML fundamentals with practical examples'
      }
    ];

    await StudyPlan.insertMany(samplePlans);

    // Create notes
    console.log('Creating notes...');
    const sampleNotes = [
      {
        user: regularUser._id,
        title: 'Calculus Notes',
        content: `## Differential Calculus

### Key Concepts:
1. **Limits**: Understanding behavior as x approaches a value
2. **Derivatives**: Rate of change, slope of tangent line
3. **Rules**: 
   - Power Rule: d/dx(x^n) = n*x^(n-1)
   - Product Rule: (uv)' = u'v + uv'
   - Chain Rule: (f(g(x)))' = f'(g(x)) * g'(x)

### Applications:
- Optimization problems
- Related rates
- Curve sketching

### Example Problems:
1. Find derivative of f(x) = 3x^2 + 2x - 5
2. Apply chain rule to f(x) = sin(x^2)
3. Find maximum area with fixed perimeter`,
        aiSummary: 'Covers fundamental calculus concepts including limits, derivatives, chain rule, product rule, and applications like optimization and related rates. Includes example problems for practice.',
        tags: ['calculus', 'mathematics', 'derivatives', 'optimization'],
        subject: 'Mathematics',
        fileType: 'text'
      },
      {
        user: regularUser._id,
        title: 'React Best Practices',
        content: `# React Development Guidelines

## Component Structure
- Use functional components with hooks
- Keep components small and focused (Single Responsibility)
- Extract reusable logic into custom hooks

## State Management
- Use useState for local component state
- Use useContext for global state (avoid prop drilling)
- Consider Redux Toolkit for complex applications

## Performance Optimization
- Use React.memo() for expensive components
- Implement useCallback for function dependencies
- Use useMemo for expensive calculations
- Implement code splitting with React.lazy()

## Testing
- Write unit tests with Jest
- Use React Testing Library for component tests
- Test user interactions, not implementation details`,
        aiSummary: 'Comprehensive React development guidelines covering component design, hooks usage, state management patterns, performance optimization techniques, and testing strategies.',
        tags: ['react', 'frontend', 'best-practices', 'performance'],
        subject: 'Programming',
        fileType: 'text'
      },
      {
        user: adminUser._id,
        title: 'Neural Networks Fundamentals',
        content: `# Neural Networks Basics

## Architecture
- Input Layer → Hidden Layers → Output Layer
- Each neuron applies weights, bias, and activation function

## Activation Functions
1. Sigmoid: σ(x) = 1 / (1 + e^-x)
2. ReLU: f(x) = max(0, x)
3. Tanh: f(x) = (e^x - e^-x) / (e^x + e^-x)

## Training Process
1. Forward Propagation
2. Loss Calculation (MSE, Cross-Entropy)
3. Backpropagation
4. Gradient Descent Optimization

## Common Architectures
- Feedforward Networks
- Convolutional Neural Networks (CNN)
- Recurrent Neural Networks (RNN)
- Transformers`,
        aiSummary: 'Introduction to neural networks covering architecture, activation functions, training process (forward/back propagation), loss functions, and common network architectures like CNNs and RNNs.',
        tags: ['machine-learning', 'neural-networks', 'deep-learning', 'ai'],
        subject: 'Machine Learning',
        fileType: 'text'
      },
      {
        user: adminUser._id,
        title: 'Quantum Mechanics Principles',
        content: `# Quantum Physics Overview

## Wave-Particle Duality
- Light exhibits both wave and particle properties
- Matter waves (de Broglie hypothesis)

## Schrödinger Equation
Time-dependent: iħ ∂ψ/∂t = Ĥψ
Time-independent: Ĥψ = Eψ

## Key Principles
1. **Superposition**: Quantum states can exist in multiple states simultaneously
2. **Entanglement**: Particles become correlated, affecting each other instantly
3. **Uncertainty Principle**: Δx * Δp ≥ ħ/2

## Applications
- Quantum Computing
- Quantum Cryptography
- Semiconductor Technology`,
        aiSummary: 'Fundamental principles of quantum mechanics including wave-particle duality, Schrödinger equation, superposition, entanglement, uncertainty principle, and modern applications.',
        tags: ['physics', 'quantum-mechanics', 'science', 'advanced'],
        subject: 'Physics',
        fileType: 'text',
        isPublic: true
      }
    ];

    await Note.insertMany(sampleNotes);

    // Create a daily plan for today
    console.log('Creating daily plan...');
    const weeklyPlan = await StudyPlan.findOne({ user: regularUser._id, type: 'weekly' });
    if (weeklyPlan) {
      const dailyTasks = weeklyPlan.tasks
        .filter(task => !task.completed)
        .slice(0, 3)
        .map(task => ({
          subject: task.subject,
          topic: task.topic,
          estimatedTime: task.estimatedTime,
          priority: task.priority,
          completed: false,
          notes: task.notes
        }));

      await StudyPlan.create({
        user: regularUser._id,
        title: `Daily Plan - ${today.toLocaleDateString()}`,
        type: 'daily',
        tasks: dailyTasks,
        date: today,
        status: 'pending',
        sourcePlan: weeklyPlan._id
      });
    }

    // Update user streaks based on activity
    console.log('Updating user streaks...');
    await regularUser.updateStreak();
    await adminUser.updateStreak();

    // Print summary
    console.log('\n✅ Database seeded successfully!');
    console.log('================================');
    console.log('📊 Statistics:');
    console.log(`👥 Users: ${await User.countDocuments()} (1 admin, 1 regular)`);
    console.log(`📚 Learning Sessions: ${await LearningSession.countDocuments()}`);
    console.log(`📋 Study Plans: ${await StudyPlan.countDocuments()}`);
    console.log(`📝 Notes: ${await Note.countDocuments()}`);
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: email: admin@example.com / password: admin123');
    console.log('User:  email: user@example.com / password: user123');
    console.log('\n📌 Note: These are test accounts. Change passwords in production!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the seed function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;