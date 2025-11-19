'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Giới thiệu về PhongtroVN</h1>

      <p className="text-gray-700 mb-4">
        PhongtroVN là nền tảng trực tuyến giúp người dùng dễ dàng tìm kiếm, đăng tin và quản lý nhà trọ trên toàn Việt Nam. Chúng tôi hướng tới việc tạo ra một không gian <strong>minh bạch</strong>, <strong>tiện lợi</strong> và <strong>thân thiện</strong>, nơi người thuê và chủ trọ có thể kết nối nhanh chóng và hiệu quả.
      </p>

      <p className="text-gray-700 mb-4">
        Với mong muốn đơn giản hóa quá trình tìm kiếm chỗ ở, PhongtroVN cung cấp thông tin nhà trọ <strong>rõ ràng, chi tiết</strong> về vị trí, tiện ích, giá cả và các điều kiện đi kèm. Đồng thời, chúng tôi trang bị cho chủ trọ những <strong>công cụ quản lý chuyên nghiệp</strong>, giúp họ dễ dàng theo dõi, chỉnh sửa và cập nhật thông tin bất động sản của mình một cách nhanh chóng và hiệu quả.
      </p>

      <p className="text-gray-700 mb-4">
        <strong>Sứ mệnh của PhongtroVN</strong> là trở thành nền tảng nhà trọ đáng tin cậy và tiện ích nhất tại Việt Nam, nơi mọi người có thể tìm kiếm, chia sẻ và quản lý thông tin trọ một cách <strong>nhanh chóng, an toàn</strong> và <strong>hiệu quả</strong>.
      </p>

      <p className="text-gray-700 mb-4">
        PhongtroVN tin rằng việc tìm được nơi ở phù hợp không chỉ là một <strong>nhu cầu thiết yếu</strong> mà còn là <strong>bước khởi đầu quan trọng</strong> cho một cuộc sống ổn định và tốt đẹp hơn. Chúng tôi đồng hành cùng người thuê và chủ trọ, giúp quá trình tìm kiếm, đăng tin và quản lý nhà trọ trở nên <strong>dễ dàng và thuận tiện</strong>.
      </p>

      <p className="text-gray-700 mb-6">
        Với PhongtroVN, việc tìm một chỗ trọ lý tưởng trở nên đơn giản, minh bạch và an tâm. Chúng tôi tự hào là <strong>người bạn đồng hành đáng tin cậy</strong> cho cộng đồng người thuê trọ và chủ trọ trên khắp Việt Nam.
      </p>

      <h2 className="text-2xl font-bold mb-4">Các bài liên quan khác của PhongtroVN</h2>

      <div className="border-t pt-4">
        <div className="mb-2">
          <Link href="/regulations" className="hover:text-blue-600 transition-colors">
            Quy chế hoạt động
          </Link>
        </div>
        <div className="mb-2">
          <Link href="/terms-of-use" className="hover:text-blue-600 transition-colors">
            Quy định sử dụng
          </Link>
        </div>
        <div className="mb-2">
          <Link href="/terms" className="hover:text-blue-600 transition-colors">
            Điều khoản
          </Link>
        </div>
        <div className="mb-2">
          <Link href="/privacy" className="hover:text-blue-600 transition-colors">
            Bảo mật
          </Link>
        </div>
      </div>
    </div>
  );
}
