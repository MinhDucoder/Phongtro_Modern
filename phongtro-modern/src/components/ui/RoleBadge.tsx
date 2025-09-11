'use client';

interface RoleBadgeProps {
  role: 'tenant' | 'landlord';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function RoleBadge({ role, size = 'md', showIcon = true }: RoleBadgeProps) {
  const isTenant = role === 'tenant';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${
      isTenant 
        ? 'bg-blue-100 text-blue-800' 
        : 'bg-green-100 text-green-800'
    } ${sizeClasses[size]}`}>
      {showIcon && (
        <span className={`mr-1.5 ${iconSizes[size]}`}>
          {isTenant ? (
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
          )}
        </span>
      )}
      {isTenant ? 'Người thuê' : 'Chủ nhà'}
    </span>
  );
}
