export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateTimeSpent = (time) => {
  return Number.isInteger(time) && time > 0 && time <= 480; // Max 8 hours
};

export const validateDifficulty = (difficulty) => {
  return ['easy', 'medium', 'hard'].includes(difficulty);
};

export const validateDate = (date) => {
  return date instanceof Date && !isNaN(date);
};