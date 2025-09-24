'use client';

import dynamic from 'next/dynamic';

// Dynamically import UserProfile to ensure it's treated as Client Component
const UserProfile = dynamic(() => import('./UserProfile'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-64 rounded-lg mb-6"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-200 h-48 rounded-lg"></div>
        <div className="bg-gray-200 h-48 rounded-lg"></div>
      </div>
    </div>
  )
});

export default function UserProfileWrapper() {
  return <UserProfile />;
}
