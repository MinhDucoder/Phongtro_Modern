"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

interface Overview {
  activePosts: number;
  availableRooms: number;
  last7Days: { views: number; uniqueViews: number };
  last30Days: { views: number; uniqueViews: number };
}

export function useLandlordOverview() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/v1/landlord/stats/overview", { withCredentials: true });
        if (!mounted) return;
        setData(res.data?.data ?? null);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || "Lỗi tải thống kê");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}

export interface LandlordPostRow {
  _id: string;
  status: string;
  favouriteLevel?: string;
  createdAt: string;
  views?: { total?: number };
  visits?: { total?: number };
}

export function useLandlordPosts(page = 1, limit = 10) {
  const [items, setItems] = useState<LandlordPostRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/v1/landlord/stats/posts?page=${page}&limit=${limit}`, { withCredentials: true });
        if (!mounted) return;
        setItems(res.data?.data?.items ?? []);
        setTotal(res.data?.data?.total ?? 0);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || "Lỗi tải danh sách bài đăng");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, limit]);

  return { items, total, loading, error };
}

export interface TimeseriesPoint { date: string; views: number; uniqueViews: number }

export function usePostTimeseries(postId: string | null, range: number = 7) {
  const [items, setItems] = useState<TimeseriesPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/v1/landlord/stats/post/${postId}/timeseries?range=${range}`, { withCredentials: true });
        if (!mounted) return;
        const raw = (res.data?.data?.items ?? []) as Array<{ date: string; metrics: { views: number; uniqueViews: number } }>;
        const mapped = raw.map(r => ({ date: r.date, views: r.metrics?.views ?? 0, uniqueViews: r.metrics?.uniqueViews ?? 0 }));
        setItems(mapped);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || "Lỗi tải timeseries");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [postId, range]);

  return { items, loading, error };
}


