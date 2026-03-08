import Modal from "./Modal";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  type = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  loading = false,
}) => {
  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
      buttonColor: "bg-yellow-600 hover:bg-yellow-700",
    },
    danger: {
      icon: XCircle,
      iconColor: "text-red-600",
      bgColor: "bg-red-100",
      buttonColor: "bg-red-600 hover:bg-red-700",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div
          className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${config.bgColor} mb-4`}
        >
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>

        {message && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        )}

        <div className="mt-6 flex justify-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary px-4 py-2"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`btn px-4 py-2 text-white ${
              destructive ? "bg-red-600 hover:bg-red-700" : config.buttonColor
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

