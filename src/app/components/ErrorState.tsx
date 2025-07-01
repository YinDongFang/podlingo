'use client';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            资源获取失败
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            {error || '获取播客资源时发生错误，请稍后重试'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              重新尝试
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 