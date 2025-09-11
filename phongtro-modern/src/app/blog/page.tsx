import Link from 'next/link';
import Image from 'next/image';
import { CalendarDaysIcon, UserIcon, EyeIcon } from '@heroicons/react/24/outline';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: Date;
  readTime: number;
  views: number;
  image: string;
  category: string;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 mẹo tìm phòng trọ giá rẻ tại Hà Nội',
    excerpt: 'Hướng dẫn chi tiết cách tìm phòng trọ giá rẻ, an toàn và phù hợp với ngân sách của bạn.',
    content: 'Nội dung chi tiết...',
    author: 'Admin',
    publishedAt: new Date(2024, 0, 15),
    readTime: 5,
    views: 1250,
    image: '/placeholder-room.svg',
    category: 'Kinh nghiệm',
    tags: ['phòng trọ', 'giá rẻ', 'hà nội']
  },
  {
    id: '2',
    title: 'Những điều cần biết khi thuê nhà nguyên căn',
    excerpt: 'Checklist đầy đủ các điều kiện và thủ tục cần thiết khi thuê nhà nguyên căn.',
    content: 'Nội dung chi tiết...',
    author: 'Admin',
    publishedAt: new Date(2024, 0, 12),
    readTime: 8,
    views: 980,
    image: '/placeholder-room.svg',
    category: 'Hướng dẫn',
    tags: ['nhà nguyên căn', 'thuê nhà', 'thủ tục']
  },
  {
    id: '3',
    title: 'Xu hướng bất động sản cho thuê 2024',
    excerpt: 'Phân tích xu hướng thị trường bất động sản cho thuê và dự báo cho năm 2024.',
    content: 'Nội dung chi tiết...',
    author: 'Admin',
    publishedAt: new Date(2024, 0, 10),
    readTime: 6,
    views: 2100,
    image: '/placeholder-room.svg',
    category: 'Thị trường',
    tags: ['bất động sản', 'xu hướng', '2024']
  }
];

const categories = [
  { name: 'Tất cả', count: 12 },
  { name: 'Kinh nghiệm', count: 5 },
  { name: 'Hướng dẫn', count: 4 },
  { name: 'Thị trường', count: 3 }
];

export default function BlogPage() {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Phongtro123</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cập nhật tin tức, kinh nghiệm và hướng dẫn về bất động sản cho thuê
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <span className="text-gray-700">{category.name}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bài viết nổi bật</h3>
              <div className="space-y-4">
                {blogPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="flex space-x-3">
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={60}
                      height={40}
                      className="w-15 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(post.publishedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          <span>{post.views}</span>
                        </div>
                        <span>{post.readTime} phút đọc</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={`/blog/${post.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Đọc tiếp →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Trước
                </button>
                <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg">
                  1
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  3
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Sau
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Blog | Phongtro123.com',
  description: 'Cập nhật tin tức, kinh nghiệm và hướng dẫn về bất động sản cho thuê',
  keywords: 'blog bất động sản, kinh nghiệm thuê nhà, tin tức bds, hướng dẫn thuê phòng'
};
