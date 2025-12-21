const LoadingSpinner = ({ size = 'md', color = 'primary', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'border-blue-600',
    secondary: 'border-gray-600',
    success: 'border-green-600',
    danger: 'border-red-600',
    warning: 'border-yellow-600',
    white: 'border-white'
  };

  const spinner = (
    <div className="flex items-center justify-center">
      <div
        className={`
          ${sizeClasses[size]}
          border-4 ${colorClasses[color]}
          border-t-transparent
          rounded-full
          animate-spin
        `}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 
                      backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export const LoadingPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">
        Loading your learning dashboard...
      </p>
    </div>
  </div>
);

export const LoadingCard = ({ message = 'Loading...' }) => (
  <div className="card animate-pulse">
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner />
      <span className="ml-3 text-gray-600 dark:text-gray-400">{message}</span>
    </div>
  </div>
);

export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const CardSkeleton = () => (
    <div className="card space-y-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
      </div>
    </div>
  );

  const TableSkeleton = () => (
    <div className="card">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const skeletons = {
    card: CardSkeleton,
    table: TableSkeleton
  };

  const SkeletonComponent = skeletons[type] || CardSkeleton;

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </>
  );
};

export default LoadingSpinner;