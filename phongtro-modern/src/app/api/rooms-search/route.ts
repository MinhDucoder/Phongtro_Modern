// app/api/rooms-search/route.ts
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

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
    "Đống Đa","Cầu Giấy","Bắc Từ Liêm","Nam Từ Liêm","Thanh Xuân","Hai Bà Trưng",
    "Hoàng Mai","Ba Đình","Tây Hồ","Long Biên","Hà Đông","Hoàn Kiếm"
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

// Tính điểm khớp tiện ích cho một bài theo danh sách amenities đã bóc tách
function computeAmenityScore(amenities: string[] | undefined, p: any): number {
  if (!amenities?.length) return 0;
  const blob = [p?.title, p?.description, p?.roomId?.title, p?.roomId?.description]
    .filter(Boolean)
    .join(" \n ")
    .toLowerCase();
  let score = 0;
  for (const a of amenities) {
    switch (a) {
      case "dieuHoa": if (/(điều\s*hòa|máy\s*lạnh)/i.test(blob)) score++; break;
      case "nongLanh": if (/(nóng\s*lạnh|bình\s*nóng)/i.test(blob)) score++; break;
      case "banCong": if (/(ban\s*công)/i.test(blob)) score++; break;
      case "thangMay": if (/(thang\s*máy)/i.test(blob)) score++; break;
      case "khepKin": if (/(khép\s*kín|khép\s*kin)/i.test(blob)) score++; break;
      case "noiThat": if (/(đầy\s*đủ\s*nội\s*thất|full\s*nội\s*thất|đồ\s*đạc)/i.test(blob)) score++; break;
      case "mayGiat": if (/(máy\s*giặt)/i.test(blob)) score++; break;
      case "bep": if (/(bếp|nấu\s*ăn)/i.test(blob)) score++; break;
      case "deXe": if (/(để\s*xe|chỗ\s*để\s*xe|gara)/i.test(blob)) score++; break;
      case "wifi": if (/(wifi|internet)/i.test(blob)) score++; break;
    }
  }
  return score;
}

// Chuyển khoảng giá (VND) thành nhãn priceRange dùng trên homepage
function toSitePriceRange(min?: number, max?: number): string | undefined {
  if (typeof min !== "number" && typeof max !== "number") return undefined;
  const m = (typeof min === "number" ? min : 0) / 1_000_000;
  const x = (typeof max === "number" ? max : 1e12) / 1_000_000;
  // Các dải chuẩn: duoi-3, 3-5, 5-7, 7-10, tren-10
  if (x <= 3) return "duoi-3-trieu";
  if (m >= 10) return "tren-10-trieu";
  if (m <= 3 && x <= 5) return "3-5-trieu";
  if (m <= 5 && x <= 7) return "5-7-trieu";
  if (m <= 7 && x <= 10) return "7-10-trieu";
  // Ước lượng theo trung bình
  const mid = ( (typeof min === "number" ? min : 0) + (typeof max === "number" ? max : 10_000_000) ) / 2 / 1_000_000;
  if (mid < 4) return "duoi-3-trieu";
  if (mid < 6) return "3-5-trieu";
  if (mid < 8) return "5-7-trieu";
  if (mid <= 10) return "7-10-trieu";
  return "tren-10-trieu";
}

// Rút gọn câu người dùng thành keyword ngắn gọn cho BE (ví dụ: "đống đa")
function extractKeyword(raw: string): string {
  const t = (raw || "").toLowerCase();
  // loại bỏ các từ dừng thường gặp
  const stop = /(tìm|tim|thuê|thue|phòng|phong|trọ|tro|nhà|nha|ở|o|cần|can|giá|gia|khoảng|khoang|triệu|tr|\d+[\.,]?\d*|\d+)/gi;
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
  const keyword = extractKeyword(q);

  if (!q) {
    return NextResponse.json({ items: [], note: "Thiếu từ khóa tìm kiếm" }, { status: 400 });
  }

  // Helper: chuẩn hoá item
  const toItems = (posts: any[]) => posts.map((p: any) => {
      const id = String(p?._id || p?.id || "");
      const title = String(p?.title || p?.roomId?.title || "Tin đăng");
      const price = Number(p?.price || p?.roomId?.price || 0) || null;
      const district = typeof p?.district === "string" ? p.district : (typeof p?.roomId?.address === "string" ? p.roomId.address.split(",").slice(-2,-1)[0]?.trim() : undefined);
      const thumbnail = Array.isArray(p?.images) && p.images[0]
        ? p.images[0]
        : (Array.isArray(p?.roomId?.images) && p.roomId.images[0] ? p.roomId.images[0] : "/placeholder.png");
      const href = `/phong-tro/${id}`;
      return { id, title, price, district, thumbnail, href };
    });

  // Gọi BE search thực tế: ưu tiên /search, fallback /posts?q=
  try {
    const { priceMinVnd, priceMaxVnd, district, amenities, province } = parseQuery(q);

    // Tạo priceRange slug cho URL frontend
    // Ưu tiên lấy slug trực tiếp từ câu hỏi; nếu không suy được thì map theo min/max -> bucket chuẩn
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

    // 1) Ưu tiên gọi API /posts theo đúng PostController (đảm bảo kết quả đồng nhất UI)
    const url2 = `${API_BASE_URL}/posts?q=${encodeURIComponent(keyword)}&limit=20`
      + (priceRangeSlug ? `&priceRange=${encodeURIComponent(priceRangeSlug)}` : "")
      + (district ? `&district=${encodeURIComponent(district)}` : "")
      + (province ? `&province=${encodeURIComponent(province)}` : "");
    const r2 = await fetch(url2, { method: "GET" });
    if (r2.ok) {
      const d2 = await r2.json();
      const ok = (d2 && typeof d2 === 'object' && (d2 as any).success === true);
      const posts2 = ok ? (d2 as any).data?.items : (Array.isArray((d2 as any)?.items) ? (d2 as any).items : []);
      const items2 = toItems(Array.isArray(posts2) ? posts2 : []).slice(0, 6);
      if (items2.length) {
        return NextResponse.json({
          note: `Kết quả theo từ khóa: “${keyword || q}”`,
          items: items2,
          meta: {
            moreUrl: priceRangeSlug
              ? `/?keyword=${encodeURIComponent(keyword || q)}&priceRange=${encodeURIComponent(priceRangeSlug)}`
              : `/?keyword=${encodeURIComponent(keyword || q)}`,
            primary: items2[0]
          },
        });
      }

    // 2) Fallback: dùng /search nếu /posts không trả items
    const url1 = `${API_BASE_URL}/search?q=${encodeURIComponent(keyword)}&limit=20`
      + (typeof priceMinVnd === "number" ? `&minPrice=${priceMinVnd}` : "")
      + (typeof priceMaxVnd === "number" ? `&maxPrice=${priceMaxVnd}` : "")
      + (district ? `&district=${encodeURIComponent(district)}` : "")
      + (province ? `&province=${encodeURIComponent(province)}` : "");
    const r1 = await fetch(url1, { method: "GET" });
    if (r1.ok) {
      const d1 = await r1.json();
      const posts1 = Array.isArray(d1?.data?.posts) ? d1.data.posts : Array.isArray(d1?.posts) ? d1.posts : [];
      const items1 = toItems(Array.isArray(posts1) ? posts1 : []).slice(0, 6);
      if (items1.length) {
        return NextResponse.json({
          note: `Kết quả theo từ khóa: “${keyword || q}”`,
          items: items1,
          meta: {
            moreUrl: priceRangeSlug
              ? `/?keyword=${encodeURIComponent(keyword || q)}&priceRange=${encodeURIComponent(priceRangeSlug)}`
              : `/?keyword=${encodeURIComponent(keyword || q)}`,
            primary: items1[0]
          },
        });
      }
    }
    }

    return NextResponse.json({ items: [], note: `Không thấy kết quả cho: “${q}”` }, { status: 404 });
  } catch (err: any) {
    const msg = err?.message || String(err);
    return NextResponse.json({ items: [], note: msg }, { status: 500 });
  }
}
