export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!re.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
  return null;
};

export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (name.length > 50) return 'Name must not exceed 50 characters';
  return null;
};

export const validateSubject = (subject) => {
  if (!subject) return 'Subject is required';
  if (subject.length > 100) return 'Subject must not exceed 100 characters';
  return null;
};

export const validateTopic = (topic) => {
  if (!topic) return 'Topic is required';
  if (topic.length > 200) return 'Topic must not exceed 200 characters';
  return null;
};

export const validateTimeSpent = (time) => {
  if (!time) return 'Time spent is required';
  const num = parseInt(time, 10);
  if (isNaN(num)) return 'Time must be a number';
  if (num < 1) return 'Time must be at least 1 minute';
  if (num > 480) return 'Time must not exceed 8 hours (480 minutes)';
  return null;
};

export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
  } = options;

  if (!file) return 'File is required';

  if (file.size > maxSize) {
    return `File size must be less than ${maxSize / 1024 / 1024}MB`;
  }

  if (!allowedTypes.includes(file.type)) {
    return 'File type not allowed. Allowed types: images, PDFs, Word documents, text files';
  }

  return null;
};

export const validateNoteTitle = (title) => {
  if (!title) return 'Title is required';
  if (title.length > 200) return 'Title must not exceed 200 characters';
  return null;
};

export const validateNoteContent = (content) => {
  if (content && content.length > 5000) {
    return 'Content must not exceed 5000 characters';
  }
  return null;
};

export const validateTags = (tags) => {
  if (tags && tags.length > 10) {
    return 'Maximum 10 tags allowed';
  }
  return null;
};

export const validatePlanTitle = (title) => {
  if (!title) return 'Title is required';
  if (title.length > 200) return 'Title must not exceed 200 characters';
  return null;
};

export const validatePlanTasks = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return 'At least one task is required';
  }
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (!task.subject) return `Task ${i + 1}: Subject is required`;
    if (!task.topic) return `Task ${i + 1}: Topic is required`;
    if (!task.estimatedTime || task.estimatedTime < 1) {
      return `Task ${i + 1}: Estimated time must be at least 1 minute`;
    }
  }
  
  return null;
};

export const validateForm = (values, validators) => {
  const errors = {};
  
  for (const [field, validator] of Object.entries(validators)) {
    if (typeof validator === 'function') {
      const error = validator(values[field]);
      if (error) {
        errors[field] = error;
      }
    }
  }
  
  return errors;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};