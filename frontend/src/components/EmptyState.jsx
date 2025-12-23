import { FiBook, FiCalendar, FiFileText, FiSearch, FiUsers } from 'react-icons/fi';

const EmptyState = ({
  icon,
  title,
  message,
  action,
  type = "default"
}) => {

  const typeConfig = {
    default: {
      icon: FiBook,
      iconColor: "text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-800",
    },
    learning: {
      icon: FiBook,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    planner: {
      icon: FiCalendar,
      iconColor: "text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    notes: {
      icon: FiFileText,
      iconColor: "text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    search: {
      icon: FiSearch,
      iconColor: "text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    users: {
      icon: FiUsers,
      iconColor: "text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
  };

  const config = typeConfig[type] || typeConfig.default;
  const DisplayIcon = icon || config.icon;

  return (
    <div className="text-center py-12 px-4" role="status">
      <div
        className={`inline-flex items-center justify-center w-16 h-16 
                    ${config.bgColor} rounded-full mb-4`}
      >
        <DisplayIcon className={`w-8 h-8 ${config.iconColor}`} />
      </div>

      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
        {message}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export const EmptyLearningState = ({ onAddSession }) => (
  <EmptyState
    type="learning"
    title="No learning sessions found"
    message="Start your learning journey by adding your first session."
    action={
      <button
        onClick={onAddSession}
        className="inline-flex items-center px-4 py-2 bg-blue-600 
                 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FiBook className="w-4 h-4 mr-2" />
        Add First Session
      </button>
    }
  />
);

export const EmptyPlannerState = ({ onCreatePlan }) => (
  <EmptyState
    type="planner"
    title="No study plans available"
    message="Create your first study plan to stay organized."
    action={
      <button
        onClick={onCreatePlan}
        className="inline-flex items-center px-4 py-2 bg-purple-600 
                 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <FiCalendar className="w-4 h-4 mr-2" />
        Create Plan
      </button>
    }
  />
);

export const EmptyNotesState = ({ onUploadNote }) => (
  <EmptyState
    type="notes"
    title="No notes found"
    message="Upload or create notes to keep your study material organized."
    action={
      <button
        onClick={onUploadNote}
        className="inline-flex items-center px-4 py-2 bg-green-600 
                 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <FiFileText className="w-4 h-4 mr-2" />
        Upload Note
      </button>
    }
  />
);

export const EmptySearchState = ({ searchQuery = "", onClear }) => (
  <EmptyState
    type="search"
    title="No results found"
    message={
      searchQuery.trim().length > 0
        ? `No results match "${searchQuery}". Try different keywords.`
        : "No search results. Try entering a keyword."
    }
    action={
      <button
        onClick={onClear}
        className="inline-flex items-center px-4 py-2 bg-gray-200 
                 dark:bg-gray-700 text-gray-800 dark:text-gray-300 
                 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 
                 transition-colors"
      >
        Clear Search
      </button>
    }
  />
);

export default EmptyState;
