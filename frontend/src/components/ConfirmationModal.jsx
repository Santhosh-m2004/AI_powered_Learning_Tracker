import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
  children
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: FiAlertCircle,
      iconColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      buttonColor: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
    warning: {
      icon: FiAlertCircle,
      iconColor: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      buttonColor: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    },
    success: {
      icon: FiCheckCircle,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      buttonColor: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    },
    info: {
      icon: FiInfo,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      buttonColor: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  const handleConfirm = () => {
    if (!isLoading) onConfirm();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && !isLoading) handleConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md transform overflow-hidden rounded-lg 
                     bg-white dark:bg-gray-800 shadow-xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-500 
                       dark:hover:text-gray-300 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className={`p-4 ${config.bgColor} flex justify-center`}>
            <div className="p-3 rounded-full bg-white dark:bg-gray-800">
              <Icon className={`w-8 h-8 ${config.iconColor}`} />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3
              id="modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
            >
              {title}
            </h3>

            {message && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            )}

            {children && <div className="mb-6">{children}</div>}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 
                           dark:text-gray-300 bg-gray-100 dark:bg-gray-700 
                           hover:bg-gray-200 dark:hover:bg-gray-600 
                           rounded-lg transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>

              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`
                  px-4 py-2 text-sm font-medium text-white rounded-lg 
                  transition-colors flex items-center justify-center
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${config.buttonColor}
                `}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent 
                                    rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
