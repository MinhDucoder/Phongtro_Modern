'use client';

import LeafletWrapper from './LeafletWrapper';

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
    <LeafletWrapper 
      roomId={roomId}
      className={className}
      height={height}
    />
  );
}
