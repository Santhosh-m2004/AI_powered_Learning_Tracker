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
  if (!data || data.length === 0)
    return <div className="card"><p>No weekly study data available.</p></div>;

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
          <Bar dataKey="studyTime" fill="#2563eb" name="Study Time" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SubjectDistributionChart = ({ data }) => {
  if (!data || data.length === 0)
    return <div className="card"><p>No subject distribution data available.</p></div>;

  const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed'];

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
            label={(entry) => `${entry.name || 'Unknown'}: ${entry.value || 0} min`}
            outerRadius={85}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
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

      const dailyStats = Array.isArray(response.data?.dailyStats)
        ? response.data.dailyStats
        : [];

      const formattedData = dailyStats.map((day) => ({
        date: day._id || '',
        time: day.totalTime || 0,
        sessions: day.sessions || 0
      }));

      setProgressData(formattedData);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    }
  };

  if (progressData.length === 0)
    return <div className="card"><p>No learning progress data available.</p></div>;

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
            stroke="#2563eb"
            name="Study Time (min)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="sessions"
            stroke="#059669"
            name="Sessions"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};