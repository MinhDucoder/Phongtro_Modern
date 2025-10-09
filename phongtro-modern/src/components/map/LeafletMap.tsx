'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import với error handling
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface LeafletMapProps {
  roomId: string;
  className?: string;
  height?: string;
}

export default function LeafletMap({ 
  roomId, 
  className = '',
  height = '400px'
}: LeafletMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [nearbyAmenities, setNearbyAmenities] = useState<any[]>([]);
  const [showAmenities, setShowAmenities] = useState(false);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(false);
  const [customIcons, setCustomIcons] = useState<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load Leaflet library
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const L = (await import('leaflet')).default;
        
        // Fix for default markers in Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        const createCustomIcon = (color: string, emoji: string) => {
          return L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div style="
                background-color: ${color};
                width: 40px;
                height: 40px;
                border-radius: 50% 50% 50% 0;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                transform: rotate(-45deg);
              ">
                <span style="transform: rotate(45deg);">${emoji}</span>
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
          });
        };

        setCustomIcons({
          room: createCustomIcon('#3B82F6', '🏠'),
          user: createCustomIcon('#10B981', '📍'),
          amenity: (emoji: string) => createCustomIcon('#8B5CF6', emoji)
        });
        
        setLeafletLoaded(true);
      } catch (error) {
        console.error('Error loading Leaflet:', error);
        setError('Không thể tải thư viện bản đồ. Vui lòng thử lại sau.');
      }
    };

    loadLeaflet();
  }, []);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get user location
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị.');
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsGettingLocation(false);
        
        if (coordinates) {
          const dist = calculateDistance(latitude, longitude, coordinates.lat, coordinates.lng);
          setDistance(dist);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        setError('Không thể lấy vị trí hiện tại.');
      },
      options
    );
  };

  // Fetch room coordinates
  useEffect(() => {
    const fetchRoomCoordinates = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/posts/${roomId}`);

        if (!response.ok) {
          throw new Error('Không thể lấy thông tin bài đăng');
        }

        const data = await response.json();
        const post = data.post || data.data;

        if (post?.location?.coordinates && post.location.coordinates.length === 2) {
          const [lng, lat] = post.location.coordinates;
          setCoordinates({ lat: lat, lng: lng });
          setRoomInfo(post);
        } else if (post?.roomId?.location?.coordinates && post.roomId.location.coordinates.length === 2) {
          const [lng, lat] = post.roomId.location.coordinates;
          setCoordinates({ lat: lat, lng: lng });
          setRoomInfo(post);
        } else {
          throw new Error('Phòng này chưa có tọa độ. Vui lòng liên hệ chủ nhà để cập nhật thông tin.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải tọa độ phòng');
        setIsLoading(false);
      }
    };

    if (roomId) {
      fetchRoomCoordinates();
    }
  }, [roomId]);

  // Set loading to false when coordinates are ready
  useEffect(() => {
    if (coordinates && leafletLoaded) {
      setIsLoading(false);
    }
  }, [coordinates, leafletLoaded]);

  // Calculate distance when both locations are available
  useEffect(() => {
    if (userLocation && coordinates) {
      const dist = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        coordinates.lat, 
        coordinates.lng
      );
      setDistance(dist);
    }
  }, [userLocation, coordinates]);

  if (error && !coordinates) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-4 max-w-md">
          <div className="text-gray-500 mb-2">🗺️</div>
          <p className="text-gray-600 mb-3">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              // Retry logic here
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            🔄 Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !coordinates || !leafletLoaded || !customIcons) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Đang tải bản đồ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 space-y-2">
        <button
          onClick={getUserLocation}
          disabled={isGettingLocation}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isGettingLocation ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Đang lấy vị trí...</span>
            </>
          ) : (
            <>
              <span>📍</span>
              <span>Lấy vị trí của tôi</span>
            </>
          )}
        </button>
        
        {distance !== null && (
          <div className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium">
            📏 Khoảng cách: {distance.toFixed(1)} km
          </div>
        )}

        {error && coordinates && (
          <div className="px-3 py-2 bg-red-100 text-red-800 rounded-md text-sm font-medium">
            <div className="flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-600 hover:text-red-800 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Room Marker */}
        <Marker position={[coordinates.lat, coordinates.lng]} icon={customIcons?.room}>
          <Popup>
            <div className="p-3 min-w-[200px]">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <span className="text-blue-600 mr-2">🏠</span>
                Vị trí phòng trọ
              </h3>
              {roomInfo?.roomId?.title && (
                <p className="text-sm text-gray-700 mb-2 font-medium">{roomInfo.roomId.title}</p>
              )}
              {roomInfo?.roomId?.address && (
                <p className="text-sm text-gray-600 mb-2">{roomInfo.roomId.address}</p>
              )}
              <div className="space-y-1">
                <p className="text-xs text-gray-500">📍 Tọa độ: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</p>
                {distance !== null && (
                  <p className="text-xs text-green-600 font-medium">📏 Cách bạn: {distance.toFixed(1)} km</p>
                )}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={customIcons?.user}>
            <Popup>
              <div className="p-3 min-w-[180px]">
                <h3 className="font-bold text-green-600 mb-2 flex items-center">
                  <span className="mr-2">📍</span>
                  Vị trí của bạn
                </h3>
                <p className="text-xs text-gray-500">📍 Tọa độ: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
