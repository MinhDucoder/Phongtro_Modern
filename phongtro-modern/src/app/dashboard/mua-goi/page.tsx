'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PackageSelector from '@/components/dashboard/PackageSelector';

export default function PurchasePackagePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Chọn gói đăng tin
          </h1>
          <p className="text-gray-600 mb-6">
            Chọn gói phù hợp để bắt đầu đăng tin thuê phòng của bạn
          </p>
          
          <PackageSelector showCurrentPackage={true} />
        </div>
      </div>
    </DashboardLayout>
  );
}