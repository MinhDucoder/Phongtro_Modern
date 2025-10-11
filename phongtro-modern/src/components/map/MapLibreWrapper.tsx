'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Wrapper component để xử lý MapLibre import issues
const MapLibreMap = dynamic(
  () => import('./MapLibreMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Đang tải bản đồ...</p>
        </div>
      </div>
    )
  }
);

interface MapLibreWrapperProps {
  roomId: string;
  className?: string;
  height?: string;
}

export default function MapLibreWrapper(props: MapLibreWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${props.className || ''}`} style={{ height: props.height || '400px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Đang tải bản đồ...</p>
        </div>
      </div>
    );
  }

  return <MapLibreMap {...props} />;
}
