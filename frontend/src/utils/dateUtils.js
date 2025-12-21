import { 
  format, 
  formatDistance, 
  formatRelative, 
  subDays, 
  addDays,
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  parseISO,
  differenceInDays,
  differenceInHours,
  differenceInMinutes
} from 'date-fns';

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM dd, yyyy • hh:mm a');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatRelative(new Date(date), new Date());
};

export const formatTimeAgo = (date) => {
  if (!date) return '';
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

export const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getWeekRange = () => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  return {
    start: formatDate(weekStart, 'yyyy-MM-dd'),
    end: formatDate(weekEnd, 'yyyy-MM-dd'),
    label: `${formatDate(weekStart, 'MMM dd')} - ${formatDate(weekEnd, 'MMM dd')}`
  };
};

export const getMonthRange = () => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  return {
    start: formatDate(monthStart, 'yyyy-MM-dd'),
    end: formatDate(monthEnd, 'yyyy-MM-dd'),
    label: formatDate(monthStart, 'MMMM yyyy')
  };
};

export const getDateFilters = () => {
  const today = new Date();
  
  return [
    {
      label: 'Today',
      value: 'today',
      startDate: formatDate(today, 'yyyy-MM-dd'),
      endDate: formatDate(today, 'yyyy-MM-dd')
    },
    {
      label: 'Yesterday',
      value: 'yesterday',
      startDate: formatDate(subDays(today, 1), 'yyyy-MM-dd'),
      endDate: formatDate(subDays(today, 1), 'yyyy-MM-dd')
    },
    {
      label: 'Last 7 Days',
      value: 'week',
      startDate: formatDate(subDays(today, 6), 'yyyy-MM-dd'),
      endDate: formatDate(today, 'yyyy-MM-dd')
    },
    {
      label: 'Last 30 Days',
      value: 'month',
      startDate: formatDate(subDays(today, 29), 'yyyy-MM-dd'),
      endDate: formatDate(today, 'yyyy-MM-dd')
    },
    {
      label: 'All Time',
      value: 'all',
      startDate: null,
      endDate: null
    }
  ];
};

export const parseDateRange = (range) => {
  const filters = getDateFilters();
  const filter = filters.find(f => f.value === range) || filters[0];
  
  return {
    startDate: filter.startDate,
    endDate: filter.endDate
  };
};

export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const calculateAge = (date) => {
  if (!date) return '';
  
  const birthDate = new Date(date);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  
  return parts.join(' ') || '0m';
};

export const getTimeOfDay = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
};