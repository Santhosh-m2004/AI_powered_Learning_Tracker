import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext.jsx';

const ThemeToggle = () => {
  const { theme = 'light', toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="group relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                 hover:bg-gray-200 dark:hover:bg-gray-700 
                 transition-all duration-300 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 dark:focus:ring-offset-gray-800"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-6 h-6 z-10">
        <FiSun
          className={`absolute inset-0 w-6 h-6 text-yellow-500 
                     transition-all duration-300 transform
                     ${theme === 'dark'
                       ? 'opacity-0 rotate-90 scale-0'
                       : 'opacity-100 rotate-0 scale-100'
                     }`}
        />

        <FiMoon
          className={`absolute inset-0 w-6 h-6 text-blue-400 
                     transition-all duration-300 transform
                     ${theme === 'light'
                       ? 'opacity-0 -rotate-90 scale-0'
                       : 'opacity-100 rotate-0 scale-100'
                     }`}
        />
      </div>

      {/* Animated gradient background */}
      <span
        className={`absolute inset-0 rounded-lg bg-gradient-to-r 
                    ${theme === 'dark'
                      ? 'from-blue-500/20 to-purple-500/20'
                      : 'from-yellow-500/20 to-orange-500/20'
                    } opacity-0 group-hover:opacity-100 
                    transition-opacity duration-300`}
      />
    </button>
  );
};

export default ThemeToggle;
