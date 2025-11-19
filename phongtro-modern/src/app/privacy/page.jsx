'use client';

import Link from 'next/link';

export default function BaoMatPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Bảo mật</h1>

      <p className="text-gray-700 mb-4">
        Chào mừng bạn đến với nền tảng NhaTroVN (“NhaTroVN”). Chúng tôi cam kết thực hiện các biện pháp liên quan để bảo vệ dữ liệu cá nhân của người dùng tuân theo các quy định pháp luật về bảo mật thông tin/dữ liệu cá nhân. 
        Chính sách bảo mật này (“Chính sách”) được lập nhằm quy định cách thức chúng tôi thu thập, sử dụng, tiết lộ, lưu trữ và/hoặc xử lý dữ liệu khi bạn truy cập vào trang web NhaTroVN và tất cả các trang web phụ liên quan khác (“Nền tảng”).
      </p>

      <p className="text-gray-700 mb-4">
        Bằng việc sử dụng các Dịch vụ, đăng ký Tài khoản với chúng tôi hoặc truy cập Nền tảng của chúng tôi, bạn xác nhận và đồng ý cho phép chúng tôi thu thập, sử dụng, tiết lộ và/hoặc xử lý dữ liệu cá nhân của bạn như quy định trong Chính sách này. 
        NẾU BẠN KHÔNG ĐỒNG Ý CHO PHÉP XỬ LÝ DỮ LIỆU CỦA BẠN NHƯ QUY ĐỊNH TRONG CHÍNH SÁCH NÀY, VUI LÒNG KHÔNG SỬ DỤNG CÁC DỊCH VỤ CỦA CHÚNG TÔI HOẶC TRUY CẬP NỀN TẢNG CỦA CHÚNG TÔI.
      </p>

      <p className="text-gray-700 mb-6">
        Chúng tôi có toàn quyền sửa đổi, bổ sung, cập nhật Chính sách này tại từng thời điểm. Vui lòng thường xuyên kiểm tra lại Chính sách bảo mật này để theo dõi bất kỳ cập nhật hoặc thay đổi nào.
      </p>

      <h2 className="text-2xl font-bold mb-2">1. Chúng tôi sẽ thu thập những thông tin cá nhân nào?</h2>

      <h3 className="text-xl font-semibold mb-1">1.1 Những thông tin cá nhân mà chúng tôi có thể thu thập:</h3>
      <ul className="list-disc list-inside ml-6 mb-4 text-gray-700">
        <li>Thông tin tài khoản như họ và tên, địa chỉ email, địa chỉ, giới tính, ngày sinh, ảnh hồ sơ, số điện thoại di động, các thông tin bắt buộc hoặc không bắt buộc khác.</li>
        <li>Dữ liệu khi bạn truy cập và/hoặc sử dụng Nền tảng của chúng tôi như địa chỉ IP, các thông tin về trình duyệt, các địa chỉ bạn đã truy cập trên Nền tảng, thời gian bạn hoạt động trên Nền tảng của chúng tôi.</li>
        <li>Dữ liệu về vị trí như vị trí điện thoại di động của bạn và/hoặc bất kỳ thông tin vị trí nào khi bạn chụp và chia sẻ vị trí dưới dạng hình ảnh hoặc video và tải nội dung đó lên Nền tảng.</li>
        <li>Dữ liệu về lịch sử, nội dung hội thoại giữa bạn và các người dùng khác trên Nền tảng khi trao đổi thông qua chức năng chat, bao gồm nhưng không giới hạn các thông tin dưới dạng văn bản, âm thanh, hình ảnh.</li>
        <li>Bất kỳ thông tin, dữ liệu nào khác được tiết lộ bởi bạn khi đăng nhập, sử dụng các Dịch vụ và Nền tảng, như sở thích của bạn trong việc nhận thông tin tiếp thị từ chúng tôi và/hoặc từ các bên thứ ba.</li>
        <li>Bất kỳ dữ liệu, thông tin tổng hợp khác về nội dung người dùng sử dụng.</li>
      </ul>
      <h3 className="text-xl font-semibold mb-1">1.2 Trong quá trình bạn sử dụng Nền tảng và Dịch vụ, chúng tôi có thể thu thập thông tin cá nhân của bạn trong các trường hợp sau:</h3>
      <ul className="list-disc list-inside ml-6 mb-4 text-gray-700">
        <li>Khi bạn đăng ký và/hoặc mở một tài khoản với chúng tôi;</li>
        <li>Khi bạn đăng ký và/hoặc sử dụng bất kỳ Dịch vụ trên Nền tảng chúng tôi;</li>
        <li>Khi bạn sử dụng bất kỳ tính năng hoặc chức năng nào có sẵn trên Nền tảng của chúng tôi;</li>
        <li>Khi bạn sử dụng chức năng Chat trên Nền tảng;</li>
        <li>Khi bạn đăng ký, tham gia vào bất kỳ cuộc khảo sát, cuộc thi, chiến dịch khuyến mãi hoặc chiến dịch tiếp thị nào của chúng tôi;</li>
        <li>Khi bạn đăng bất kỳ ý kiến, nhận xét nào về nội dung của người dùng khác được tải lên Nền tảng hoặc khi bất kỳ người dùng nào khác trên Nền tảng đăng bất kỳ nhận xét về nội dung của bạn đã tải lên Nền tảng;</li>
        <li>Khi bạn gửi khiếu nại cho chúng tôi hoặc khi bên thứ ba khiếu nại về bạn hoặc nội dung của bạn trên Nền tảng;</li>
        <li>Khi bạn gửi thông tin cá nhân của bạn cho chúng tôi vì bất kỳ lý do gì.</li>
      </ul>

      <h3 className="text-xl font-semibold mb-1">1.3 Cam kết cung cấp thông tin chính xác</h3>
      <p className="text-gray-700 mb-4">
        Bạn đồng ý không cung cấp cho chúng tôi bất kỳ thông tin nào không chính xác hoặc gây hiểu nhầm. Bạn phải thường xuyên cập nhật thông tin cá nhân của mình và thông báo cho chúng tôi về bất kỳ thông tin nào không chính xác hoặc khi có sự thay đổi. Chúng tôi có quyền yêu cầu bạn cung cấp những tài liệu cần thiết để xác minh thông tin cá nhân do bạn cung cấp.
      </p>

      <h3 className="text-xl font-semibold mb-1">1.4 Liên kết với tài khoản mạng xã hội</h3>
      <p className="text-gray-700 mb-6">
        Nếu bạn liên kết tài khoản của bạn trên Nền tảng của chúng tôi với tài khoản mạng xã hội của bạn hoặc sử dụng một số tính năng mạng xã hội nào của NhaTroVN, chúng tôi có thể truy cập dữ liệu cá nhân về bạn mà bạn đã tự nguyện cung cấp cho các nhà cung cấp dịch vụ tài khoản mạng xã hội theo chính sách của họ và chúng tôi sẽ quản lý, sử dụng các dữ liệu cá nhân này của bạn theo Chính sách này tại mọi thời điểm.
      </p>
      <h2 className="text-2xl font-bold mb-4">2. Mục đích thu thập thông tin cá nhân</h2>
      <p className="text-gray-700 mb-4">
        Chúng tôi có thể thu thập, sử dụng, tiết lộ và/hoặc xử lý thông tin cá nhân của bạn vì một hoặc nhiều mục đích sau đây:
      </p>
      <ul className="list-disc list-inside ml-6 mb-4 text-gray-700">
        <li>Để nhận dạng và/hoặc xác minh danh tính người dùng;</li>
        <li>Để liên hệ cho mục đích hỗ trợ cung cấp Dịch vụ của chúng tôi và/hoặc quản lý mối quan hệ của bạn với chúng tôi hoặc việc sử dụng Dịch vụ của bạn với chúng tôi;</li>
        <li>Để xem xét và/hoặc xử lý đơn đăng ký/giao dịch của bạn với chúng tôi hoặc giao dịch hay thư từ của bạn với các bên thứ ba qua Dịch vụ;</li>
        <li>Để quản lý, điều hành, cung cấp và/hoặc quản lý việc bạn sử dụng và/hoặc truy cập Dịch vụ và các Nền tảng của chúng tôi (bao gồm các sở thích của bạn), cũng như quan hệ và tài khoản người dùng của bạn với chúng tôi;</li>
        <li>Để cung cấp thông tin chính thức cho người mua liên hệ với bạn khi bán hàng;</li>
        <li>Để tiến hành các hoạt động nghiên cứu, phân tích, kiểm tra, đánh giá và phát triển dữ liệu trên Nền tảng của chúng tôi;</li>
        <li>Để nhận diện người dùng và quản lý thông tin tài khoản;</li>
        <li>Để xác định người dùng truy cập trên Nền tảng;</li>
        <li>Để phát hiện, điều tra và/hoặc ngăn chặn các hoạt động gian lận, phi pháp, thiếu sót hay hành vi sai trái nào, cho dù đã diễn ra hay chưa, có liên quan đến việc bạn sử dụng Dịch vụ của chúng tôi hay không hay bất kỳ vấn đề nào phát sinh từ quan hệ của bạn với chúng tôi;</li>
        <li>Để đáp ứng, xử lý, giải quyết hoặc hoàn tất một giao dịch và/hoặc đáp ứng các yêu cầu của bạn đối với các sản phẩm và dịch vụ nhất định và thông báo cho bạn về các vấn đề dịch vụ và các hoạt động tài khoản bất thường;</li>
        <li>Để bảo vệ sự an toàn cá nhân và các quyền, tài sản hoặc sự an toàn của người khác;</li>
        <li>Để phục vụ mục đích nhận dạng, xác minh, đánh giá pháp lý hoặc để nhận biết khách hàng;</li>
        <li>Để đánh giá và đưa ra các quyết định liên quan đến hồ sơ tín dụng và rủi ro của bạn và tính đủ điều kiện để cho vay, trả sau hoặc cho các sản phẩm tín dụng, nếu có;</li>
        <li>Để duy trì và quản lý bất kỳ bản cập nhật phần mềm nào và/hoặc các bản cập nhật khác và sự hỗ trợ có thể được yêu cầu tùy lúc nhằm đảm bảo Dịch Vụ của chúng tôi hoạt động suôn sẻ;</li>
        <li>Để giải quyết hoặc tạo điều kiện thuận lợi cho dịch vụ khách hàng, thực hiện các chỉ thị của bạn, giải quyết hoặc trả lời bất kỳ thắc mắc nào được gửi bởi (hoặc nhằm được gửi bởi) bạn hoặc thay mặt bạn;</li>
        <li>Để liên hệ với bạn hoặc liên lạc với bạn qua điện thoại, tin nhắn văn bản và/hoặc tin nhắn fax, email và/hoặc thư hoặc cách khác nhằm mục đích quản trị và/hoặc quản lý quan hệ của bạn với chúng tôi hoặc việc bạn sử dụng Dịch vụ của chúng tôi, chẳng hạn như ở việc truyền đạt thông tin hành chính cho bạn liên quan đến Dịch vụ của chúng tôi. Bạn xác nhận và đồng ý rằng sự liên lạc như thế của chúng tôi có thể là theo cách gửi thư qua đường bưu điện, tài liệu hoặc thông báo cho bạn, có thể gồm có tiết lộ dữ liệu cá nhân nhất định về bạn để cung cấp các tài liệu đó cũng như trên bao bì/phong bì;</li>
        <li>Để cho phép các người dùng khác tương tác hoặc liên lạc với bạn hoặc thấy một số hoạt động của bạn trên Nền tảng, bao gồm để thông báo cho bạn khi một người dùng khác đã gửi cho bạn một tin nhắn riêng tư hoặc đăng nhận xét về bạn trên Nền tảng hoặc để liên kết với việc bạn sử dụng các tính năng xã hội trên Nền tảng;</li>
        <li>Để tiến hành các hoạt động nghiên cứu, phân tích và phát triển (bao gồm nhưng không giới hạn phân tích dữ liệu, khảo sát, phát triển và/hoặc lập đặc tính sản phẩm và dịch vụ), để phân tích cách thức bạn sử dụng Dịch vụ của chúng tôi, để giới thiệu sản phẩm và/hoặc dịch vụ theo sự quan tâm của bạn, để cải thiện Dịch vụ hoặc sản phẩm của chúng tôi và/hoặc để cải thiện trải nghiệm khách hàng của bạn;</li>
        <li>Để gửi các thông báo hoặc thông tin mà chúng tôi cho rằng cần thiết hoặc bạn sẽ quan tâm bao gồm nhưng không giới hạn những thông tin về dịch vụ, chương trình ưu đãi và các gợi ý về tính năng, trừ khi bạn từ chối nhận những thông báo hoặc thông tin này;</li>
        <li>Để cho phép kiểm tra và khảo sát khác để xác thực quy mô và thành phần của đối tượng mục tiêu của chúng tôi, và hiểu được trải nghiệm của họ với Dịch vụ của NhaTroVN;</li>
        <li>Để tiến hành các hoạt động nghiên cứu tiếp thị hoặc mục đích tiếp thị, trong trường hợp này, để gửi cho bạn qua các phương tiện và phương thức liên lạc khác nhau, thông tin và tài liệu tiếp thị và quảng bá liên quan đến các sản phẩm và/hoặc dịch vụ (bao gồm, nhưng không giới hạn các sản phẩm và/hoặc dịch vụ của các bên thứ ba mà NhaTroVN có thể hợp tác hoặc liên kết) mà NhaTroVN (và/hoặc các bên liên kết hoặc công ty có liên quan của nó) có thể bán, tiếp thị hoặc quảng bá, cho dù các sản phẩm hoặc dịch vụ đó tồn tại vào lúc này hoặc được tạo ra trong tương lai. Bạn có thể hủy đăng ký nhận các thông tin tiếp thị tại bất cứ thời điểm nào bằng cách sử dụng chức năng hủy đăng ký trong các tài liệu tiếp thị điện tử. Chúng tôi có thể sử dụng các thông tin liên hệ của bạn để gửi các bản tin và/hoặc tài liệu truyền thông từ chúng tôi hoặc từ các công ty có liên quan của chúng tôi;</li>
        <li>Để cung cấp các chương trình và ưu đãi khách hàng thường xuyên, đối tác và tiền thưởng, cũng như các chiến dịch marketing đồng thương hiệu khác, ví dụ như: chương trình khách hàng thân thiết của người bán, ưu đãi của người bán hoặc thẻ tín dụng đồng thương hiệu với sự hợp tác của các bên thứ ba;</li>
        <li>Để đáp ứng các thủ tục pháp lý hoặc để tuân thủ hoặc theo quy định của pháp luật hiện hành, và các yêu cầu của cơ quan nhà nước có thẩm quyền hoặc yêu cầu của bất cứ cơ quan tài phán nào hoặc khi chúng tôi thực sự tin tưởng rằng việc tiết lộ thông tin là cần thiết, bao gồm nhưng không giới hạn, đáp ứng các yêu cầu công bố thông tin theo yêu cầu của bất kỳ luật ràng buộc nào đối với NhaTroVN hoặc các công ty hoặc chi nhánh liên quan của NhaTroVN (bao gồm, nếu có, việc hiển thị tên, chi tiết liên hệ và chi tiết công ty của bạn);</li>
        <li>Để lập số liệu thống kê và nghiên cứu đáp ứng yêu cầu báo cáo và/hoặc duy trì sổ sách nội bộ hoặc theo quy định;</li>
        <li>Để thực hiện quy trình tìm hiểu và xác minh hoặc các hoạt động sàng lọc khác (bao gồm nhưng không giới hạn kiểm tra lý lịch) tuân thủ các nghĩa vụ theo quy định pháp luật hoặc cơ quan nhà nước có thẩm quyền hoặc các thủ tục kiểm soát rủi ro của chúng tôi, có thể được pháp luật yêu cầu hoặc có thể đã được chúng tôi áp dụng;</li>
        <li>Để kiểm tra Dịch vụ của chúng tôi;</li>
        <li>Để ngăn chặn hoặc điều tra bất kỳ hoạt động gian lận thực tế hoặc bị nghi ngờ nào đối với Điều khoản sử dụng dịch vụ của chúng tôi, gian lận, các hành vi phi pháp, thiếu sót hay hành vi sai trái nào, cho dù có liên quan đến việc bạn sử dụng Dịch vụ của chúng tôi hay không hay bất kỳ vấn đề nào phát sinh từ quan hệ của bạn với chúng tôi;</li>
        <li>Để đáp ứng bất cứ các mối đe dọa hoặc yêu cầu thực tế nào được khẳng định chống lại NhaTroVN hoặc các yêu cầu khác liên quan đến các Nội dung vi phạm quy định của các bên thứ ba;</li>
        <li>Để lưu trữ, lập máy chủ, sao lưu (cho dù là vì mục đích khôi phục sau thảm họa hoặc mục đích khác) đối với dữ liệu cá nhân của bạn;</li>
        <li>Để xử lý và/hoặc tạo thuận tiện cho một giao dịch tài sản kinh doanh hoặc một giao dịch tài sản kinh doanh tiềm năng, trường hợp giao dịch đó liên quan đến NhaTroVN như một bên tham gia hoặc chỉ liên quan đến một công ty hay công ty liên kết của NhaTroVN như một bên tham gia hoặc liên quan đến NhaTroVN và/hoặc bất kỳ một hay nhiều công ty hoặc công ty liên kết của NhaTroVN như (các) bên tham gia, và có thể có các tổ chức bên thứ ba khác tham gia giao dịch như thế;</li>
        <li>Để nghiên cứu và phân tích thông tin nhân khẩu học;</li>
        <li>Để gửi các thông báo mà chúng tôi cho rằng cần thiết hoặc bạn sẽ quan tâm, trừ khi bạn từ chối nhận những thông báo này;</li>
        <li>Để vận hành, phân tích và đánh giá giúp cải thiện và nâng cấp Dịch vụ của chúng tôi;</li>
        <li>Việc lưu trữ lịch sử hội thoại được chúng tôi thực hiện trong một khoảng thời gian nhất định phù hợp với quy định pháp luật tùy từng thời điểm để phục vụ cho việc quản lý nội dung và cải thiện trải nghiệm của người dùng;</li>
        <li>Và bất kỳ mục đích nào mà chúng tôi thông báo cho bạn tại thời điểm xin sự cho phép của bạn.</li>
      </ul>
      <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">3. Các trường hợp chia sẻ thông tin cá nhân</h2>
      <p className="text-gray-700 mb-4">
        Ngoài các thông tin khác được mô tả trong Chính sách này, chúng tôi có thể thu thập và chia sẻ các thông tin của bạn cho bên thứ ba dưới dạng ẩn danh. Các bên thứ ba sẽ chỉ được sử dụng để thu thập, cung cấp thông tin của bạn cho chúng tôi, và sử dụng dữ liệu của bạn dưới sự cho phép của chúng tôi trong phạm vi cần thiết.
      </p>
      <ul className="list-disc list-inside ml-6 mb-4 text-gray-700">
        <li>Các đối tác cung cấp các dịch vụ xử lý, phân tích dữ liệu mà chúng tôi thuê để phục vụ cho hoạt động kinh doanh của chúng tôi;</li>
        <li>Các đối tác cung cấp các dịch vụ liên quan đến việc gửi nhận thông báo (bằng SMS, email, cuộc gọi) đến bạn;</li>
        <li>Các đối tác trong hoạt động marketing;</li>
        <li>Các đơn vị được chỉ định bởi cơ quan pháp luật Việt Nam;</li>
        <li>Các đơn vị được chúng tôi yêu cầu để bảo vệ an toàn và an ninh cho Dịch vụ;</li>
        <li>Các chi nhánh và/hoặc công ty liên kết của chúng tôi;</li>
        <li>Và/hoặc các đối tác khác mà chúng tôi tiết lộ vì một trong mục đích thu thập thông tin cá nhân và các bên thứ ba đó ngược lại họ sẽ thu thập và xử lý thông tin cá nhân của bạn vì một hoặc nhiều mục đích được đề cập trong Chính sách này.</li>
      </ul>
      <p className="text-gray-700 mb-4">
        Ngoài ra, khi có yêu cầu của cơ quan nhà nước có thẩm quyền theo quy định pháp luật, chúng tôi có thể chia sẻ thông tin của bạn nếu là hành động cần thiết để tuân thủ theo yêu cầu của các cơ quan đó.
      </p>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">4. Cookies</h2>
        <p className="text-gray-700 mb-4">
          Chúng tôi có thể sử dụng “Cookies” hoặc các tính năng khác để cho phép chúng tôi hoặc bên thứ ba thu thập hoặc chia sẻ thông tin cá nhân của bạn, giúp chúng tôi cải thiện Nền tảng của mình và Dịch vụ do chúng tôi cung cấp.
        </p>
        <p className="text-gray-700 mb-4">
          Chúng tôi có thể sử dụng cookie để bạn không phải nhập thông tin đăng nhập của mình cho mỗi lần vào Nền tảng. Thông tin duy nhất mà cookie có thể chứa là thông tin mà chính người dùng cung cấp. Một tập cookie không thể đọc dữ liệu bên ngoài ổ cứng của người dùng hoặc đọc các tập cookie được tạo ra bởi các trang web khác.
        </p>
        <p className="text-gray-700 mb-4">
          Khi truy cập và sử dụng Nền tảng, bạn đồng ý cho chúng tôi sử dụng Cookie để lưu trữ thông tin trên thiết bị của bạn.
        </p>
        <p className="text-gray-700 mb-4">
          Bạn có thể quản lý và xóa cookies thông qua cài đặt trình duyệt hoặc thiết bị của bạn. Tuy nhiên, vui lòng lưu ý rằng nếu bạn thực hiện thao tác này, bạn có thể không sử dụng được các chức năng đầy đủ của Nền tảng hoặc các Dịch vụ của chúng tôi.
        </p>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">5. Truy cập, điều chỉnh thông tin cá nhân</h2>
        <ul className="list-disc list-inside ml-6 mb-4 text-gray-700">
          <li>Bạn có thể xem và thay đổi các thông tin cá nhân của mình tại trang Hồ sơ cá nhân.</li>
          <li>Bạn có thể yêu cầu truy cập các thông tin khác chúng tôi thu thập từ bạn, bằng cách liên hệ với chúng tôi qua email được công bố ở dưới.</li>
          <li>Bạn có thể yêu cầu chấm dứt việc sử dụng thông tin cá nhân bằng cách liên hệ với chúng tôi qua email được công bố ở dưới.</li>
          <li>Bạn có thể xóa lịch sử hội thoại trong chức năng Chat trên Nền tảng.</li>
          <li>Chúng tôi có thể từ chối bạn yêu cầu truy cập thông tin cá nhân nếu:
            <ul className="list-disc list-inside ml-6">
              <li>Thông tin chỉ dùng với mục đích phân tích và đánh giá.</li>
              <li>Thông tin sử dụng cho mục đích giải quyết tranh chấp (ví dụ: thông tin cá nhân của người khác/đối tượng tranh chấp).</li>
              <li>Thông tin tổn hại đến hoạt động thương mại & cạnh tranh của chúng tôi.</li>
              <li>Chi phí, công sức cho việc cung cấp dữ liệu này không tương xứng với lợi ích nhận được của chúng tôi hoặc của bạn.</li>
            </ul>
          </li>
          <li>Chúng tôi có quyền xác định thông tin nào nằm trong phạm vi có thể từ chối.</li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">6. Các phương thức bảo vệ thông tin cá nhân</h2>
        <ul className="list-disc list-inside ml-6 mb-4 text-gray-700">
          <li>Chúng tôi đảm bảo rằng mọi thông tin thu thập được sẽ được lưu giữ an toàn, bằng các phương thức sau:
            <ul className="list-disc list-inside ml-6">
              <li>Giới hạn truy cập thông tin cá nhân bằng việc Đăng ký tài khoản.</li>
              <li>Sử dụng sản phẩm công nghệ để ngăn chặn truy cập máy tính trái phép.</li>
              <li>Xóa thông tin cá nhân của quý khách khi nó không còn cần thiết cho mục đích lưu trữ hồ sơ của chúng tôi.</li>
            </ul>
          </li>
          <li>Chúng tôi sử dụng công nghệ mã hóa theo giao thức 128-bit SSL (secure sockets layer) khi xử lý tài khoản của bạn.</li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">7. Lưu giữ thông tin cá nhân</h2>
        <p className="text-gray-700 mb-4">
          Chúng tôi sẽ chỉ lưu giữ thông tin cá nhân của bạn trong thời gian do pháp luật yêu cầu hoặc cho đến khi mục đích thu thập thông tin đó vẫn còn theo Chính sách này.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">8. Thay đổi Chính sách bảo mật</h2>
        <p className="text-gray-700 mb-4">
          Chúng tôi có quyền thay đổi, cập nhật Chính sách này bất kỳ lúc nào miễn là các cập nhật, thay đổi này không trái với quy định của pháp luật hiện hành. Việc thay đổi, cập nhật này sẽ được thông báo đến tất cả người dùng trên Nền tảng của chúng tôi.
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-4">Các bài liên quan khác của PhongtroVN</h2>

      <div className="border-t pt-4">
        <div className="mb-2">
          <Link href="/about" className="hover:text-blue-600 transition-colors">
            Giới thiệu
          </Link>
        </div>
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
      </div>
    </div>
  );
}

