'use client';

interface OnlineStatusIndicatorProps {
  isOnline?: boolean;
  lastSeen?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function OnlineStatusIndicator({ 
  isOnline = false, 
  lastSeen,
  size = 'sm' 
}: OnlineStatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getStatusText = () => {
    if (isOnline) {
      return 'Đang hoạt động';
    }
    
    if (lastSeen) {
      const lastSeenDate = new Date(lastSeen);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        return 'Vừa xong';
      } else if (diffInMinutes < 60) {
        return `Hoạt động ${diffInMinutes} phút trước`;
      } else if (diffInMinutes < 24 * 60) {
        const hours = Math.floor(diffInMinutes / 60);
        return `Hoạt động ${hours} giờ trước`;
      } else {
        const days = Math.floor(diffInMinutes / (24 * 60));
        return `Hoạt động ${days} ngày trước`;
      }
    }
    
    return 'Không hoạt động';
  };

  return (
    <div className="flex items-center space-x-1">
      <div className={`${sizeClasses[size]} rounded-full border-2 border-white ${
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      } ${isOnline ? 'animate-pulse' : ''}`}></div>
      <span className="text-xs text-gray-500 hidden sm:inline">
        {getStatusText()}
      </span>
    </div>
  );
}
