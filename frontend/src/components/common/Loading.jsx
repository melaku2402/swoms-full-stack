const Loading = ({
  message = "Loading...",
  fullScreen = false,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-primary-600 mx-auto ${sizeClasses[size]}`}
        />
        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  );
};

export const LoadingOverlay = ({ isLoading, children }) => {
  if (isLoading) return <Loading fullScreen />;
  return children;
};

export const LoadingSpinner = ({ size = "md" }) => (
  <div className="flex justify-center p-4">
    <div
      className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`}
    />
  </div>
);

export default Loading;
