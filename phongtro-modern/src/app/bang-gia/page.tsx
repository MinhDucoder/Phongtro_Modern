import { CheckIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon, FireIcon as FireOutlineIcon, BoltIcon as BoltOutlineIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: number;
  features: string[];
  popular?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  buttonText: string;
  buttonColor: string;
}

const servicePackages: ServicePackage[] = [
  {
    id: 'basic',
    name: 'Gói Cơ Bản',
    description: 'Phù hợp cho người mới bắt đầu',
    price: 50000,
    duration: 7,
    features: [
      'Đăng tin trong 7 ngày',
      'Hiển thị ở trang chủ',
      'Hỗ trợ cơ bản',
      'Tối đa 5 hình ảnh',
      'Thống kê cơ bản'
    ],
    icon: StarOutlineIcon,
    color: 'blue',
    buttonText: 'Chọn gói cơ bản',
    buttonColor: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    id: 'premium',
    name: 'Gói Premium',
    description: 'Phổ biến nhất - Tăng khả năng tiếp cận',
    price: 150000,
    originalPrice: 200000,
    duration: 30,
    popular: true,
    features: [
      'Đăng tin trong 30 ngày',
      'Ưu tiên hiển thị',
      'Tin nổi bật với viền vàng',
      'Tối đa 15 hình ảnh',
      'Thống kê chi tiết',
      'Hỗ trợ ưu tiên',
      'Tự động gia hạn'
    ],
    icon: FireOutlineIcon,
    color: 'orange',
    buttonText: 'Chọn gói Premium',
    buttonColor: 'bg-orange-600 hover:bg-orange-700'
  },
  {
    id: 'vip',
    name: 'Gói VIP',
    description: 'Tối ưu nhất cho chủ nhà chuyên nghiệp',
    price: 300000,
    originalPrice: 400000,
    duration: 60,
    features: [
      'Đăng tin trong 60 ngày',
      'Hiển thị đầu tiên',
      'Tin VIP với viền đỏ',
      'Không giới hạn hình ảnh',
      'Thống kê nâng cao',
      'Hỗ trợ 24/7',
      'Tự động gia hạn',
      'Quảng cáo trên mạng xã hội',
      'Tư vấn chuyên nghiệp'
    ],
    icon: BoltOutlineIcon,
    color: 'purple',
    buttonText: 'Chọn gói VIP',
    buttonColor: 'bg-purple-600 hover:bg-purple-700'
  }
];

const additionalServices = [
  {
    name: 'Dịch vụ chụp ảnh chuyên nghiệp',
    description: 'Chụp ảnh phòng trọ với thiết bị chuyên nghiệp',
    price: 200000,
    duration: '1 ngày'
  },
  {
    name: 'Tư vấn pháp lý',
    description: 'Hỗ trợ tư vấn các vấn đề pháp lý liên quan',
    price: 500000,
    duration: '1 buổi'
  },
  {
    name: 'Thiết kế banner quảng cáo',
    description: 'Thiết kế banner đẹp mắt cho tin đăng',
    price: 100000,
    duration: '2 ngày'
  },
  {
    name: 'Dịch vụ dọn dẹp',
    description: 'Dọn dẹp phòng trọ trước khi chụp ảnh',
    price: 150000,
    duration: '1 ngày'
  }
];

export default function BangGiaPage() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bảng giá dịch vụ</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chọn gói dịch vụ phù hợp để tin đăng của bạn được nhiều người quan tâm hơn
          </p>
        </div>

        {/* Service Packages */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Gói dịch vụ đăng tin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {servicePackages.map((pkg) => {
              const IconComponent = pkg.icon;
              const isPopular = pkg.popular;
              
              return (
                <div
                  key={pkg.id}
                  className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 ${
                    isPopular 
                      ? 'border-orange-500 scale-105' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Phổ biến nhất
                      </span>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className={`p-3 rounded-full bg-${pkg.color}-100 mr-4`}>
                        <IconComponent className={`h-8 w-8 text-${pkg.color}-600`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{pkg.name}</h3>
                        <p className="text-gray-600">{pkg.description}</p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(pkg.price)}
                        </span>
                        {pkg.originalPrice && (
                          <>
                            <span className="text-xl text-gray-500 line-through ml-3">
                              {formatPrice(pkg.originalPrice)}
                            </span>
                            <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded ml-3">
                              -25%
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-gray-600 mt-2">
                        Sử dụng trong {pkg.duration} ngày
                      </p>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/thanh-toan"
                      className={`w-full ${pkg.buttonColor} text-white py-3 px-6 rounded-lg font-medium text-center block transition-colors`}
                    >
                      {pkg.buttonText}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Services */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Dịch vụ bổ sung
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {additionalServices.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>Thời gian: {service.duration}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(service.price)}
                    </div>
                    <button className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                      Đặt dịch vụ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Câu hỏi thường gặp
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Làm thế nào để thanh toán?
              </h3>
              <p className="text-gray-600">
                Chúng tôi hỗ trợ thanh toán qua VNPay, MoMo, ZaloPay và chuyển khoản ngân hàng.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Tin đăng có được duyệt tự động không?
              </h3>
              <p className="text-gray-600">
                Tin đăng sẽ được kiểm duyệt trong vòng 24 giờ để đảm bảo chất lượng.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Có thể hủy gói dịch vụ không?
              </h3>
              <p className="text-gray-600">
                Bạn có thể hủy gói dịch vụ trong vòng 7 ngày đầu và được hoàn tiền 100%.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Hỗ trợ khách hàng như thế nào?
              </h3>
              <p className="text-gray-600">
                Chúng tôi hỗ trợ 24/7 qua hotline, email và chat trực tuyến.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Bảng giá dịch vụ | NhaTroVN',
  description: 'Xem bảng giá các gói dịch vụ đăng tin, nâng cấp tin đăng để tiếp cận nhiều khách hàng hơn',
  keywords: 'bảng giá, gói dịch vụ, đăng tin, nâng cấp tin đăng, phongtro123'
};
