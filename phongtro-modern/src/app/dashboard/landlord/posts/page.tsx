'use client';

import RoleGuard from '@/components/auth/RoleGuard';
import { useEffect, useMemo, useState } from 'react';
import { dashboardPostsApi } from '@/lib/api';

export default function LandlordPostsPage() {
  return (
    <RoleGuard allowedRoles={["landlord", "admin"]}>
      <Content />
    </RoleGuard>
  );
}

function Content() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await dashboardPostsApi.list({ page, limit });
        if (!mounted) return;
        const data = res.data?.data;
        // service trả về dạng { posts, pagination }
        setItems(data?.posts ?? []);
        setTotal(data?.pagination?.total ?? 0);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || 'Lỗi tải danh sách');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total]);

  const onCreate = () => { setEditing(null); setFormOpen(true); };
  const onEdit = async (id: string) => {
    const res = await dashboardPostsApi.get(id);
    setEditing(res.data?.data || null);
    setFormOpen(true);
  };
  const onDelete = async (id: string) => {
    if (!confirm('Xóa bài đăng này?')) return;
    await dashboardPostsApi.remove(id);
    // reload
    const res = await dashboardPostsApi.list({ page, limit });
    const data = res.data?.data;
    setItems(data?.posts ?? []);
    setTotal(data?.pagination?.total ?? 0);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Quản lý tin</h1>
        <button onClick={onCreate} className="px-3 py-2 rounded border">Tạo tin</button>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Tiêu đề</th>
              <th className="px-4 py-2">Trạng thái</th>
              <th className="px-4 py-2">Views</th>
              <th className="px-4 py-2">Ngày tạo</th>
              <th className="px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-4 py-4" colSpan={6}>Đang tải...</td></tr>}
            {error && !loading && <tr><td className="px-4 py-4 text-red-600" colSpan={6}>{error}</td></tr>}
            {!loading && !error && items.length === 0 && <tr><td className="px-4 py-4" colSpan={6}>Chưa có tin</td></tr>}
            {items.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="px-4 py-2 font-mono text-xs">{p._id}</td>
                <td className="px-4 py-2">{p.roomId?.title || '-'}</td>
                <td className="px-4 py-2">{p.status}</td>
                <td className="px-4 py-2">{p.analytics?.views ?? 0}</td>
                <td className="px-4 py-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => onEdit(p._id)} className="px-2 py-1 rounded border">Sửa</button>
                  <button onClick={() => onDelete(p._id)} className="px-2 py-1 rounded border text-red-600">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 rounded border disabled:opacity-50">Trước</button>
        <div className="text-sm">Trang {page}/{totalPages}</div>
        <button disabled={page>=totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))} className="px-3 py-1 rounded border disabled:opacity-50">Sau</button>
      </div>

      {formOpen && (
        <PostFormModal initial={editing} onClose={() => setFormOpen(false)} onSaved={async () => {
          setFormOpen(false);
          const res = await dashboardPostsApi.list({ page, limit });
          const data = res.data?.data;
          setItems(data?.posts ?? []);
          setTotal(data?.pagination?.total ?? 0);
        }} />
      )}
    </div>
  );
}

function PostFormModal({ initial, onClose, onSaved }: { initial: any | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(initial?.roomId?.title || '');
  const [price, setPrice] = useState<number>(initial?.roomId?.price || 0);
  const [city, setCity] = useState(initial?.roomId?.city || '');
  const [status, setStatus] = useState(initial?.status || 'pending');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        room: { title, price, city },
        status,
      };
      if (initial?._id) {
        await dashboardPostsApi.update(initial._id, payload);
      } else {
        await dashboardPostsApi.create(payload);
      }
      await onSaved();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">{initial ? 'Sửa tin' : 'Tạo tin'}</div>
          <button onClick={onClose}>✕</button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600">Tiêu đề</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Giá</label>
            <input type="number" value={price} onChange={e=>setPrice(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Tỉnh/Thành</label>
            <input value={city} onChange={e=>setCity(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Trạng thái</label>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="pending">Chờ duyệt</option>
              <option value="active">Đang hoạt động</option>
              <option value="paused">Tạm dừng</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Hủy</button>
            <button disabled={loading} className="px-3 py-2 rounded border bg-gray-50 disabled:opacity-50">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}





