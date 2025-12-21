import axios from 'axios';

class GrokAIService {
  constructor() {
    this.apiKey = process.env.GROK_API_KEY;
    this.apiUrl = process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions';
  }

  async analyzeLearningData(learningData) {
    try {
      const prompt = `Analyze the following learning data and provide insights:
        Total sessions: ${learningData.totalSessions}
        Total time spent: ${learningData.totalTime} minutes
        Subjects: ${JSON.stringify(learningData.subjects)}
        Average difficulty: ${learningData.avgDifficulty}
        
        Provide insights on:
        1. Weak subjects based on time spent vs performance
        2. Best times for studying
        3. Recommendations for improvement
        4. Weekly study plan suggestions`;

      const response = await this.makeRequest(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('Grok AI analysis error:', error);
      throw new Error('AI analysis failed');
    }
  }

  async generateStudyPlan(userData, preferences) {
    try {
      const prompt = `Generate a personalized study plan for a student with the following data:
        Available time per day: ${preferences.dailyGoal} minutes
        Subjects to focus on: ${preferences.subjects.join(', ')}
        Weak areas: ${preferences.weakSubjects.join(', ')}
        Learning style: ${preferences.learningStyle}
        
        Create a detailed weekly plan with:
        1. Daily study schedule
        2. Topic breakdown
        3. Recommended resources
        4. Review sessions`;

      const response = await this.makeRequest(prompt, 0.7);
      return this.parseStudyPlan(response);
    } catch (error) {
      console.error('Grok AI study plan error:', error);
      throw new Error('Study plan generation failed');
    }
  }

  async summarizeNotes(content) {
    try {
      const prompt = `Summarize the following notes concisely, highlighting key points and concepts:
        ${content}
        
        Provide a structured summary with:
        1. Main topics covered
        2. Key concepts
        3. Important formulas/theorems
        4. Study recommendations`;

      const response = await this.makeRequest(prompt, 0.3);
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Grok AI summarization error:', error);
      return 'AI summary unavailable';
    }
  }

  async getMotivationalMessage() {
    try {
      const prompts = [
        "Give an inspirational quote about learning and growth",
        "Provide motivational advice for students",
        "Share an encouraging message about persistence in studies"
      ];
      
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      const response = await this.makeRequest(randomPrompt, 0.9);
      
      return response.choices[0].message.content;
    } catch (error) {
      return "Keep learning, every step counts!";
    }
  }

  async makeRequest(prompt, temperature = 0.5) {
    const response = await axios.post(
      this.apiUrl,
      {
        model: "grok-beta",
        messages: [
          { role: "system", content: "You are an AI learning assistant specialized in educational guidance and study planning." },
          { role: "user", content: prompt }
        ],
        temperature: temperature,
        max_tokens: 1000,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  parseAIResponse(response) {
    const content = response.choices[0].message.content;
    
    // Parse structured response
    const insights = {
      weakSubjects: this.extractSection(content, 'Weak subjects'),
      recommendations: this.extractSection(content, 'Recommendations'),
      studyTips: this.extractSection(content, 'Study tips'),
      productivityScore: this.extractProductivityScore(content)
    };

    return insights;
  }

  parseStudyPlan(response) {
    const content = response.choices[0].message.content;
    
    // Convert AI response to structured plan
    const plan = {
      dailySchedule: this.extractDailySchedule(content),
      topics: this.extractTopics(content),
      resources: this.extractResources(content),
      duration: '1 week'
    };

    return plan;
  }

  extractSection(content, sectionName) {
    const regex = new RegExp(`${sectionName}[:\\s]+([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }

  extractProductivityScore(content) {
    const regex = /productivity score[:\s]*(\d+)/i;
    const match = content.match(regex);
    return match ? parseInt(match[1]) : 7;
  }

  extractDailySchedule(content) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule = {};
    
    days.forEach(day => {
      const regex = new RegExp(`${day}[:\\s]+([\\s\\S]*?)(?=\\n\\n|\\n[A-Z]|$)`, 'i');
      const match = content.match(regex);
      schedule[day.toLowerCase()] = match ? match[1].trim() : '';
    });
    
    return schedule;
  }

  extractTopics(content) {
    const topicRegex = /Topics?[:\\s]+([\\s\\S]*?)(?=\\n\\n|Resources:|$)/
    const match = content.match(topicRegex);
    if (match) {
      return match[1].split('\n').map(topic => topic.replace(/^[•\-]\s*/, '').trim()).filter(Boolean);
    }
    return [];
  }

  extractResources(content) {
    const resourceRegex = /Resources?[:\\s]+([\\s\\S]*?)(?=\\n\\n|$)/
    const match = content.match(resourceRegex);
    if (match) {
      return match[1].split('\n').map(resource => resource.replace(/^[•\-]\s*/, '').trim()).filter(Boolean);
    }
    return [];
  }
}

export default new GrokAIService();