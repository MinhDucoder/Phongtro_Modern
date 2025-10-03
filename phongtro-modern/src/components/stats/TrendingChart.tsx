'use client';

import { useState, useEffect } from 'react';
import { statsApi } from '@/lib/api';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  MapPinIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface TrendingData {
  cityTrends: Array<{
    _id: string;
    count: number;
    avgPrice: number;
    totalViews: number;
  }>;
  propertyTypeTrends: Array<{
    _id: string;
    count: number;
    avgPrice: number;
  }>;
  period: string;
  startDate: string;
  endDate: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function TrendingChart() {
  const [data, setData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cities' | 'propertyTypes'>('cities');

  useEffect(() => {
    fetchTrendingData();
  }, []);

  const fetchTrendingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== FETCHING TRENDING DATA ===');
      console.log('Current time:', new Date().toISOString());
      
      // Test direct fetch first
      console.log('Testing direct fetch for trending...');
      const directResponse = await fetch('http://localhost:5000/api/v1/stats/trending?period=7d&limit=10', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log('Direct fetch status:', directResponse.status);
      console.log('Direct fetch headers:', Object.fromEntries(directResponse.headers.entries()));
      
      if (!directResponse.ok) {
        throw new Error(`Direct fetch failed: ${directResponse.status}`);
      }
      
      const directData = await directResponse.json();
      console.log('Direct fetch data:', directData);
      
      // Now test statsApi
      console.log('Testing statsApi for trending...');
      const response = await statsApi.getTrending({ period: '7d', limit: 10 });
      
      console.log('Trending response:', response);
      
      if (response.success) {
        setData(response.data);
        console.log('✅ Trending data set successfully');
      } else {
        console.error('❌ Trending API failed:', response);
        setError('Không thể tải dữ liệu xu hướng');
      }
    } catch (err) {
      console.error('❌ Error fetching trending data:', err);
      console.error('Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack'
      });
      setError(err instanceof Error ? err.message : 'Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Xu hướng thị trường
            </h3>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            {data.period === '7d' ? '7 ngày qua' : '30 ngày qua'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-3 border-b border-gray-100">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('cities')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'cities'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapPinIcon className="h-4 w-4 inline mr-1" />
            Theo thành phố
          </button>
          <button
            onClick={() => setActiveTab('propertyTypes')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'propertyTypes'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HomeIcon className="h-4 w-4 inline mr-1" />
            Theo loại phòng
          </button>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        {activeTab === 'cities' && (
          <div className="space-y-6">
            {/* Bar Chart - Cities */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Top thành phố có nhiều tin đăng nhất
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(data.cityTrends || []).slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="_id" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatNumber(Number(value)), 
                        name === 'count' ? 'Số tin' : 'Giá TB'
                      ]}
                      labelFormatter={(label) => `Thành phố: ${label}`}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cities List */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Chi tiết theo thành phố
              </h4>
              <div className="space-y-2">
                {(data.cityTrends || []).slice(0, 5).map((city, index) => (
                  <div key={city._id || `city-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{city._id || 'Unknown City'}</div>
                        <div className="text-sm text-gray-600">
                          {formatPrice(city.avgPrice || 0)}/tháng
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatNumber(city.count || 0)}
                      </div>
                      <div className="text-sm text-gray-600">tin đăng</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'propertyTypes' && (
          <div className="space-y-6">
            {/* Pie Chart - Property Types */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Phân bố theo loại phòng
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.propertyTypeTrends || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, count, percent }) => 
                        `${_id}: ${count} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(data.propertyTypeTrends || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatNumber(Number(value)), 'Số tin']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Property Types List */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Chi tiết theo loại phòng
              </h4>
              <div className="space-y-2">
                {(data.propertyTypeTrends || []).map((type, index) => (
                  <div key={type._id || `type-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded mr-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {type._id ? type._id.replace('_', ' ') : 'Chưa phân loại'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatPrice(type.avgPrice || 0)}/tháng
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatNumber(type.count || 0)}
                      </div>
                      <div className="text-sm text-gray-600">tin đăng</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
