import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { FiLogOut, FiUser, FiSun, FiMoon, FiBell } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-blue-600 dark:text-blue-400"
            >
              AI Learning Tracker
            </Link>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'light' ? (
                <FiMoon className="w-5 h-5" />
              ) : (
                <FiSun className="w-5 h-5" />
              )}
            </button>

            {/* Notifications */}
            <button
              aria-label="Notifications"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            >
              <FiBell className="w-5 h-5" />
              {user?.notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* User Info */}
            <div className="flex items-center space-x-2">
              <FiUser className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium">
                {user?.name || ''}
              </span>
            </div>

            {/* Admin Button */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Admin
              </Link>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 
                       hover:bg-red-50 rounded-lg dark:text-red-400 
                       dark:hover:bg-red-900/20 transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
