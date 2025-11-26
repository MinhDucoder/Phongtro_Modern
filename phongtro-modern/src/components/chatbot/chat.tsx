"use client";

import React, { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant" | "system";
type MsgKind = "text" | "rooms" | "status";
type SimpleRoom = {
  id: string;
  title: string;
  price: number | null;
  district?: string;
  thumbnail?: string;
  href: string;
};
type Msg = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  kind?: MsgKind;
  rooms?: SimpleRoom[];
  note?: string;
  moreUrl?: string;
  error?: boolean;
  pending?: boolean;
};

const uuid = () => (crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random()}`);

function formatPriceVNDToTrieu(v: number | null) {
  if (v == null) return "Giá liên hệ";
  const trieu = v / 1_000_000;
  return `${Number.isInteger(trieu) ? trieu.toFixed(0) : trieu.toFixed(1)} triệu`;
}
function dedupRooms(items: SimpleRoom[]) {
  const seen = new Set<string>();
  const out: SimpleRoom[] = [];
  for (const it of items ?? []) {
    if (!it?.id || seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
}
// Tạo truy vấn chỉ từ câu người dùng vừa gửi để tránh lặp từ khóa
function collectSearchQuery(history: Msg[], latestUser: string, maxLen = 160) {
  const raw = String(latestUser || "").replace(/\s+/g, " ").trim();
  const norm = raw
    .replace(/đ(ô|o)ng\s*đa/gi, "Đống Đa")
    .replace(/ha noi|hanoi/gi, "Hà Nội");
  return norm.length > maxLen ? norm.slice(0, maxLen) : norm;
}

// Nhận diện ý định tìm phòng cơ bản dựa vào câu người dùng
function isSearchIntent(userText: string) {
  const t = (userText || "").toLowerCase();
  const hasFind = /(tìm|thuê|phòng|nhà|trọ|ở\s)/i.test(t);
  const hasMoney = /(\d+\s*triệu|\d+\s*k)/i.test(t);
  const hasPlace = /(đống\s*đa|cầu\s*giấy|bắ[c|k]\s*từ\s*liêm|nam\s*từ\s*liêm|thanh\s*xuân|hai\s*bà\s*trưng|hoàng\s*mai|ba\s*đình|tây\s*hồ|long\s*biên|hà\s*đông|hoàn\s*kiếm|hà\s*nội)/i.test(t);
  return hasFind || hasMoney || hasPlace;
}

// Loại bỏ JSON/khối code mà model có thể in ra
function stripAiFormatting(raw: string): string {
  if (!raw) return "";
  let out = String(raw);
  // Bỏ khối CONTROL_JSON nếu có
  out = out.replace(/<<<CONTROL_JSON_START>>>[\s\S]*?<<<CONTROL_JSON_END>>>/g, "");
  // Bỏ mọi khối ```code```
  out = out.replace(/```[\s\S]*?```/g, "");
  // Nếu đầu chuỗi là một object JSON, cố gắng loại bỏ
  out = out.replace(/^\s*\{[\s\S]*?\}\s*/m, "");
  // Gom khoảng trắng
  out = out.replace(/\n{3,}/g, "\n\n").replace(/\s+$/g, "").trim();
  return out;
}

export default function Chatbot({
  title = "Hỏi trợ lý AI",
  placeholder = "Nhập câu hỏi... (Enter gửi, Shift+Enter xuống dòng)",
  welcome = "Xin chào 👋 Mình là trợ lý AI. Bạn cần tìm phòng hay hỗ trợ gì?",
  endpoint = "/api/chatbot",
}: {
  title?: string;
  placeholder?: string;
  welcome?: string;
  endpoint?: string;
}) {
  const STORAGE_KEY = "ptm_chatbot_history_v1";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { id: uuid(), role: "assistant", content: welcome, createdAt: Date.now(), kind: "text" },
  ]);
  const [sending, setSending] = useState(false);
  const [composing, setComposing] = useState(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Scroll to bottom when chat opens
  useEffect(() => {
    if (open && bodyRef.current) {
      setTimeout(() => {
        if (bodyRef.current) {
          bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [open]);

  // Scroll to bottom on new message if user is near bottom
  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current;
    if (el) {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      if (nearBottom) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);
  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => { if (!open) abortRef.current?.abort(); }, [open]);
  // Load history once on mount
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // basic validation for required fields
        const restored: Msg[] = parsed
          .filter((m: any) => m && (m.role === "user" || m.role === "assistant"))
          .map((m: any) => ({
            id: String(m.id || uuid()),
            role: m.role,
            content: String(m.content ?? ""),
            createdAt: Number(m.createdAt || Date.now()),
            kind: m.kind,
            rooms: Array.isArray(m.rooms) ? m.rooms : undefined,
            note: typeof m.note === "string" ? m.note : undefined,
            moreUrl: typeof m.moreUrl === "string" ? m.moreUrl : undefined,
            error: !!m.error,
            pending: false,
          }));
        if (restored.length > 0) setMessages(restored.slice(-80));
      }
    } catch (_) { }
  }, []);
  // Persist history on change
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const toSave = messages.map((m) => ({ ...m, pending: false })).slice(-80);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (_) { }
  }, [messages]);

  const push = (m: Msg) => setMessages((prev) => [...prev, m]);
  const replace = (id: string, to: (m: Msg) => Msg) => setMessages((prev) => prev.map((m) => (m.id === id ? to(m) : m)));

  const send = async () => {
    const content = input.trim();
    if (!content || sending) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: Msg = { id: uuid(), role: "user", content, createdAt: Date.now(), kind: "text" };
    const typingId = uuid();

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: typingId, role: "assistant", content: "Đang soạn…", createdAt: Date.now(), kind: "status", pending: true },
    ]);
    setInput("");
    setSending(true);

    const toSend = [...messagesRef.current, userMsg].map(({ role, content }) => ({ role, content }));

    try {
      const wantSearch = isSearchIntent(content);

      // Chuẩn bị tác vụ gọi LLM và (nếu cần) tìm phòng, chạy song song để phản hồi nhanh hơn
      const llmPromise = (async () => {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: toSend }),
            signal: controller.signal,
          });
          if (!res.ok) throw new Error((await res.text().catch(() => "")) || `HTTP ${res.status}`);
          const data = await res.json();
          return stripAiFormatting((data?.reply ?? "").toString());
        } catch (_) {
          return ""; // Nếu LLM lỗi, không chặn flow tìm phòng
        }
      })();

      const searchQ = collectSearchQuery(messagesRef.current, content);
      if (wantSearch) {
        replace(typingId, () => ({ id: typingId, role: "assistant", content: `Đang tìm: “${searchQ}”…`, createdAt: Date.now(), kind: "status", pending: true }));
      }

      const searchPromise = (async () => {
        try {
          const sr = await fetch(`/api/rooms-search?q=${encodeURIComponent(searchQ)}`, { method: "GET", signal: controller.signal });
          return sr;
        } catch (_) {
          return null as unknown as Response;
        }
      })();

      const [userAnswer, sr] = await Promise.all([llmPromise, searchPromise]);

      if (sr.status === 404) {
        const moreUrl = `/tim-kiem?q=${encodeURIComponent(searchQ)}`;
        replace(typingId, () => ({
          id: typingId,
          role: "assistant",
          createdAt: Date.now(),
          kind: "text",
          content: userAnswer || `Mình đã thử với “${searchQ}” nhưng chưa thấy kết quả. Bạn thử xem trang tổng: ${moreUrl} hoặc cho mình biết thêm tiêu chí nhé.`,
          pending: false,
        }));
      } else if (sr && sr.ok) {
        const sdata = await sr.json();
        const items = dedupRooms(Array.isArray(sdata?.items) ? sdata.items : []);
        const primary = sdata?.meta?.primary && typeof sdata.meta.primary === "object" ? sdata.meta.primary : items[0];
        if (items.length > 0) {
          replace(typingId, () => ({
            id: typingId,
            role: "assistant",
            content: (sdata?.note ? `${sdata.note}\n\n` : "") + (userAnswer || "") || "",
            createdAt: Date.now(),
            kind: "rooms",
            // Chỉ gửi lại phòng đầu tiên theo yêu cầu
            rooms: primary ? [primary] : (items.length ? [items[0]] : []),
            note: sdata?.note || undefined,
            moreUrl: typeof sdata?.meta?.moreUrl === "string" ? sdata.meta.moreUrl : `/tim-kiem?q=${encodeURIComponent(searchQ)}`,
            pending: false,
          }));
        } else {
          replace(typingId, () => ({
            id: typingId,
            role: "assistant",
            createdAt: Date.now(),
            kind: "text",
            content: userAnswer || `Chưa thấy kết quả cho “${searchQ}”. Bạn có thể thu hẹp theo phường/đường hoặc khoảng giá.`,
            pending: false,
          }));
        }
      } else {
        // Không có kết quả/không gọi được API -> hiển thị thông báo rõ ràng kèm trả lời LLM
        const moreUrl = `/tim-kiem?q=${encodeURIComponent(searchQ)}`;
        const fallback = userAnswer ? `\n\n${userAnswer}` : "";
        replace(typingId, () => ({
          id: typingId,
          role: "assistant",
          createdAt: Date.now(),
          kind: "text",
          content: `Không thể lấy được kết quả tìm phòng lúc này. Bạn kiểm tra kết nối server tìm kiếm hoặc thử xem thêm tại: ${moreUrl}.` + fallback,
          pending: false,
        }));
      }
    } catch (e: any) {
      replace(typingId, () => ({ id: typingId, role: "assistant", content: `❌ Lỗi: ${e?.message || "Không xác định"}`, createdAt: Date.now(), kind: "text", error: true, pending: false }));
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !composing) { e.preventDefault(); send(); }
  };

  const Bubble = ({ msg }: { msg: Msg }) => {
    const isUser = msg.role === "user";
    const cls = isUser
      ? "bg-blue-600 text-white rounded-br-md"
      : msg.kind === "status"
        ? "bg-white text-gray-600 border border-gray-100 rounded-bl-md"
        : "bg-white text-gray-900 border border-gray-100 rounded-bl-md";
    const html = msg.content
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(https?:\/\/[^\s]+)/g, '<a class="text-blue-600 underline" href="$1" rel="nofollow">$1</a>');
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap ${cls}`} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  };

  const RoomsBlock = ({ note, rooms, moreUrl }: { note?: string; rooms: SimpleRoom[]; moreUrl?: string }) => (
    <div className="flex justify-start">
      <div className="bg-white border border-gray-100 rounded-2xl p-3 max-w-full w-full">
        {!!note && <div className="mb-2 text-sm text-gray-700">{note}</div>}
        <div className="grid grid-cols-1 gap-3">
          {rooms.map((r) => (
            <a key={r.id} href={typeof r.href === "string" ? r.href : "#"} className="flex gap-3 items-center rounded-xl border border-gray-200 p-2 hover:bg-gray-50 transition" rel="nofollow">
              <img src={r.thumbnail || "/placeholder.png"} alt={r.title} className="w-16 h-16 rounded-lg object-cover border" loading="lazy" decoding="async" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{r.title}</div>
                <div className="text-xs text-gray-600">
                  {formatPriceVNDToTrieu(r.price)}
                  {r.district ? ` · ${r.district}` : ""}
                </div>
              </div>
              <div className="ml-auto text-sm text-blue-600">Xem</div>
            </a>
          ))}
        </div>
        {moreUrl && (
          <div className="mt-3">
            <a href={moreUrl} className="inline-flex items-center text-sm text-blue-600 hover:underline" rel="nofollow">
              Xem thêm kết quả
            </a>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button aria-label={open ? "Đóng ô chat" : "Mở ô chat AI"} onClick={() => setOpen((v) => !v)} className="fixed bottom-5 right-5 z-50 rounded-full shadow-lg bg-blue-600 text-white w-14 h-14 flex items-center justify-center hover:scale-105 transition" type="button">
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c5.523 0 10-3.806 10-8.5S17.523 5 12 5 2 8.806 2 13.5c0 2.114 1.03 4.04 2.748 5.54-.082.681-.368 1.957-1.306 3.225 0 0 1.83-.294 3.34-1.204C8.314 21.69 10.107 22 12 22z" /></svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[90vw] max-w-md bg-gray-50 border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
            <div className="font-semibold">{title}</div>
            <div className="text-xs text-gray-500">{sending ? "Đang trả lời..." : "Sẵn sàng"}</div>
          </div>

          <div ref={bodyRef} className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[60vh] bg-gradient-to-b from-white to-gray-50">
            {messages.map((m) => (m.kind === "rooms" && m.rooms ? <RoomsBlock key={m.id} note={m.note} rooms={m.rooms} moreUrl={m.moreUrl} /> : <Bubble key={m.id} msg={m} />))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-2 text-sm text-gray-600 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-.2s]" />
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-.1s]" />
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                  <span className="ml-1">Đang soạn...</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border-t p-3">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder={placeholder}
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={input}
                disabled={sending}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                onCompositionStart={() => setComposing(true)}
                onCompositionEnd={() => setComposing(false)}
                aria-label="Ô nhập câu hỏi"
              />
              <button onClick={send} disabled={sending || !input.trim()} className="rounded-xl px-4 py-2 text-sm font-medium bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90">
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


