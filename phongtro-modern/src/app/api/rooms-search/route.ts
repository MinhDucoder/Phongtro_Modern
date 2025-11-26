import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000/api/v1";

// Trích xuất khoảng giá (triệu) + quận + tiện ích từ câu tự nhiên
function parseQuery(q: string) {
  const text = (q || "").toLowerCase().replace(/\s+/g, " ").trim();

  // Giá: "2-3 triệu", "khoảng 2 đến 3tr", "dưới 3tr", "< 3 triệu", "trên 2.5tr", "3tr5"...
  let priceMinTriệu: number | undefined;
  let priceMaxTriệu: number | undefined;

  const range = text.match(/(\d+(?:[\.,]\d+)?)\s*(?:-|đến|to)\s*(\d+(?:[\.,]\d+)?)\s*(?:tr|triệu)/i);
  if (range) {
    priceMinTriệu = parseFloat(range[1].replace(",", "."));
    priceMaxTriệu = parseFloat(range[2].replace(",", "."));
  } else {
    const below = text.match(/(?:dưới|<=|<)\s*(\d+(?:[\.,]\d+)?)\s*(?:tr|triệu)/i);
    const above = text.match(/(?:trên|>=|>)\s*(\d+(?:[\.,]\d+)?)\s*(?:tr|triệu)/i);
    const single = text.match(/(\d+(?:[\.,]\d+)?)\s*(?:tr|triệu)/i);
    if (below) {
      priceMaxTriệu = parseFloat(below[1].replace(",", "."));
    } else if (above) {
      priceMinTriệu = parseFloat(above[1].replace(",", "."));
    } else if (single) {
      const val = parseFloat(single[1].replace(",", "."));
      priceMinTriệu = val * 0.9; // +-10% biên
      priceMaxTriệu = val * 1.1;
    }
  }

  const priceMinVnd = typeof priceMinTriệu === "number" ? Math.round(priceMinTriệu * 1_000_000) : undefined;
  const priceMaxVnd = typeof priceMaxTriệu === "number" ? Math.round(priceMaxTriệu * 1_000_000) : undefined;

  // Quận
  const districts = [
    "Đống Đa", "Cầu Giấy", "Bắc Từ Liêm", "Nam Từ Liêm", "Thanh Xuân", "Hai Bà Trưng",
    "Hoàng Mai", "Ba Đình", "Tây Hồ", "Long Biên", "Hà Đông", "Hoàn Kiếm"
  ];
  const found = districts.find((d) => new RegExp(d.replace(/\s+/g, "\\s*"), "i").test(q));
  const district = found || undefined;
  const province = found ? "Hà Nội" : undefined; // Nếu bắt được quận thuộc Hà Nội thì gán province

  // Tiện ích cơ bản
  const amenityPatterns: Record<string, RegExp> = {
    dieuHoa: /(điều\s*hòa|máy\s*lạnh)/i,
    nongLanh: /(nóng\s*lạnh|bình\s*nóng)/i,
    banCong: /(ban\s*công)/i,
    thangMay: /(thang\s*máy)/i,
    khepKin: /(khép\s*kín|khép\s*kin)/i,
    noiThat: /(đầy\s*đủ\s*nội\s*thất|full\s*nội\s*thất|đồ\s*đạc)/i,
    mayGiat: /(máy\s*giặt)/i,
    bep: /(bếp|nấu\s*ăn)/i,
    deXe: /(để\s*xe|chỗ\s*để\s*xe|gara)/i,
    wifi: /(wifi|internet)/i,
  };
  const amenities = Object.keys(amenityPatterns).filter((k) => amenityPatterns[k].test(q));

  return { priceMinVnd, priceMaxVnd, district, amenities, province };
}

// Rút gọn câu người dùng thành keyword ngắn gọn cho BE (ví dụ: "đống đa")
function extractKeyword(raw: string): string {
  const t = (raw || "").toLowerCase();
  // loại bỏ các từ dừng thường gặp, bao gồm cả dấu gạch ngang
  const stop = /(tìm|tim|thuê|thue|phòng|phong|trọ|tro|nhà|nha|ở|o|cần|can|giá|gia|khoảng|khoang|triệu|tr|\d+[\.,]?\d*|\d+|[-–,])/gi;
  const cleaned = t.replace(stop, " ").replace(/\s+/g, " ").trim();
  // ưu tiên giữ lại cụm có dấu phẩy, quận/huyện
  if (cleaned.length >= 2) return cleaned;
  return (raw || "").trim();
}

// Suy ra priceRange slug giống frontend/backend từ câu tự nhiên
function derivePriceRangeSlugFromText(raw: string): string | undefined {
  const t = (raw || "").toLowerCase().replace(/\s+/g, " ");
  // Mẫu dạng 3-5 triệu
  const m = t.match(/(\d+(?:[\.,]\d+)?)\s*(?:-|đến|to)\s*(\d+(?:[\.,]\d+)?)\s*(?:tr|triệu)/i);
  const toNum = (s: string) => parseFloat(s.replace(",", "."));
  const buckets: { slug: string; min: number; max: number }[] = [
    { slug: 'duoi-1-trieu', min: 0, max: 1 },
    { slug: '1-2-trieu', min: 1, max: 2 },
    { slug: '2-3-trieu', min: 2, max: 3 },
    { slug: '3-5-trieu', min: 3, max: 5 },
    { slug: '5-7-trieu', min: 5, max: 7 },
    { slug: '7-10-trieu', min: 7, max: 10 },
    { slug: '10-15-trieu', min: 10, max: 15 },
    { slug: 'tren-15-trieu', min: 15, max: 999 },
  ];
  if (m) {
    const a = toNum(m[1]);
    const b = toNum(m[2]);
    const mid = (a + b) / 2;
    const found = buckets.find(bk => mid >= bk.min && mid <= bk.max);
    return found?.slug;
  }
  const single = t.match(/(dưới|duoi|<=|<)\s*(\d+(?:[\.,]\d+)?)\s*(?:tr|triệu)/i)
    || t.match(/(trên|tren|>=|>)\s*(\d+(?:[\.,]\d+)?)\s*(?:tr|triệu)/i)
    || t.match(/(\d+(?:[\.,]\d+)?)\s*(?:tr|triệu)/i);
  if (single) {
    const val = toNum(single[single.length - 1]);
    const found = buckets.find(bk => val >= bk.min && val <= bk.max) || (val > 15 ? buckets[buckets.length - 1] : buckets[0]);
    return found?.slug;
  }
  return undefined;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  let keyword = extractKeyword(q);

  if (!q) {
    return NextResponse.json({ items: [], note: "Thiếu từ khóa tìm kiếm" }, { status: 400 });
  }

  // Helper: chuẩn hoá item
  const toItems = (posts: any[]) => posts.map((p: any) => {
    const id = String(p?._id || p?.id || "");
    const title = String(p?.title || p?.roomId?.title || "Tin đăng");
    const price = Number(p?.price || p?.roomId?.price || 0) || null;
    const district = typeof p?.district === "string" ? p.district : (typeof p?.roomId?.address === "string" ? p.roomId.address.split(",").slice(-2, -1)[0]?.trim() : undefined);
    const thumbnail = Array.isArray(p?.images) && p.images[0]
      ? p.images[0]
      : (Array.isArray(p?.roomId?.images) && p.roomId.images[0] ? p.roomId.images[0] : "/placeholder.png");
    const href = `/phong-tro/${id}`;
    return { id, title, price, district, thumbnail, href };
  });

  try {
    const { priceMinVnd, priceMaxVnd, district, amenities, province } = parseQuery(q);

    // Fix: Nếu keyword trùng với district, bỏ keyword để tránh search Title quá chặt
    if (district && keyword.toLowerCase() === district.toLowerCase()) {
      keyword = "";
    }

    // Tạo priceRange slug cho URL frontend
    let priceRangeSlug = derivePriceRangeSlugFromText(q);
    if (!priceRangeSlug) {
      const mid = typeof priceMinVnd === 'number' && typeof priceMaxVnd === 'number'
        ? (priceMinVnd + priceMaxVnd) / 2 / 1_000_000
        : typeof priceMinVnd === 'number' ? priceMinVnd / 1_000_000
          : typeof priceMaxVnd === 'number' ? priceMaxVnd / 1_000_000
            : undefined;
      if (typeof mid === 'number') {
        if (mid <= 1) priceRangeSlug = 'duoi-1-trieu';
        else if (mid <= 2) priceRangeSlug = '1-2-trieu';
        else if (mid <= 3) priceRangeSlug = '2-3-trieu';
        else if (mid <= 5) priceRangeSlug = '3-5-trieu';
        else if (mid <= 7) priceRangeSlug = '5-7-trieu';
        else if (mid <= 10) priceRangeSlug = '7-10-trieu';
        else if (mid <= 15) priceRangeSlug = '10-15-trieu';
        else priceRangeSlug = 'tren-15-trieu';
      }
    }

    // Gọi API /posts
    const backendUrl = `${API_BASE_URL}/posts?limit=20`
      + (keyword ? `&q=${encodeURIComponent(keyword)}` : "")
      + (priceRangeSlug ? `&priceRange=${encodeURIComponent(priceRangeSlug)}` : "")
      + (district ? `&district=${encodeURIComponent(district)}` : "")
      + (province ? `&province=${encodeURIComponent(province)}` : "");

    console.log("DEBUG: Calling backend:", backendUrl);

    const res = await fetch(backendUrl, { method: "GET" });

    if (!res.ok) {
      console.error("DEBUG: Backend error:", res.status, res.statusText);
      return NextResponse.json({ items: [], note: `Lỗi backend: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    const ok = (data && typeof data === 'object' && (data as any).success === true);
    const posts = ok ? (data as any).data?.items : (Array.isArray((data as any)?.items) ? (data as any).items : []);
    const items = toItems(Array.isArray(posts) ? posts : []).slice(0, 6);

    if (items.length) {
      return NextResponse.json({
        note: `Kết quả theo từ khóa: “${keyword || q}”`,
        items: items,
        meta: {
          moreUrl: priceRangeSlug
            ? `/?keyword=${encodeURIComponent(district || keyword || q)}&priceRange=${encodeURIComponent(priceRangeSlug)}`
            : `/?keyword=${encodeURIComponent(district || keyword || q)}`,
          primary: items[0]
        },
      });
    }

    return NextResponse.json({
      items: [],
      note: `Không thấy kết quả cho: “${q}”`,
      debug: { backendUrl, keyword, district, priceRangeSlug, province, API_BASE_URL }
    }, { status: 404 });

  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error("DEBUG: Route error:", msg);
    return NextResponse.json({ items: [], note: msg }, { status: 500 });
  }
}
