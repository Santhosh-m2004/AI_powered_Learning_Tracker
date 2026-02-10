// grokAIService.mock.js - For development without API key
class MockGrokAIService {
  constructor() {
    console.log('📱 Using Mock AI Service - For development only');
  }

  async analyzeLearningData(learningData) {
    await this.delay(500);
    
    const subjects = Object.keys(learningData.subjects || {});
    const totalHours = (learningData.totalTime / 60).toFixed(1);
    
    return {
      weakSubjects: this.getWeakSubjects(subjects),
      bestTimes: this.getBestTimes(),
      recommendations: this.getRecommendations(learningData.totalSessions),
      productivityScore: this.calculateProductivityScore(learningData),
      weeklySuggestions: this.getWeeklySuggestions(subjects),
      note: 'Mock AI Response - Set GROK_API_KEY for real analysis'
    };
  }

  async generateStudyPlan(userData) {
    await this.delay(800);
    
    return {
      dailySchedule: this.generateMockSchedule(userData),
      topics: this.generateTopics(userData),
      resources: this.getResources(),
      tips: this.getStudyTips(),
      duration: '1 week',
      generatedAt: new Date().toISOString(),
      note: 'Mock Study Plan - Real AI requires GROK_API_KEY'
    };
  }

  async summarizeNotes(content) {
    await this.delay(300);
    
    if (!content || content.length < 20) {
      return 'Content too short for meaningful summary.';
    }
    
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const summaryPoints = sentences.slice(0, Math.min(4, sentences.length));
    
    return `📝 Summary (Mock):
${summaryPoints.map((s, i) => `${i + 1}. ${s.trim()}`).join('\n')}

✨ Key Takeaway: Focus on understanding core concepts before details.`;
  }

  async getMotivationalMessage() {
    await this.delay(200);
    
    const messages = [
      "🚀 Your potential is limitless. Keep pushing forward!",
      "💡 Every expert was once a beginner. You're on the right path!",
      "🌟 Small daily improvements lead to massive results over time.",
      "📚 The more you learn, the more you realize how much there is to discover.",
      "🔥 Consistency beats intensity. Keep showing up every day!",
      "🎯 Focus on progress, not perfection. Every step counts!"
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Helper methods
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getWeakSubjects(subjects) {
    if (subjects.length === 0) return 'No subjects recorded yet';
    if (subjects.length === 1) return 'Try adding more subjects for better analysis';
    return subjects.slice(0, Math.min(2, subjects.length)).join(', ');
  }

  getBestTimes() {
    const times = [
      'Morning (6-9 AM): High focus, low distractions',
      'Afternoon (2-4 PM): Good for review and practice',
      'Evening (7-9 PM): Best for creative tasks'
    ];
    return times.join('\n');
  }

  getRecommendations(sessionCount) {
    if (sessionCount < 3) return 'Start with 25-minute focused sessions. Track consistently.';
    if (sessionCount < 10) return 'Try spaced repetition: review topics after 1, 7, 30 days.';
    return 'Consider the Pomodoro technique: 25 min focus, 5 min break.';
  }

  calculateProductivityScore(learningData) {
    let score = 5;
    if (learningData.totalSessions > 5) score += 2;
    if (learningData.totalTime > 300) score += 1;
    if (Object.keys(learningData.subjects || {}).length > 2) score += 1;
    return Math.min(Math.max(score, 1), 10);
  }

  getWeeklySuggestions(subjects) {
    if (subjects.length === 0) return 'Start by identifying 2-3 subjects to focus on.';
    
    return `Weekly Plan:
• Monday/Wednesday/Friday: Focus on ${subjects[0] || 'primary subject'}
• Tuesday/Thursday: Focus on ${subjects[1] || 'secondary subject'}
• Weekend: Review and practice tests`;
  }

  generateMockSchedule(userData) {
    const schedule = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const primarySubject = userData.subjects?.[0] || 'Mathematics';
    const secondarySubject = userData.subjects?.[1] || 'Science';
    
    days.forEach((day, index) => {
      if (index < 5) { // Weekdays
        if (index % 2 === 0) {
          schedule[day] = `${primarySubject} (60 min)\nPractice problems (30 min)`;
        } else {
          schedule[day] = `${secondarySubject} (60 min)\nConcept review (30 min)`;
        }
      } else if (index === 5) { // Saturday
        schedule[day] = 'Weekly review (90 min)\nMock test (60 min)';
      } else { // Sunday
        schedule[day] = 'Light revision (45 min)\nPlan next week (15 min)';
      }
    });
    
    return schedule;
  }

  generateTopics(userData) {
    const baseTopics = ['Fundamentals', 'Practice Problems', 'Advanced Concepts', 'Real Applications'];
    const subjectTopics = userData.subjects?.map(subject => 
      `${subject}: ${baseTopics[Math.floor(Math.random() * baseTopics.length)]}`
    ) || [];
    
    return [...subjectTopics, 'Review Sessions', 'Progress Assessment'];
  }

  getResources() {
    return [
      'Khan Academy - Free comprehensive lessons',
      'Coursera/edX - University-level courses',
      'YouTube Education - Visual explanations',
      'Quizlet/Anki - Flashcards for memorization',
      'Practice worksheets online'
    ];
  }

  getStudyTips() {
    return [
      'Study in 25-30 minute blocks with 5-minute breaks',
      'Teach concepts to someone else to reinforce learning',
      'Connect new information to what you already know',
      'Get adequate sleep - it consolidates memory',
      'Stay hydrated and take care of your physical health'
    ].join('\n• ');
  }
}

// Export mock service
export default new MockGrokAIService();