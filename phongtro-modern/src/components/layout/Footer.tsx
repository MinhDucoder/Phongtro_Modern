import Link from 'next/link';

const footerSections = {
  'Phòng trọ, nhà trọ': [
    'Phòng trọ Hồ Chí Minh',
    'Phòng trọ Hà Nội',
    'Phòng trọ Đà Nẵng',
    'Phòng trọ Cần Thơ',
    'Phòng trọ Bình Dương',
    'Phòng trọ Đồng Nai',
    'Phòng trọ Vũng Tàu',
    'Phòng trọ Khánh Hòa',
  ],
  'Thuê nhà nguyên căn': [
    'Thuê nhà Hồ Chí Minh',
    'Thuê nhà Hà Nội',
    'Thuê nhà Bình Dương',
    'Thuê nhà Đà Nẵng',
    'Thuê nhà Đồng Nai',
    'Thuê nhà Cần Thơ',
    'Thuê nhà Khánh Hòa',
  ],
  'Cho thuê căn hộ': [
    'Thuê căn hộ Hồ Chí Minh',
    'Thuê căn hộ Hà Nội',
    'Thuê căn hộ Bình Dương',
    'Thuê căn hộ Đà Nẵng',
    'Thuê căn hộ Hải Phòng',
    'Thuê căn hộ Khánh Hòa',
  ],
  'Cho thuê mặt bằng': [
    'Thuê mặt bằng Hồ Chí Minh',
    'Thuê mặt bằng Hà Nội',
    'Thuê mặt bằng Đà Nẵng',
    'Thuê mặt bằng Cần Thơ',
    'Thuê mặt bằng Bình Dương',
  ],
  'Tìm người ở ghép': [
    'Ở ghép Hồ Chí Minh',
    'Ở ghép Hà Nội',
    'Ở ghép Đà Nẵng',
    'Ở ghép Bình Dương',
    'Ở ghép Cần Thơ',
    'Ở ghép Đồng Nai',
    'Ở ghép Hải Phòng',
    'Ở ghép Khánh Hòa',
  ],
};

const companyInfo = [
  { title: 'Về phongtro123.com', links: ['Giới thiệu', 'Quy chế hoạt động', 'Quy định sử dụng', 'Chính sách bảo mật', 'Liên hệ'] },
  { title: 'Dành cho khách hàng', links: ['Câu hỏi thường gặp', 'Hướng dẫn đăng tin', 'Bảng giá dịch vụ', 'Quy định đăng tin', 'Giải quyết khiếu nại'] },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {Object.entries(footerSections).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-darker mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Company info section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pt-8 border-t border-gray-200">
          {companyInfo.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-darker mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-darker mb-4">Phương thức thanh toán</h3>
          <div className="flex space-x-4">
            {['Visa', 'Mastercard', 'JCB', 'MoMo', 'ZaloPay', 'ShopeePay'].map((method) => (
              <div key={method} className="bg-white border rounded px-3 py-1 text-xs text-gray-600">
                {method}
              </div>
            ))}
          </div>
        </div>

        {/* Company details */}
        <div className="pt-8 border-t border-gray-200">
          <div className="mb-4">
            <h4 className="font-semibold text-darker">CÔNG TY TNHH LBKCORP</h4>
            <p className="text-sm text-gray-600 mt-2">
              Căn 02.34, Lầu 2, Tháp 3, The Sun Avenue, Số 28 Mai Chí Thọ, Phường An Phú, 
              Thành phố Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam.
            </p>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Tổng đài CSKH: 0909 316 890 - Email: contact@phongtro123.com</p>
            <p>Giấy phép đăng ký kinh doanh số 0313588502 do Sở kế hoạch và Đầu tư Tp.HCM cấp ngày 24 tháng 12 năm 2015.</p>
          </div>
        </div>

        {/* Support section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Hỗ trợ chủ nhà đăng tin</h4>
          <p className="text-sm text-blue-800 mb-2">
            Nếu bạn cần hỗ trợ đăng tin, vui lòng liên hệ số điện thoại bên dưới:
          </p>
          <p className="text-sm font-medium text-blue-900">
            ĐT: 0909316890 Zalo: 0909316890
          </p>
          <p className="text-sm text-blue-800 mt-2">
            Hỗ trợ ngoài giờ: Zalo: NhaTroVN
          </p>
        </div>
      </div>
    </footer>
  );
}
