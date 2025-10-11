'use client';

import { useEffect, useState, useRef } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapLibreMapProps {
  roomId: string;
  className?: string;
  height?: string;
}

// OpenStreetMap style configuration for MapLibre
const osmStyle = {
  version: 8,
  sources: {
    'osm': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm'
    }
  ]
};

export default function MapLibreMap({ 
  roomId, 
  className = '',
  height = '400px'
}: MapLibreMapProps) {
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
  
  // New features for rental property map
  const [transportation, setTransportation] = useState<any[]>([]);
  const [showTransportation, setShowTransportation] = useState(false);
  const [isLoadingTransportation, setIsLoadingTransportation] = useState(false);
  const [mapLayers, setMapLayers] = useState({
    amenities: false,
    transportation: false,
    radius: false
  });
  const [searchRadius, setSearchRadius] = useState(2000); // meters
  const [viewport, setViewport] = useState({
    longitude: 105.8342, // Default to Ho Chi Minh City
    latitude: 21.0285,
    zoom: 15
  });


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



  // Fetch nearby amenities
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

  // Fetch transportation options
  const fetchTransportation = async (lat: number, lng: number) => {
    setIsLoadingTransportation(true);
    try {
      const radius = 1000; // 1km radius
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["public_transport"~"^(station|stop_position|platform)$"](around:${radius},${lat},${lng});
          node["highway"="bus_stop"](around:${radius},${lat},${lng});
          node["railway"="station"](around:${radius},${lat},${lng});
          node["railway"="subway_entrance"](around:${radius},${lat},${lng});
          way["public_transport"~"^(station|stop_position|platform)$"](around:${radius},${lat},${lng});
          way["highway"="bus_stop"](around:${radius},${lat},${lng});
          way["railway"="station"](around:${radius},${lat},${lng});
        );
        out center;
      `;

      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
      const data = await response.json();
      
      const transportPoints = data.elements.map((element: any) => {
        const lat = element.lat || element.center?.lat;
        const lng = element.lon || element.center?.lon;
        const name = element.tags?.name || element.tags?.public_transport || 'Trạm giao thông';
        const type = element.tags?.public_transport || element.tags?.railway || element.tags?.highway;
        
        return {
          id: element.id,
          lat,
          lng,
          name,
          type,
          elementType: element.type
        };
      }).filter((point: any) => point.lat && point.lng);

      setTransportation(transportPoints);
    } catch (error) {
      console.error('Error fetching transportation:', error);
    } finally {
      setIsLoadingTransportation(false);
    }
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
          // API format: [latitude, longitude] (not standard GeoJSON)
          const [lat, lng] = post.location.coordinates;
          // Validate coordinates
          if (typeof lat === 'number' && typeof lng === 'number' && 
              lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            setCoordinates({ lat: lat, lng: lng });
            setRoomInfo(post);
          } else {
            throw new Error('Tọa độ không hợp lệ. Vui lòng liên hệ chủ nhà để cập nhật thông tin.');
          }
        } else if (post?.roomId?.location?.coordinates && post.roomId.location.coordinates.length === 2) {
          // API format: [latitude, longitude] (not standard GeoJSON)
          const [lat, lng] = post.roomId.location.coordinates;
          // Validate coordinates
          if (typeof lat === 'number' && typeof lng === 'number' && 
              lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            setCoordinates({ lat: lat, lng: lng });
            setRoomInfo(post);
          } else {
            throw new Error('Tọa độ không hợp lệ. Vui lòng liên hệ chủ nhà để cập nhật thông tin.');
          }
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
    if (coordinates) {
      setIsLoading(false);
      // Update viewport to center on the room location
      setViewport({
        longitude: coordinates.lng,
        latitude: coordinates.lat,
        zoom: 15
      });
    }
  }, [coordinates]);

  // Cleanup effect để tránh memory leak
  useEffect(() => {
    return () => {
      // Cleanup khi component unmount
      setNearbyAmenities([]);
      setTransportation([]);
      setUserLocation(null);
    };
  }, []);


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

  if (isLoading || !coordinates) {
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
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 space-y-2 max-w-xs">
        {/* Location Button */}
        <button
          onClick={getUserLocation}
          disabled={isGettingLocation}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium w-full"
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
        
        {/* Distance Info */}
        {distance !== null && (
          <div className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium">
            📏 Khoảng cách: {distance.toFixed(1)} km
          </div>
        )}

        {/* Search Radius Control */}
        <div className="px-3 py-2 bg-gray-50 rounded-md">
          <label className="text-xs text-gray-600 block mb-1">Bán kính tìm kiếm</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-gray-600 w-12">{searchRadius}m</span>
          </div>
        </div>

        {/* Layer Controls */}
        <div className="space-y-1">
          <div className="text-xs text-gray-600 font-medium">Hiển thị:</div>
          
          {/* Amenities Toggle */}
          <button
            onClick={() => {
              if (coordinates) {
                if (mapLayers.amenities) {
                  setMapLayers(prev => ({ ...prev, amenities: false }));
                  setShowAmenities(false);
                  setNearbyAmenities([]);
                } else {
                  fetchNearbyAmenities(coordinates.lat, coordinates.lng);
                  setMapLayers(prev => ({ ...prev, amenities: true }));
                  setShowAmenities(true);
                }
              }
            }}
            disabled={isLoadingAmenities || !coordinates}
            className={`flex items-center justify-between w-full px-2 py-1 rounded text-xs font-medium ${
              mapLayers.amenities 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>🏪 Tiện ích xung quanh</span>
            {isLoadingAmenities && <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-600"></div>}
          </button>


          {/* Transportation Toggle */}
          <button
            onClick={() => {
              if (coordinates) {
                if (mapLayers.transportation) {
                  setMapLayers(prev => ({ ...prev, transportation: false }));
                  setShowTransportation(false);
                  setTransportation([]);
                } else {
                  fetchTransportation(coordinates.lat, coordinates.lng);
                  setMapLayers(prev => ({ ...prev, transportation: true }));
                  setShowTransportation(true);
                }
              }
            }}
            disabled={isLoadingTransportation || !coordinates}
            className={`flex items-center justify-between w-full px-2 py-1 rounded text-xs font-medium ${
              mapLayers.transportation 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>🚌 Giao thông công cộng</span>
            {isLoadingTransportation && <div className="animate-spin rounded-full h-3 w-3 border-b border-green-600"></div>}
          </button>

          {/* Search Radius Circle Toggle */}
          <button
            onClick={() => setMapLayers(prev => ({ ...prev, radius: !prev.radius }))}
            className={`flex items-center justify-between w-full px-2 py-1 rounded text-xs font-medium ${
              mapLayers.radius 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>⭕ Hiển thị bán kính</span>
          </button>
        </div>

        {/* Results Summary */}
        {(nearbyAmenities.length > 0 || transportation.length > 0) && (
          <div className="px-3 py-2 bg-blue-50 text-blue-800 rounded-md text-xs">
            <div className="space-y-1">
              {nearbyAmenities.length > 0 && <div>🏪 {nearbyAmenities.length} tiện ích</div>}
              {transportation.length > 0 && <div>🚌 {transportation.length} trạm giao thông</div>}
            </div>
          </div>
        )}

        {/* Error Display */}
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

      <Map
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        onError={(e) => {
          // Ignore AbortError as it's expected during cleanup
          if (e.error?.name !== 'AbortError') {
            console.error('MapLibre GL error:', e.error);
          }
        }}
        style={{ width: '100%', height: '100%', borderRadius: '8px' }}
        mapStyle={osmStyle}
        attributionControl={false}
        maxZoom={18}
        minZoom={10}
      >
        {/* Room Marker */}
        {coordinates && (
          <Marker longitude={coordinates.lng} latitude={coordinates.lat}>
            <div 
              className="w-10 h-10 bg-blue-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white text-lg cursor-pointer hover:scale-110 transition-transform"
              style={{ transform: 'rotate(-45deg)' }}
            >
              <span style={{ transform: 'rotate(45deg)' }}>🏠</span>
            </div>
          </Marker>
        )}

        {/* User Location Marker */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
            <div 
              className="w-10 h-10 bg-green-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white text-lg cursor-pointer hover:scale-110 transition-transform"
              style={{ transform: 'rotate(-45deg)' }}
            >
              <span style={{ transform: 'rotate(45deg)' }}>📍</span>
            </div>
          </Marker>
        )}

        {/* User Location Popup */}
        {userLocation && (
          <Popup
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
          >
            <div className="p-3 min-w-[180px]">
              <h3 className="font-bold text-green-600 mb-2 flex items-center">
                <span className="mr-2">📍</span>
                Vị trí của bạn
              </h3>
              <p className="text-xs text-gray-500">📍 Tọa độ: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</p>
            </div>
          </Popup>
        )}

        {/* Search Radius Circle */}
        {mapLayers.radius && coordinates && (
          <Source
            id="radius-circle"
            type="geojson"
            data={{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [coordinates.lng, coordinates.lat]
              }
            }}
          >
            <Layer
              id="radius-circle-layer"
              type="circle"
              paint={{
                'circle-radius': {
                  stops: [
                    [0, 0],
                    [20, searchRadius]
                  ],
                  base: 2
                },
                'circle-color': '#3B82F6',
                'circle-opacity': 0.1,
                'circle-stroke-color': '#3B82F6',
                'circle-stroke-width': 2
              }}
            />
          </Source>
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

          return (
            <Marker key={amenity.id} longitude={amenity.lng} latitude={amenity.lat}>
              <div 
                className="w-6 h-6 bg-white rounded-full border border-gray-300 shadow-md flex items-center justify-center text-lg cursor-pointer hover:scale-110 transition-transform"
              >
                {getAmenityIcon(amenity.amenity)}
              </div>
            </Marker>
          );
        })}


        {/* Transportation Markers */}
        {showTransportation && transportation.map((transport) => {
          const getTransportIcon = (type: string) => {
            const icons: { [key: string]: string } = {
              bus_stop: '🚌',
              station: '🚉',
              subway_entrance: '🚇',
              platform: '🚉',
              stop_position: '🚏'
            };
            return icons[type] || '🚌';
          };

          return (
            <Marker 
              key={transport.id} 
              longitude={transport.lng}
              latitude={transport.lat}
            >
              <div 
                className="w-6 h-6 bg-white rounded-full border border-gray-300 shadow-md flex items-center justify-center text-lg cursor-pointer hover:scale-110 transition-transform"
              >
                {getTransportIcon(transport.type)}
              </div>
            </Marker>
          );
        })}

      </Map>
    </div>
  );
}
