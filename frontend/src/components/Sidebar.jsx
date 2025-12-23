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
    { path: '/', icon: FiHome, label: 'Dashboard', exact: true },
    { path: '/learning', icon: FiBook, label: 'Learning Tracker' },
    { path: '/planner', icon: FiCalendar, label: 'Study Planner' },
    { path: '/notes', icon: FiFileText, label: 'Notes & Resources' },
    { path: '/ai-insights', icon: FiTrendingUp, label: 'AI Insights' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <aside
      className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
      aria-label="Sidebar navigation"
    >
      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
