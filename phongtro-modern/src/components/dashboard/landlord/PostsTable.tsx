'use client';

import { useMemo, useState } from 'react';
import { useLandlordPosts, LandlordPostRow } from '@/hooks/useLandlordStats';

export default function PostsTable() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { items, total, loading, error } = useLandlordPosts(page, limit);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  return (
    <div className="rounded-lg border">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">Bài đăng của tôi</div>
        <div className="text-sm text-gray-500">Tổng: {total}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Trạng thái</th>
              <th className="px-4 py-2">Ưu tiên</th>
              <th className="px-4 py-2">Views</th>
              <th className="px-4 py-2">Visits</th>
              <th className="px-4 py-2">Ngày tạo</th>
              <th className="px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="px-4 py-4" colSpan={7}>Đang tải...</td></tr>
            )}
            {error && !loading && (
              <tr><td className="px-4 py-4 text-red-600" colSpan={7}>{error}</td></tr>
            )}
            {!loading && !error && items.length === 0 && (
              <tr><td className="px-4 py-4" colSpan={7}>Chưa có bài đăng</td></tr>
            )}
            {items.map((row: LandlordPostRow) => (
              <tr key={row._id} className="border-t">
                <td className="px-4 py-2 font-mono text-xs">{row._id}</td>
                <td className="px-4 py-2">{row.status}</td>
                <td className="px-4 py-2">{row.favouriteLevel || '-'}</td>
                <td className="px-4 py-2">{row.views?.total ?? 0}</td>
                <td className="px-4 py-2">{row.visits?.total ?? 0}</td>
                <td className="px-4 py-2">{new Date(row.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <a className="text-blue-600 hover:underline" href={`/dashboard/landlord?post=${row._id}`}>Xem biểu đồ</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4">
        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded border disabled:opacity-50">Trước</button>
        <div className="text-sm">Trang {page}/{totalPages}</div>
        <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded border disabled:opacity-50">Sau</button>
      </div>
    </div>
  );
}






















