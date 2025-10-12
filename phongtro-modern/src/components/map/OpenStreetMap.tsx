'use client';

import MapLibreWrapper from './MapLibreWrapper';

interface OpenStreetMapProps {
  roomId: string; // Thực chất là Post ID
  className?: string;
  height?: string;
}

export default function OpenStreetMap({ 
  roomId, 
  className = '',
  height = '400px'
}: OpenStreetMapProps) {
  return (
    <MapLibreWrapper 
      roomId={roomId}
      className={className}
      height={height}
    />
  );
}
