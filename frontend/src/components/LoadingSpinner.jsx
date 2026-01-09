import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Processing...' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-2xl animate-fade-in">
        <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
        <p className="text-lg font-medium text-gray-900">{message}</p>
        <p className="text-sm text-gray-500">This may take a moment...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
