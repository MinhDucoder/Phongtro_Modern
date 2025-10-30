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
    { name: 'Phòng trọ Hồ Chí Minh', href: '/phong-tro?city=ho-chi-minh' },
    { name: 'Phòng trọ Hà Nội', href: '/phong-tro?city=ha-noi' },
    { name: 'Phòng trọ Đà Nẵng', href: '/phong-tro?city=da-nang' },
    { name: 'Phòng trọ Cần Thơ', href: '/phong-tro?city=can-tho' },
    { name: 'Phòng trọ Bình Dương', href: '/phong-tro?city=binh-duong' },
    { name: 'Phòng trọ Đồng Nai', href: '/phong-tro?city=dong-nai' },
    { name: 'Phòng trọ Vũng Tàu', href: '/phong-tro?city=vung-tau' },
    { name: 'Phòng trọ Khánh Hòa', href: '/phong-tro?city=khanh-hoa' },
  ],
  'Thuê nhà nguyên căn': [
    { name: 'Thuê nhà Hồ Chí Minh', href: '/nha-nguyen-can?city=ho-chi-minh' },
    { name: 'Thuê nhà Hà Nội', href: '/nha-nguyen-can?city=ha-noi' },
    { name: 'Thuê nhà Bình Dương', href: '/nha-nguyen-can?city=binh-duong' },
    { name: 'Thuê nhà Đà Nẵng', href: '/nha-nguyen-can?city=da-nang' },
    { name: 'Thuê nhà Đồng Nai', href: '/nha-nguyen-can?city=dong-nai' },
    { name: 'Thuê nhà Cần Thơ', href: '/nha-nguyen-can?city=can-tho' },
    { name: 'Thuê nhà Khánh Hòa', href: '/nha-nguyen-can?city=khanh-hoa' },
  ],
  'Cho thuê căn hộ': [
    { name: 'Thuê căn hộ Hồ Chí Minh', href: '/can-ho?city=ho-chi-minh' },
    { name: 'Thuê căn hộ Hà Nội', href: '/can-ho?city=ha-noi' },
    { name: 'Thuê căn hộ Bình Dương', href: '/can-ho?city=binh-duong' },
    { name: 'Thuê căn hộ Đà Nẵng', href: '/can-ho?city=da-nang' },
    { name: 'Thuê căn hộ Hải Phòng', href: '/can-ho?city=hai-phong' },
    { name: 'Thuê căn hộ Khánh Hòa', href: '/can-ho?city=khanh-hoa' },
  ],
  'Cho thuê mặt bằng': [
    { name: 'Thuê mặt bằng Hồ Chí Minh', href: '/mat-bang?city=ho-chi-minh' },
    { name: 'Thuê mặt bằng Hà Nội', href: '/mat-bang?city=ha-noi' },
    { name: 'Thuê mặt bằng Đà Nẵng', href: '/mat-bang?city=da-nang' },
    { name: 'Thuê mặt bằng Cần Thơ', href: '/mat-bang?city=can-tho' },
    { name: 'Thuê mặt bằng Bình Dương', href: '/mat-bang?city=binh-duong' },
  ],
  'Tìm người ở ghép': [
    { name: 'Ở ghép Hồ Chí Minh', href: '/o-ghep?city=ho-chi-minh' },
    { name: 'Ở ghép Hà Nội', href: '/o-ghep?city=ha-noi' },
    { name: 'Ở ghép Đà Nẵng', href: '/o-ghep?city=da-nang' },
    { name: 'Ở ghép Bình Dương', href: '/o-ghep?city=binh-duong' },
    { name: 'Ở ghép Cần Thơ', href: '/o-ghep?city=can-tho' },
    { name: 'Ở ghép Đồng Nai', href: '/o-ghep?city=dong-nai' },
    { name: 'Ở ghép Hải Phòng', href: '/o-ghep?city=hai-phong' },
    { name: 'Ở ghép Khánh Hòa', href: '/o-ghep?city=khanh-hoa' },
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
  { name: 'Facebook', href: 'https://facebook.com/nhatrovn', icon: '📘' },
  { name: 'Zalo', href: 'https://zalo.me/nhatrovn', icon: '💬' },
  { name: 'YouTube', href: 'https://youtube.com/nhatrovn', icon: '📺' },
  { name: 'TikTok', href: 'https://tiktok.com/@nhatrovn', icon: '🎵' },
];

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
                  className="flex items-center space-x-1 p-2 bg-white border rounded hover:bg-blue-50 transition-colors"
                  title={social.name}
                >
                  <span className="text-sm">{social.icon}</span>
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
