'use client';

import { useMemo, useState } from 'react';
import { usePostTimeseries } from '@/hooks/useLandlordStats';

function LineChart({ width, height, data }: { width: number; height: number; data: Array<{ date: string; views: number; uniqueViews: number }> }) {
  const padding = 24;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const maxY = Math.max(1, ...data.map(d => Math.max(d.views, d.uniqueViews)));

  const pointsViews = data.map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * innerW + padding;
    const y = height - padding - (d.views / maxY) * innerH;
    return `${x},${y}`;
  }).join(' ');

  const pointsUnique = data.map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * innerW + padding;
    const y = height - padding - (d.uniqueViews / maxY) * innerH;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="w-full h-64">
      <rect x={0} y={0} width={width} height={height} fill="white" />
      {/* Axes */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" />
      {/* Lines */}
      <polyline fill="none" stroke="#3b82f6" strokeWidth={2} points={pointsViews} />
      <polyline fill="none" stroke="#10b981" strokeWidth={2} points={pointsUnique} />
    </svg>
  );
}

export default function ViewsVisitsChart({ postId, range = 7 }: { postId: string | null; range?: number }) {
  const [selectedRange, setSelectedRange] = useState(range);
  const { items, loading, error } = usePostTimeseries(postId, selectedRange);

  const sumViews = useMemo(() => items.reduce((s, x) => s + (x.views || 0), 0), [items]);
  const sumUnique = useMemo(() => items.reduce((s, x) => s + (x.uniqueViews || 0), 0), [items]);

  return (
    <div className="rounded-lg border">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">Lượt xem theo ngày</div>
        <div className="flex items-center gap-2">
          <button className={`px-3 py-1 rounded border ${selectedRange===7? 'bg-gray-50':''}`} onClick={() => setSelectedRange(7)}>7 ngày</button>
          <button className={`px-3 py-1 rounded border ${selectedRange===30? 'bg-gray-50':''}`} onClick={() => setSelectedRange(30)}>30 ngày</button>
        </div>
      </div>

      <div className="px-4 pb-4">
        {loading && <div>Đang tải...</div>}
        {error && !loading && <div className="text-red-600">{error}</div>}
        {!loading && !error && items.length > 0 && (
          <LineChart width={640} height={260} data={items} />
        )}
        {!loading && !error && items.length === 0 && (
          <div>Chưa có dữ liệu</div>
        )}
        <div className="text-sm text-gray-500 mt-2">Tổng: Views {sumViews} / Visits {sumUnique}</div>
      </div>
    </div>
  );
}






















