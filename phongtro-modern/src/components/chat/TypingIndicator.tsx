'use client';

interface TypingIndicatorProps {
  userName?: string;
}

export default function TypingIndicator({ userName }: TypingIndicatorProps) {
  return (
    <div className="flex items-end space-x-2 mb-4">
      <div className="w-8 h-8 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
      
      <div className="bg-white border rounded-xl px-4 py-2 shadow-sm">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500 mr-2">
            {userName ? `${userName} đang nhập...` : 'Đang nhập...'}
          </span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
