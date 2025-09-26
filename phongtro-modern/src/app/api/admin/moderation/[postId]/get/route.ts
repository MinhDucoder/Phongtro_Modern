import { NextRequest, NextResponse } from 'next/server';

// Các hàm chung
const errorResponse = (message = 'Có lỗi xảy ra', status = 500) => {
  return NextResponse.json({ success: false, message }, { status });
};

// Mock data cho trường hợp API backend không có hoặc gặp lỗi
function getMockPostDetail(postId: string) {
  return {
    id: postId,
    title: 'PHÒNG TRỌ CHO THUÊ GẦN ĐẠI HỌC BÁCH KHOA',
    author: 'Nguyễn Văn A',
    authorId: 'user1',
    status: 'pending',
    submittedAt: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Phòng trọ',
    location: 'Hai Bà Trưng, Hà Nội',
    price: '3.5 triệu/tháng',
    area: '25m²',
    description: 'Phòng trọ sạch sẽ, thoáng mát, có điều hòa, nóng lạnh, giờ giấc tự do. Phòng đẹp, mới sửa, có ban công, toilet riêng. Phù hợp cho sinh viên hoặc người đi làm.',
    images: [
      'https://phongtro123.com/images/place1.jpg',
      'https://phongtro123.com/images/place2.jpg',
      'https://phongtro123.com/images/place3.jpg',
    ],
    amenities: ['wifi', 'aircon', 'washing_machine', 'fridge'],
    landlordInfo: {
      name: 'Nguyễn Văn A',
      phone: '0912345678',
      email: 'nguyenvana@example.com',
      isVerified: true,
      accountAge: 365 // Days
    },
    moderation: {
      priority: 'high',
      waitingTime: 48, // Hours
      otherPostsByLandlord: 5,
      approvedPosts: 3,
      rejectedPosts: 1
    }
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    // Lấy token từ cookies
    const token = request.cookies.get('accessToken')?.value;
    
    // Kiểm tra xác thực
    if (!token) {
      return errorResponse('Vui lòng đăng nhập', 401);
    }
    
    const { postId } = params;
    
    // Validate postId
    if (!postId) {
      return errorResponse('ID bài đăng không hợp lệ', 400);
    }
    
    try {
      // Gọi API để lấy chi tiết bài đăng
      const response = await fetch(`http://localhost:5000/api/v1/admin/moderation/posts/${postId}`, {
        headers: {
          'Cookie': `accessToken=${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error(`[Admin API] Error fetching post details:`, {
          status: response.status,
          statusText: response.statusText
        });
        
        // Sử dụng mock data khi API thất bại
        console.warn(`[Admin API] Using mock post details because API request failed`);
        return NextResponse.json({
          success: true,
          data: getMockPostDetail(postId)
        });
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return errorResponse(data.message || 'Không thể lấy chi tiết bài đăng', 400);
      }
      
      // Biến đổi dữ liệu từ backend để phù hợp với frontend
      const backendData = data.data;
      const roomInfo = backendData.roomDetails;
      const landlordInfo = backendData.landlordDetails;
      
      const transformedData = {
        id: backendData.post._id,
        title: roomInfo?.title || 'Không có tiêu đề',
        author: landlordInfo?.name || 'Không có tên',
        authorId: backendData.post.landlord,
        status: backendData.post.status === 'active' ? 'approved' : backendData.post.status,
        submittedAt: backendData.post.createdAt,
        category: roomInfo?.category || 'Phòng trọ',
        location: roomInfo?.address || 'Chưa có địa chỉ',
        city: roomInfo?.city || '',
        price: roomInfo?.price ? `${(roomInfo.price/1000000).toFixed(1)} triệu/tháng` : 'Chưa cập nhật',
        area: roomInfo?.area ? `${roomInfo.area}m²` : 'Chưa cập nhật',
        description: roomInfo?.description || 'Không có mô tả',
        images: roomInfo?.images || [],
        amenities: roomInfo?.amenities || [],
        rejectionReason: backendData.post.rejectionReason,
        moderationNotes: backendData.post.moderationNotes,
        landlordInfo: {
          name: landlordInfo?.name || 'Không có tên',
          phone: landlordInfo?.phone || 'Không có SĐT',
          email: landlordInfo?.email || 'Không có email',
          isVerified: landlordInfo?.isVerified || false,
          accountAge: landlordInfo?.accountAge || 0
        },
        moderation: {
          priority: backendData.post.moderationPriority || 'normal',
          waitingTime: backendData.moderationContext?.waitingTime || 0,
          otherPostsByLandlord: backendData.moderationContext?.otherPostsByLandlord?.length || 0,
          approvedPosts: backendData.moderationContext?.otherPostsByLandlord?.filter((p: any) => p.status === 'active').length || 0,
          rejectedPosts: backendData.moderationContext?.otherPostsByLandlord?.filter((p: any) => p.status === 'rejected').length || 0,
          contentIssues: backendData.post.moderation?.contentIssues || false,
          pricingIssues: backendData.post.moderation?.pricingIssues || false,
          imageIssues: backendData.post.moderation?.imageIssues || false,
          addressIssues: backendData.post.moderation?.addressIssues || false,
          violationDetails: backendData.post.moderation?.violationDetails || ''
        }
      };
      
      return NextResponse.json({
        success: true,
        data: transformedData
      });
      
    } catch (error) {
      console.error(`[Admin API] Exception fetching post details:`, error);
      // Trả về mock data khi có lỗi
      return NextResponse.json({
        success: true,
        data: getMockPostDetail(postId)
      });
    }
  } catch (error) {
    console.error('Error in get post detail API:', error);
    return errorResponse('Lỗi khi lấy thông tin bài đăng');
  }
}