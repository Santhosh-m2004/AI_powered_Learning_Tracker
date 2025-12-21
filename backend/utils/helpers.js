import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd');
};

export const getWeekDates = () => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  return {
    start: weekStart,
    end: weekEnd,
    days: eachDayOfInterval({ start: weekStart, end: weekEnd })
  };
};

export const calculateStreak = (sessions) => {
  if (sessions.length === 0) return 0;
  
  const sortedDates = sessions
    .map(s => new Date(s.date).toDateString())
    .sort()
    .reverse();
  
  let streak = 1;
  let currentDate = new Date();
  
  for (let i = 0; i < sortedDates.length; i++) {
    const sessionDate = new Date(sortedDates[i]);
    const diffDays = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0 || diffDays === 1) {
      if (diffDays === 1) streak++;
      currentDate = sessionDate;
    } else {
      break;
    }
  }
  
  return streak;
};

export const generateRandomId = () => {
  return Math.random().toString(36).substr(2, 9);
};