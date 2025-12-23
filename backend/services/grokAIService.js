import axios from 'axios';

class GrokAIService {
  constructor() {
    this.apiKey = process.env.GROK_API_KEY;
    this.apiUrl = process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions';
  }

  async analyzeLearningData(learningData) {
    try {
      const prompt = `
Analyze the following learning data and provide structured insights:
Total sessions: ${learningData.totalSessions}
Total time spent: ${learningData.totalTime} minutes
Subjects: ${JSON.stringify(learningData.subjects)}
Average difficulty: ${learningData.avgDifficulty}

Provide:
Weak subjects
Best times for studying
Recommendations
Weekly plan suggestions
`;

      const response = await this.makeRequest(prompt);
      return this.parseAIResponse(response);
    } catch {
      throw new Error('AI analysis failed');
    }
  }

  async generateStudyPlan(userData, preferences) {
    try {
      const prompt = `
Generate a personalized weekly study plan:
Daily available time: ${preferences.dailyGoal} minutes
Subjects: ${preferences.subjects.join(', ')}
Weak areas: ${preferences.weakSubjects.join(', ')}
Learning style: ${preferences.learningStyle}

Include:
Daily schedule
Topic breakdown
Recommended resources
Review sessions
`;

      const response = await this.makeRequest(prompt, 0.7);
      return this.parseStudyPlan(response);
    } catch {
      throw new Error('Study plan generation failed');
    }
  }

  async summarizeNotes(content) {
    try {
      const prompt = `
Summarize the following notes concisely:
${content}

Include:
Main topics
Key concepts
Important formulas
Study advice
`;

      const response = await this.makeRequest(prompt, 0.3);
      return response.choices?.[0]?.message?.content || '';
    } catch {
      return 'AI summary unavailable';
    }
  }

  async getMotivationalMessage() {
    try {
      const prompts = [
        "Give an inspirational quote about learning.",
        "Provide motivational study advice.",
        "Share an encouraging message for students."
      ];

      const response = await this.makeRequest(
        prompts[Math.floor(Math.random() * prompts.length)],
        0.9
      );

      return response.choices?.[0]?.message?.content || '';
    } catch {
      return "Keep learning, every step counts!";
    }
  }

  async makeRequest(prompt, temperature = 0.5) {
    const response = await axios.post(
      this.apiUrl,
      {
        model: "grok-beta",
        messages: [
          { role: "system", content: "You are an AI learning assistant." },
          { role: "user", content: prompt }
        ],
        temperature,
        max_tokens: 1000,
        stream: false
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  }

  parseAIResponse(response) {
    const content = response.choices?.[0]?.message?.content || '';

    return {
      weakSubjects: this.extractSection(content, 'Weak subjects'),
      recommendations: this.extractSection(content, 'Recommendations'),
      studyTips: this.extractSection(content, 'Study tips'),
      productivityScore: this.extractProductivityScore(content)
    };
  }

  parseStudyPlan(response) {
    const content = response.choices?.[0]?.message?.content || '';

    return {
      dailySchedule: this.extractDailySchedule(content),
      topics: this.extractTopics(content),
      resources: this.extractResources(content),
      duration: '1 week'
    };
  }

  extractSection(content, sectionName) {
    const regex = new RegExp(`${sectionName}[:\\s]+([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }

  extractProductivityScore(content) {
    const match = content.match(/productivity score[:\s]*(\d+)/i);
    return match ? parseInt(match[1]) : 7;
  }

  extractDailySchedule(content) {
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const schedule = {};

    days.forEach(day => {
      const regex = new RegExp(`${day}[:\\s]+([\\s\\S]*?)(?=\\n[A-Z]|$)`, 'i');
      const match = content.match(regex);
      schedule[day.toLowerCase()] = match ? match[1].trim() : '';
    });

    return schedule;
  }

  extractTopics(content) {
    const regex = /Topics?[:\s]+([\s\S]*?)(?=\n\n|Resources:|$)/i;
    const match = content.match(regex);
    if (!match) return [];

    return match[1]
      .split('\n')
      .map(t => t.replace(/^[•\-]\s*/, '').trim())
      .filter(Boolean);
  }

  extractResources(content) {
    const regex = /Resources?[:\s]+([\s\S]*?)(?=\n\n|$)/i;
    const match = content.match(regex);
    if (!match) return [];

    return match[1]
      .split('\n')
      .map(r => r.replace(/^[•\-]\s*/, '').trim())
      .filter(Boolean);
  }
}

export default new GrokAIService();
