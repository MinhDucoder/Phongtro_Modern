'use client';

import Link from 'next/link';

export default function QuyCheHoatDongPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Quy chế hoạt động</h1>

      {/* Nội dung Quy chế hoạt động */}
      <p className="text-gray-700 mb-4">
        <strong>1. Nguyên tắc chung</strong>
      </p>
      <p className="text-gray-700 mb-2">
        1.1. Nhà Trọ VN là nền tảng trực tuyến kết nối giữa người cho thuê (chủ trọ) và người thuê trọ, hỗ trợ đăng tin, tìm kiếm và quản lý thông tin nhà trọ.
      </p>
      <p className="text-gray-700 mb-2">
        1.2. Việc đăng tin, tìm kiếm và giao dịch trên nền tảng phải tuân thủ pháp luật hiện hành tại Việt Nam, không được vi phạm các nội dung cấm: thông tin sai lệch, tài sản không rõ nguồn gốc, lừa đảo, quảng cáo gây hiểu nhầm. 
      </p>
      <p className="text-gray-700 mb-2">
        1.3. Người dùng trước khi sử dụng dịch vụ của Nhà Trọ VN phải đăng ký tài khoản, xác thực thông tin cá nhân/công ty theo yêu cầu nền tảng để đảm bảo tính minh bạch.
      </p>
      <p className="text-gray-700 mb-4">
        1.4. Nhà Trọ VN có quyền từ chối, xóa hoặc đình bản tin đăng hoặc tài khoản nếu phát hiện vi phạm quy chế hoạt động, vi phạm pháp luật hoặc gây ảnh hưởng xấu tới cộng đồng.
      </p>

      <p className="text-gray-700 mb-2">
        <strong>2. Đăng tin và quản lý tin</strong>
      </p>
      <p className="text-gray-700 mb-2">
        2.1. Chủ trọ khi đăng tin phải đảm bảo thông tin chính xác: diện tích, địa chỉ, giá thuê, điều kiện thuê, hình ảnh thật, giấy tờ hợp pháp (nếu cần)…
      </p>
      <p className="text-gray-700 mb-2">
        2.2. Tin đăng không được chứa thông tin gây nhầm lẫn, vi phạm bản quyền, xúc phạm, phân biệt đối xử hoặc nội dung cấm theo quy định.
      </p>
      <p className="text-gray-700 mb-2">
        2.3. Tin đăng cần được duyệt hoặc kiểm tra bởi đội ngũ Nhà Trọ VN trước khi hiển thị công khai — hoặc nền tảng có thể áp dụng kiểm soát sau khi đăng tùy vào phạm vi hoạt động.
      </p>
      <p className="text-gray-700 mb-2">
        2.4. Chủ trọ có trách nhiệm cập nhật tin đăng khi có thay đổi về giá thuê, tình trạng phòng, điều kiện thuê, hoặc khi phòng đã được cho thuê.
      </p>
      <p className="text-gray-700 mb-4">
        2.5. Người thuê có thể tìm kiếm, lưu lại, liên hệ với chủ trọ theo thông tin hiển thị; nhưng mọi giao dịch thuê mướn ngoài nền tảng vẫn thuộc trách nhiệm của hai bên.
      </p>

      <p className="text-gray-700 mb-2">
        <strong>3. Thanh toán, đặt cọc & giao dịch</strong>
      </p>
      <p className="text-gray-700 mb-2">
        3.1. Nếu Nhà Trọ VN hỗ trợ đặt cọc hoặc thanh toán trực tuyến, sẽ có thông báo rõ về phí dịch vụ, phương thức thanh toán, quyền hoàn trả và điều kiện huỷ.
      </p>
      <p className="text-gray-700 mb-2">
        3.2. Nhà Trọ VN chỉ đóng vai trò trung gian hỗ trợ đăng tin và kết nối; việc ký hợp đồng, thanh toán, đặt cọc giữa chủ trọ và người thuê thuộc trách nhiệm hai bên.
      </p>
      <p className="text-gray-700 mb-2">
        3.3. Nhà Trọ VN không chịu trách nhiệm pháp lý cho việc chủ trọ và người thuê ký hợp đồng, thực hiện thuê mướn, hoặc tranh chấp phát sinh nếu hai bên tự thỏa thuận ngoài nền tảng.
      </p>
      <p className="text-gray-700 mb-4">
        3.4. Mọi khoản chi phí dịch vụ nền tảng, nếu có, sẽ được Nhà Trọ VN thông báo trước khi sử dụng.
      </p>

      <p className="text-gray-700 mb-2">
        <strong>4. Quyền và trách nhiệm của người dùng</strong>
      </p>
      <div className="text-gray-700 mb-2">
        <strong>4.1. Chủ trọ:</strong>
        <ul className="list-disc list-inside ml-4">
          <li>Đăng tin với thông tin trung thực.</li>
          <li>Đảm bảo tính hợp pháp của nhà trọ (giấy tờ, quyền sở hữu hoặc cho thuê hợp pháp).</li>
          <li>Cập nhật trạng thái phòng khi đã cho thuê hoặc thay đổi điều kiện.</li>
          <li>Trách nhiệm với người thuê theo hợp đồng giữa hai bên.</li>
        </ul>
      </div>

      <div className="text-gray-700 mb-2">
        <strong>4.2. Người thuê:</strong>
        <ul className="list-disc list-inside ml-4">
          <li>Cung cấp thông tin chính xác khi yêu cầu đăng ký/đặt cọc.</li>
          <li>Tuân thủ các điều kiện thuê mướn với chủ trọ.</li>
          <li>Có quyền phản ánh, khiếu nại tin đăng nếu phát hiện sai lệch.</li>
        </ul>
      </div>

      <div className="text-gray-700 mb-4">
        <strong>4.3. Nhà Trọ VN:</strong>
        <ul className="list-disc list-inside ml-4">
          <li>Cung cấp nền tảng để đăng tin, tìm kiếm, kết nối.</li>
          <li>Duy trì tính minh bạch, an toàn thông tin người dùng.</li>
          <li>Có quyền từ chối hoặc xử lý tin đăng/hoạt động vi phạm.</li>
          <li>Không chịu trách nhiệm trực tiếp trong việc ký kết hợp đồng thuê mướn giữa hai bên.</li>
        </ul>
      </div>

      <p className="text-gray-700 mb-2">
        <strong>5. Bảo mật & dữ liệu cá nhân</strong>
      </p>
      <p className="text-gray-700 mb-2">
        5.1. Nhà Trọ VN cam kết bảo mật thông tin cá nhân và dữ liệu người dùng theo quy định của pháp luật.
      </p>
      <p className="text-gray-700 mb-2">
        5.2. Người dùng khi đăng ký hoặc cung cấp thông tin đồng ý cho Nhà Trọ VN thu thập, sử dụng dữ liệu với mục đích quản lý, kết nối và cải thiện dịch vụ.
      </p>
      <p className="text-gray-700 mb-4">
        5.3. Trong trường hợp có yêu cầu từ cơ quan chức năng, Nhà Trọ VN có thể cung cấp thông tin người dùng khi có vi phạm pháp luật.
      </p>

      <p className="text-gray-700 mb-2">
        <strong>6. Giải quyết khiếu nại & tranh chấp</strong>
      </p>
      <p className="text-gray-700 mb-2">
        6.1. Người dùng có quyền khiếu nại nếu tin đăng có dấu hiệu sai lệch, bị lừa đảo, hoặc dịch vụ không đúng như cam kết.
      </p>
      <p className="text-gray-700 mb-2">
        6.2. Nhà Trọ VN sẽ thiết lập cơ chế tiếp nhận khiếu nại, phản hồi trong thời gian hợp lý và phối hợp với người dùng nếu cần.
      </p>
      <p className="text-gray-700 mb-4">
        6.3. Mọi tranh chấp giữa chủ trọ và người thuê phát sinh từ hợp đồng thuê mướn sẽ được hai bên tự giải quyết hoặc theo pháp luật; Nhà Trọ VN chỉ hỗ trợ cung cấp thông tin nếu nằm trong phạm vi kiểm soát.
      </p>

      <p className="text-gray-700 mb-2">
        <strong>7. Sửa đổi, bổ sung quy chế</strong>
      </p>
      <p className="text-gray-700 mb-4">
        7.1. Nhà Trọ VN có quyền sửa đổi, bổ sung quy chế hoạt động và sẽ thông báo tới người dùng bằng cách đăng tải bản mới trên website.<br/>
        7.2. Người dùng khi tiếp tục sử dụng dịch vụ sau khi quy chế được sửa đổi đồng nghĩa với việc chấp nhận các điều khoản mới.
      </p>

      {/* Tiêu đề cho phần liên quan */}
      <h2 className="text-2xl font-bold mb-4">Các bài liên quan khác của PhongtroVN</h2>

      <div className="border-t pt-4">
        <div className="mb-2">
          <Link href="/about" className="hover:text-blue-600 transition-colors">
            Giới thiệu
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
