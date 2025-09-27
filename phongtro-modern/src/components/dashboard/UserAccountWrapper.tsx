'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const UserAccount = dynamic(() => import('./UserAccount'), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 animate-pulse">
      <div className="bg-gray-200 h-32 rounded-lg mb-6"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-200 h-64 rounded-lg"></div>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
      </div>
    </div>
  ),
});

export default function UserAccountWrapper() {
  return <UserAccount />;
}







