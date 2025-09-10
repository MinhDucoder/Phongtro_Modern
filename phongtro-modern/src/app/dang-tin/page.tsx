import PostPropertyForm from '@/components/post/PostPropertyForm';

export default function PostPropertyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Đăng tin cho thuê</h1>
            <p className="mt-2 text-lg text-gray-600">
              Đăng tin miễn phí - Tiếp cận hàng nghìn khách thuê
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <h3 className="font-semibold mb-2">Tin thường</h3>
              <div className="text-2xl font-bold mb-1">MIỄN PHÍ</div>
              <p className="text-sm opacity-90">Hiển thị 7 ngày</p>
            </div>
            <div className="bg-yellow-400 text-gray-900 rounded-lg p-4 text-center transform scale-105">
              <h3 className="font-semibold mb-2">Tin VIP 1</h3>
              <div className="text-2xl font-bold mb-1">50.000đ</div>
              <p className="text-sm">Hiển thị 30 ngày</p>
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">Phổ biến</span>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <h3 className="font-semibold mb-2">Tin VIP 2</h3>
              <div className="text-2xl font-bold mb-1">100.000đ</div>
              <p className="text-sm opacity-90">Hiển thị 30 ngày</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <h3 className="font-semibold mb-2">Tin VIP 3</h3>
              <div className="text-2xl font-bold mb-1">200.000đ</div>
              <p className="text-sm opacity-90">Hiển thị 30 ngày</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <PostPropertyForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Đăng tin cho thuê phòng trọ miễn phí | Phongtro123.com',
  description: 'Đăng tin cho thuê phòng trọ, nhà trọ miễn phí. Tiếp cận hàng nghìn khách thuê tiềm năng.',
};
