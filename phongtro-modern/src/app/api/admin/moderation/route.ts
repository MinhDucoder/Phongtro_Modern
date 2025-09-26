import { NextRequest, NextResponse } from 'next/server';

// Các hàm chung
const errorResponse = (message = 'Có lỗi xảy ra', status = 500) => {
  return NextResponse.json({ success: false, message }, { status });
};

// Mock data để sử dụng khi API backend không tồn tại
function provideMockData(page = 1, limit = 10, status?: string | null) {
  // Mẫu dữ liệu
  const mockPosts = [
    {
      id: '1',
      title: 'PHÒNG TRỌ CHO THUÊ GẦN ĐẠI HỌC BÁCH KHOA',
      author: 'Nguyễn Văn A',
      authorId: 'user1',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      category: 'Phòng trọ',
      location: 'Hai Bà Trưng, Hà Nội',
      price: '3.5 triệu/tháng',
      description: 'Phòng trọ sạch sẽ, thoáng mát, có điều hòa, nóng lạnh, giờ giấc tự do...',
      images: [
        'https://phongtro123.com/images/place1.jpg',
        'https://phongtro123.com/images/place2.jpg',
      ],
    },
    {
      id: '2',
      title: 'CHO THUÊ CĂN HỘ CHUNG CƯ MINI QUẬN 1',
      author: 'Trần Thị B',
      authorId: 'user2',
      status: 'approved',
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      category: 'Căn hộ',
      location: 'Quận 1, TP HCM',
      price: '8 triệu/tháng',
      description: 'Căn hộ chung cư mini đầy đủ nội thất, an ninh 24/7, khu vực trung tâm...',
      images: [
        'https://phongtro123.com/images/apartment1.jpg',
        'https://phongtro123.com/images/apartment2.jpg',
      ],
    },
    {
      id: '3',
      title: 'NHÀ NGUYÊN CĂN CHO THUÊ ĐƯỜNG LÊ VĂN SỸ',
      author: 'Lê Văn C',
      authorId: 'user3',
      status: 'rejected',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Nhà nguyên căn',
      location: 'Quận 3, TP HCM',
      price: '15 triệu/tháng',
      description: 'Nhà 1 trệt 1 lầu, diện tích 80m2, có gara ô tô, khu dân cư an ninh...',
      reason: 'Thông tin không chính xác',
      images: [
        'https://phongtro123.com/images/house1.jpg',
        'https://phongtro123.com/images/house2.jpg',
      ],
    },
    {
      id: '4',
      title: 'CHO THUÊ MẶT BẰNG KINH DOANH',
      author: 'Phạm Thị D',
      authorId: 'user4',
      status: 'pending',
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Mặt bằng',
      location: 'Cầu Giấy, Hà Nội',
      price: '20 triệu/tháng',
      description: 'Mặt tiền 5m, vị trí đẹp, khu vực đông dân cư, thích hợp kinh doanh...',
      images: [
        'https://phongtro123.com/images/space1.jpg',
        'https://phongtro123.com/images/space2.jpg',
      ],
    },
    {
      id: '5',
      title: 'PHÒNG TRỌ CHO SINH VIÊN GẦN TRƯỜNG ĐẠI HỌC',
      author: 'Vũ Văn E',
      authorId: 'user5',
      status: 'approved',
      submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Phòng trọ',
      location: 'Thủ Đức, TP HCM',
      price: '2.8 triệu/tháng',
      description: 'Phòng trọ dành cho sinh viên, giá rẻ, có máy lạnh, tủ lạnh, máy giặt chung...',
      images: [
        'https://phongtro123.com/images/student1.jpg',
        'https://phongtro123.com/images/student2.jpg',
      ],
    },
  ];
  
  // Lọc theo trạng thái nếu có
  let filteredPosts = mockPosts;
  if (status && status !== 'all') {
    filteredPosts = mockPosts.filter(post => post.status === status);
  }
  
  // Phân trang
  const total = filteredPosts.length;
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(total / limit);
  
  // Thống kê
  const statistics = {
    total: mockPosts.length,
    pending: mockPosts.filter(post => post.status === 'pending').length,
    approved: mockPosts.filter(post => post.status === 'approved').length,
    rejected: mockPosts.filter(post => post.status === 'rejected').length,
  };
  
  return NextResponse.json({
    success: true,
    data: {
      posts: paginatedPosts,
      pagination: {
        page,
        totalPages,
        limit,
        total
      },
      statistics
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    // Lấy token từ cookies
    const token = request.cookies.get('accessToken')?.value;
    
    // Kiểm tra xác thực
    if (!token) {
      return errorResponse('Vui lòng đăng nhập', 401);
    }
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    try {
      // Xây dựng query params
      const apiParams = new URLSearchParams();
      apiParams.append('page', page.toString());
      apiParams.append('limit', limit.toString());
      
      if (status && status !== 'all') {
        apiParams.append('status', status === 'pending' ? 'pending' : 
                                 status === 'approved' ? 'active' : 
                                 status === 'rejected' ? 'rejected' : status);
      }
      
      if (search) {
        apiParams.append('search', search);
      }
      
      // Gọi API từ backend
      const response = await fetch(`http://localhost:5000/api/v1/admin/moderation/queue?${apiParams.toString()}`, {
        headers: {
          'Cookie': `accessToken=${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error(`[Admin API] Error from backend API:`, {
          status: response.status,
          statusText: response.statusText
        });
        
        // Sử dụng mock data khi API thất bại
        console.warn(`[Admin API] Using mock response because API request failed`);
        return provideMockData(page, limit, status);
      }
      
      const data = await response.json();
      
      // Định nghĩa interface cho item từ backend
      interface BackendPost {
        _id: string;
        status: string;
        createdAt: string;
        rejectionReason?: string;
        roomId?: {
          title?: string;
          category?: string;
          address?: string;
          price?: number;
          description?: string;
          images?: string[];
        };
        landlord?: {
          _id?: string;
          full_name?: string;
        };
      }
      
      // Chuyển đổi dữ liệu từ backend sang định dạng frontend
      const formattedPosts = data.data.items.map((item: BackendPost) => ({
        id: item._id,
        title: item.roomId?.title || 'Không có tiêu đề',
        author: item.landlord?.full_name || 'Chưa có tên',
        authorId: item.landlord?._id || '',
        status: item.status === 'active' ? 'approved' : item.status,
        submittedAt: item.createdAt,
        category: item.roomId?.category || 'Không phân loại',
        location: item.roomId?.address || 'Chưa cập nhật địa chỉ',
        price: item.roomId?.price ? `${(item.roomId.price/1000000).toFixed(1)} triệu/tháng` : 'Chưa cập nhật',
        description: item.roomId?.description || 'Không có mô tả',
        reason: item.rejectionReason,
        images: item.roomId?.images || [],
      }));
      
      // Thống kê
      const statistics = {
        total: data.data.pagination.totalItems,
        pending: data.data.items.filter((item: BackendPost) => item.status === 'pending').length,
        approved: data.data.items.filter((item: BackendPost) => item.status === 'active').length,
        rejected: data.data.items.filter((item: BackendPost) => item.status === 'rejected').length,
      };
      
      return NextResponse.json({
        success: true,
        data: {
          posts: formattedPosts,
          pagination: {
            page: data.data.pagination.currentPage,
            totalPages: data.data.pagination.totalPages,
            limit: data.data.pagination.limit,
            total: data.data.pagination.totalItems
          },
          statistics
        }
      });
      
    } catch (error) {
      console.error(`[Admin API] Exception during fetch:`, error);
      // Trả về mock data khi có lỗi
      return provideMockData(page, limit, status);
    }
    
  } catch (error) {
    console.error('Error in moderation API:', error);
    return errorResponse('Lỗi khi tải dữ liệu kiểm duyệt');
  }
}