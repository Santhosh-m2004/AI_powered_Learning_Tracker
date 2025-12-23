const StatsCard = ({
  icon: Icon,
  title = '',
  value = '',
  change,
  color = 'bg-gray-200 dark:bg-gray-700'
}) => {
  const validChange = typeof change === 'number' && !isNaN(change);
  const isPositive = validChange && change >= 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between">

        {/* Left Section */}
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>

          <p className="text-2xl font-semibold mt-1">
            {value}
          </p>

          {validChange && (
            <p className={`text-sm mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '↗' : '↘'} {Math.abs(change)}%
            </p>
          )}
        </div>

        {/* Right Icon */}
        <div className={`p-3 rounded-full ${color}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
