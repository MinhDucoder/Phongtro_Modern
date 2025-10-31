import Link from 'next/link';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const footerSections = {
  'Phòng trọ, nhà trọ': [
    { name: 'Phòng trọ Hồ Chí Minh', href: '/?province=TP.HCM&propertyType=phong_tro' },
    { name: 'Phòng trọ Hà Nội', href: '/?province=Hà Nội&propertyType=phong_tro' },
    { name: 'Phòng trọ Đà Nẵng', href: '/?province=Đà Nẵng&propertyType=phong_tro' },
    { name: 'Phòng trọ Cần Thơ', href: '/?province=Cần Thơ&propertyType=phong_tro' },
  ],
  'Thuê nhà nguyên căn': [
    { name: 'Thuê nhà Hồ Chí Minh', href: '/?province=TP.HCM&propertyType=nha_nguyen_can' },
    { name: 'Thuê nhà Hà Nội', href: '/?province=Hà Nội&propertyType=nha_nguyen_can' },
    { name: 'Thuê nhà Bình Dương', href: '/?province=Bình Dương&propertyType=nha_nguyen_can' },
    { name: 'Thuê nhà Đà Nẵng', href: '/?province=Đà Nẵng&propertyType=nha_nguyen_can' },
  ],
  'Cho thuê căn hộ': [
    { name: 'Thuê căn hộ Hồ Chí Minh', href: '/?province=TP.HCM&propertyType=can_ho_chung_cu' },
    { name: 'Thuê căn hộ Hà Nội', href: '/?province=Hà Nội&propertyType=can_ho_chung_cu' },
    { name: 'Thuê căn hộ Bình Dương', href: '/?province=Bình Dương&propertyType=can_ho_chung_cu' },
    { name: 'Thuê căn hộ Đà Nẵng', href: '/?province=Đà Nẵng&propertyType=can_ho_chung_cu' },
  ],
  'Cho thuê mặt bằng': [
    { name: 'Thuê mặt bằng Hồ Chí Minh', href: '/?province=TP.HCM&propertyType=mat_bang' },
    { name: 'Thuê mặt bằng Hà Nội', href: '/?province=Hà Nội&propertyType=mat_bang' },
    { name: 'Thuê mặt bằng Đà Nẵng', href: '/?province=Đà Nẵng&propertyType=mat_bang' },
    { name: 'Thuê mặt bằng Cần Thơ', href: '/?province=Cần Thơ&propertyType=mat_bang' },
  ],
  'Tìm người ở ghép': [
    { name: 'Ở ghép Hồ Chí Minh', href: '/?province=TP.HCM&propertyType=o_ghep' },
    { name: 'Ở ghép Hà Nội', href: '/?province=Hà Nội&propertyType=o_ghep' },
    { name: 'Ở ghép Đà Nẵng', href: '/?province=Đà Nẵng&propertyType=o_ghep' },
    { name: 'Ở ghép Bình Dương', href: '/?province=Bình Dương&propertyType=o_ghep' },
  ],
};

const companyInfo = [
  { 
    title: 'Về NhaTroVN', 
    icon: InformationCircleIcon,
    links: [
      { name: 'Giới thiệu', href: '/about' },
      { name: 'Quy chế hoạt động', href: '/terms' },
      { name: 'Quy định sử dụng', href: '/terms-of-use' },
      { name: 'Chính sách bảo mật', href: '/privacy' },
      { name: 'Liên hệ', href: '/contact' }
    ] 
  },
  { 
    title: 'Dành cho khách hàng', 
    icon: QuestionMarkCircleIcon,
    links: [
      { name: 'Câu hỏi thường gặp', href: '/faq' },
      { name: 'Hướng dẫn đăng tin', href: '/guide' },
      { name: 'Bảng giá dịch vụ', href: '/bang-gia' },
      { name: 'Quy định đăng tin', href: '/posting-rules' },
      { name: 'Giải quyết khiếu nại', href: '/complaints' }
    ] 
  },
];

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/nhatrovn' },
  { name: 'Zalo', href: 'https://zalo.me/nhatrovn' },
  { name: 'YouTube', href: 'https://youtube.com/nhatrovn' },
  { name: 'TikTok', href: 'https://tiktok.com/@nhatrovn' },
];

function SocialIcon({ name }: { name: string }) {
  // Inline brand SVGs to avoid external deps
  if (name === 'Facebook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="block h-5 w-5 fill-[#1877F2]">
        <path d="M24 12.073C24 5.406 18.627 0 12 0S0 5.406 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.356c0-3.014 1.792-4.679 4.532-4.679 1.312 0 2.686.235 2.686.235v2.963h-1.514c-1.492 0-1.956.928-1.956 1.88v2.261h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    );
  }
  if (name === 'YouTube') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="block h-5 w-5">
        <path className="fill-[#FF0000]" d="M23.498 6.186a3.004 3.004 0 0 0-2.115-2.127C19.57 3.5 12 3.5 12 3.5s-7.57 0-9.383.559A3.004 3.004 0 0 0 .502 6.186C0 8.008 0 12 0 12s0 3.992.502 5.814a3.004 3.004 0 0 0 2.115 2.127C4.43 20.5 12 20.5 12 20.5s7.57 0 9.383-.559a3.004 3.004 0 0 0 2.115-2.127C24 15.992 24 12 24 12s0-3.992-.502-5.814Z"/>
        <path className="fill-white" d="M9.75 15.5v-7l6 3.5-6 3.5Z"/>
      </svg>
    );
  }
  if (name === 'TikTok') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="block h-5 w-5">
        <path className="fill-black" d="M12.9 2h3.007a5.94 5.94 0 0 0 1.03 2.687c.96 1.41 2.415 2.34 4.063 2.613V10.5c-1.92-.04-3.72-.64-5.1-1.61v6.946c0 3.62-2.934 6.55-6.553 6.55A6.555 6.555 0 0 1 2.8 15.84c.3-3.28 3.122-5.77 6.403-5.47.47.04.92.13 1.35.27v3.34a3.11 3.11 0 0 0-1.35-.28 3.25 3.25 0 1 0 3.25 3.25L12.9 2Z"/>
      </svg>
    );
  }
  if (name === 'Zalo') {
    // Use external PNG icon provided
    return (
      <img
        src="https://diendantructuyen.com/wp-content/uploads/2025/08/logo-zalo-vector-3.png"
        alt="Zalo"
        className="block h-7 w-7 object-contain transform scale-125"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }
  return null;
}

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Main footer content - Compact layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-6">
          {Object.entries(footerSections).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
              <ul className="space-y-1">
                {links.slice(0, 4).map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-xs text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                {links.length > 4 && (
                  <li>
                    <span className="text-xs text-gray-500">+{links.length - 4} khác</span>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Company info & Contact - Combined */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pt-6 border-t border-gray-200">
          {/* Company Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Về NhaTroVN</h3>
            <ul className="space-y-1">
              {companyInfo[0].links.slice(0, 3).map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-xs text-gray-600 hover:text-blue-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Liên hệ</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-3 w-3" />
                <span>0909 316 890</span>
              </div>
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="h-3 w-3" />
                <span>contact@nhatrovn.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-3 w-3" />
                <span className="text-xs">TP.HCM, Việt Nam</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Mạng xã hội</h3>
            <div className="flex space-x-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center bg-white border rounded hover:bg-blue-50 transition-colors"
                  title={social.name}
                >
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section - Legal & Support combined */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            {/* Legal Info */}
            <div className="text-xs text-gray-600 space-y-1">
              <p>© 2024 NhaTroVN. Tất cả quyền được bảo lưu.</p>
              <p>Giấy phép: 0313588502 - Sở KH&ĐT TP.HCM</p>
              <div className="flex space-x-4">
                <Link href="/terms" className="hover:text-blue-600 transition-colors">Điều khoản</Link>
                <Link href="/privacy" className="hover:text-blue-600 transition-colors">Bảo mật</Link>
              </div>
            </div>

            {/* Support - Compact */}
            <div className="bg-blue-50 rounded-lg p-3 text-xs">
              <div className="flex items-center space-x-2 mb-1">
                <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Hỗ trợ đăng tin</span>
              </div>
              <div className="text-blue-800">
                <div>📞 0909 316 890 | 💬 Zalo: 0909316890</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
