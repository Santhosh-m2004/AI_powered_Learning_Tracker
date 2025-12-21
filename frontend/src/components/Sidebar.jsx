import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiBook,
  FiCalendar,
  FiFileText,
  FiTrendingUp,
  FiSettings
} from 'react-icons/fi';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/learning', icon: FiBook, label: 'Learning Tracker' },
    { path: '/planner', icon: FiCalendar, label: 'Study Planner' },
    { path: '/notes', icon: FiFileText, label: 'Notes & Resources' },
    { path: '/ai-insights', icon: FiTrendingUp, label: 'AI Insights' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 px-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300">
            Today's Goal
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            120 minutes of focused study
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: '65%' }}
            ></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;