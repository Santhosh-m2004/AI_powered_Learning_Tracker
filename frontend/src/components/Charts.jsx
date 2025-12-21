import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import API from '../api/axios.js';

export const TimeSpentChart = ({ data }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Weekly Study Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="studyTime" fill="#3b82f6" name="Study Time" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SubjectDistributionChart = ({ data }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Subject Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name}: ${entry.value}min`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ProgressChart = () => {
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const response = await API.get('/learning/stats');
      const dailyStats = response.data.dailyStats || [];
      
      const formattedData = dailyStats.map(day => ({
        date: day._id,
        time: day.totalTime,
        sessions: day.sessions
      }));
      
      setProgressData(formattedData);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Learning Progress</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={progressData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="time"
            stroke="#3b82f6"
            name="Study Time (min)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="sessions"
            stroke="#10b981"
            name="Sessions"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};