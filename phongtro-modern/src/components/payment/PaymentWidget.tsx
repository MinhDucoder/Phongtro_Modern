'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCardIcon,
  CheckCircleIcon,
  StarIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface Package {
  id: string;
  name: string;
  price: number;
  duration: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  popular?: boolean;
}

const packages: Package[] = [
  {
    id: 'basic',
    name: 'Cơ Bản',
    price: 50000,
    duration: 7,
    icon: StarIcon,
    color: 'blue'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 150000,
    duration: 30,
    icon: FireIcon,
    color: 'orange',
    popular: true
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 300000,
    duration: 60,
    icon: BoltIcon,
    color: 'purple'
  }
];

export default function PaymentWidget() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (!mounted) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Nâng cấp tin đăng</h3>
        <CreditCardIcon className="h-6 w-6 text-blue-600" />
      </div>

      <div className="space-y-3 mb-6">
        {packages.map((pkg) => {
          const IconComponent = pkg.icon;
          
          return (
            <div
              key={pkg.id}
              className={`relative p-4 rounded-lg border-2 transition-colors ${
                pkg.popular 
                  ? 'border-orange-200 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-2 left-4">
                  <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Phổ biến
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-${pkg.color}-100 mr-3`}>
                    <IconComponent className={`h-5 w-5 text-${pkg.color}-600`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{pkg.name}</h4>
                    <p className="text-sm text-gray-600">{pkg.duration} ngày</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{formatPrice(pkg.price)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-start">
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900">Thanh toán an toàn</h4>
            <p className="text-sm text-gray-600">Hỗ trợ VNPay, MoMo, ZaloPay</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900">Hỗ trợ 24/7</h4>
            <p className="text-sm text-gray-600">Đội ngũ chăm sóc khách hàng</p>
          </div>
        </div>
      </div>

      <Link
        href="/thanh-toan"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium text-center block transition-colors"
      >
        Nâng cấp ngay
      </Link>
    </div>
  );
}
