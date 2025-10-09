'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import để tránh SSR issues
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

  // Tạo custom icons sau khi component mount
  useEffect(() => {
    const createCustomIcons = async () => {
      const L = (await import('leaflet')).default;
      
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
    };

    createCustomIcons();
  }, []);

  // Tính khoảng cách giữa 2 điểm (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Lấy tiện ích xung quanh
  const fetchNearbyAmenities = async (lat: number, lng: number) => {
    setIsLoadingAmenities(true);
    try {
      const radius = 1000; // 1km radius
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"~"^(restaurant|fast_food|cafe|bank|hospital|pharmacy|school|university|supermarket|convenience|fuel|parking|bus_station|subway_entrance)$"](around:${radius},${lat},${lng});
          way["amenity"~"^(restaurant|fast_food|cafe|bank|hospital|pharmacy|school|university|supermarket|convenience|fuel|parking|bus_station|subway_entrance)$"](around:${radius},${lat},${lng});
          relation["amenity"~"^(restaurant|fast_food|cafe|bank|hospital|pharmacy|school|university|supermarket|convenience|fuel|parking|bus_station|subway_entrance)$"](around:${radius},${lat},${lng});
        );
        out center;
      `;

      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
      const data = await response.json();
      
      const amenities = data.elements.map((element: any) => {
        const lat = element.lat || element.center?.lat;
        const lng = element.lon || element.center?.lon;
        const name = element.tags?.name || element.tags?.amenity || 'Không tên';
        const amenity = element.tags?.amenity;
        
        return {
          id: element.id,
          lat,
          lng,
          name,
          amenity,
          type: element.type
        };
      }).filter((amenity: any) => amenity.lat && amenity.lng);

      setNearbyAmenities(amenities);
    } catch (error) {
      console.error('Error fetching amenities:', error);
    } finally {
      setIsLoadingAmenities(false);
    }
  };

  // Fallback: Lấy vị trí qua IP
  const getLocationByIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        setUserLocation({ lat: data.latitude, lng: data.longitude });
        
        // Tính khoảng cách nếu có tọa độ phòng
        if (coordinates) {
          const dist = calculateDistance(data.latitude, data.longitude, coordinates.lat, coordinates.lng);
          setDistance(dist);
        }
        
        setError(null);
        return true;
      }
    } catch (error) {
      console.log('IP geolocation failed:', error);
    }
    return false;
  };

  // Lấy vị trí hiện tại của user
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      // Fallback to IP geolocation
      setIsGettingLocation(true);
      const success = await getLocationByIP();
      setIsGettingLocation(false);
      
      if (!success) {
        setError('Trình duyệt không hỗ trợ định vị và không thể lấy vị trí qua IP.');
      }
      return;
    }

    setIsGettingLocation(true);
    setError(null); // Clear previous errors

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsGettingLocation(false);
        
        // Tính khoảng cách nếu có tọa độ phòng
        if (coordinates) {
          const dist = calculateDistance(latitude, longitude, coordinates.lat, coordinates.lng);
          setDistance(dist);
        }
      },
      async (error) => {
        setIsGettingLocation(false);
        let errorMessage = 'Không thể lấy vị trí hiện tại';
        
        // Debug log để xem chi tiết lỗi
        console.log('Geolocation error:', error);
        
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = 'Bạn đã từ chối quyền truy cập vị trí. Đang thử lấy vị trí qua IP...';
            // Thử fallback IP geolocation
            const success = await getLocationByIP();
            if (success) {
              setError(null);
              return;
            }
            errorMessage = 'Bạn đã từ chối quyền truy cập vị trí và không thể lấy vị trí qua IP.';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'Thông tin vị trí không khả dụng. Đang thử lấy vị trí qua IP...';
            // Thử fallback IP geolocation
            const success2 = await getLocationByIP();
            if (success2) {
              setError(null);
              return;
            }
            errorMessage = 'Thông tin vị trí không khả dụng và không thể lấy vị trí qua IP.';
            break;
          case 3: // TIMEOUT
            errorMessage = 'Hết thời gian chờ lấy vị trí. Đang thử lấy vị trí qua IP...';
            // Thử fallback IP geolocation
            const success3 = await getLocationByIP();
            if (success3) {
              setError(null);
              return;
            }
            errorMessage = 'Hết thời gian chờ lấy vị trí và không thể lấy vị trí qua IP.';
            break;
          default:
            errorMessage = `Lỗi geolocation (Code: ${error.code}): ${error.message || 'Không xác định'}`;
            break;
        }
        
        setError(errorMessage);
      },
      options
    );
  };

  // Lấy tọa độ từ room ID
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
          // GeoJSON format: [lng, lat]
          const [lng, lat] = post.location.coordinates;
          setCoordinates({
            lat: lat,
            lng: lng
          });
          setRoomInfo(post);
        } else if (post?.roomId?.coordinate?.lat && post?.roomId?.coordinate?.lng) {
          // Fallback: lấy tọa độ từ roomId.coordinate
          setCoordinates({
            lat: post.roomId.coordinate.lat,
            lng: post.roomId.coordinate.lng
          });
          setRoomInfo(post);
        } else {
          // Không có tọa độ - báo lỗi
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
    if (coordinates) {
      setIsLoading(false);
    }
  }, [coordinates]);

  // Tính khoảng cách khi có cả user location và room coordinates
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
          <div className="space-y-2">
            <button
              onClick={() => {
                setError(null);
                if (roomId) {
                  setIsLoading(true);
                  // Retry fetching coordinates
                  const fetchRoomCoordinates = async () => {
                    try {
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
                      } else if (post?.roomId?.coordinate?.lat && post?.roomId?.coordinate?.lng) {
                        setCoordinates({
                          lat: post.roomId.coordinate.lat,
                          lng: post.roomId.coordinate.lng
                        });
                        setRoomInfo(post);
                      } else {
                        throw new Error('Phòng này chưa có tọa độ. Vui lòng liên hệ chủ nhà để cập nhật thông tin.');
                      }
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Không thể tải tọa độ phòng');
                    }
                  };
                  fetchRoomCoordinates();
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              🔄 Thử lại
            </button>
            <p className="text-xs text-gray-500">
              💡 Nếu vẫn gặp lỗi, vui lòng liên hệ chủ nhà để cập nhật tọa độ phòng
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !coordinates || !customIcons) {
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

        <button
          onClick={() => {
            if (coordinates) {
              if (showAmenities) {
                setShowAmenities(false);
                setNearbyAmenities([]);
              } else {
                fetchNearbyAmenities(coordinates.lat, coordinates.lng);
                setShowAmenities(true);
              }
            }
          }}
          disabled={isLoadingAmenities || !coordinates}
          className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isLoadingAmenities ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Đang tải...</span>
            </>
          ) : (
            <>
              <span>🏪</span>
              <span>{showAmenities ? 'Ẩn tiện ích' : 'Tiện ích xung quanh'}</span>
            </>
          )}
        </button>

        {nearbyAmenities.length > 0 && (
          <div className="px-3 py-2 bg-purple-100 text-purple-800 rounded-md text-sm font-medium">
            🏪 Tìm thấy {nearbyAmenities.length} tiện ích
          </div>
        )}

        {/* Error notification for geolocation */}
        {error && coordinates && (
          <div className="px-3 py-2 bg-red-100 text-red-800 rounded-md text-sm font-medium">
            <div className="flex items-center justify-between mb-2">
              <span>⚠️ {error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-600 hover:text-red-800 font-bold"
              >
                ✕
              </button>
            </div>
            {error.includes('IP') && (
              <button
                onClick={async () => {
                  setIsGettingLocation(true);
                  const success = await getLocationByIP();
                  setIsGettingLocation(false);
                  if (!success) {
                    setError('Không thể lấy vị trí qua IP. Vui lòng kiểm tra kết nối mạng.');
                  }
                }}
                disabled={isGettingLocation}
                className="w-full px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
              >
                {isGettingLocation ? 'Đang thử...' : '🌐 Thử lấy vị trí qua IP'}
              </button>
            )}
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

        {/* Nearby Amenities Markers */}
        {showAmenities && nearbyAmenities.map((amenity) => {
          const getAmenityIcon = (amenityType: string) => {
            const icons: { [key: string]: string } = {
              restaurant: '🍽️',
              fast_food: '🍔',
              cafe: '☕',
              bank: '🏦',
              hospital: '🏥',
              pharmacy: '💊',
              school: '🏫',
              university: '🎓',
              supermarket: '🛒',
              convenience: '🏪',
              fuel: '⛽',
              parking: '🅿️',
              bus_station: '🚌',
              subway_entrance: '🚇'
            };
            return icons[amenityType] || '📍';
          };

          const amenityIcon = customIcons?.amenity ? customIcons.amenity(getAmenityIcon(amenity.amenity)) : undefined;

          return (
            <Marker key={amenity.id} position={[amenity.lat, amenity.lng]} icon={amenityIcon}>
              <Popup>
                <div className="p-3 min-w-[180px]">
                  <h3 className="font-bold text-purple-600 mb-2 flex items-center">
                    <span className="mr-2">{getAmenityIcon(amenity.amenity)}</span>
                    {amenity.name}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 capitalize">🏷️ Loại: {amenity.amenity}</p>
                    <p className="text-xs text-gray-500">📍 Tọa độ: {amenity.lat.toFixed(6)}, {amenity.lng.toFixed(6)}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
