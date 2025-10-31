// src/app/api/chatbot/route.ts
export const runtime = "nodejs";

import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  type SafetySetting,
} from "@google/genai";

// Optional: để ai gõ thẳng URL /api/chatbot vẫn 200
export async function GET() {
  return new Response("Chat API OK", { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    if (!messages.length) {
      return new Response(
        JSON.stringify({ error: "messages must be a non-empty array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY ");

    const modelName = process.env.MODEL || "gemini-2.0-flash";
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `Bạn là trợ lý của website tìm phòng trọ. Trả lời ngắn gọn bằng tiếng Việt, thân thiện, có markdown khi cần.
Nguyên tắc:
- Không in bất kỳ JSON hay khối mã nào trừ khi người dùng yêu cầu rõ ràng.
- Nếu người dùng hỏi mẹo/hướng dẫn/chính sách, chỉ giải đáp nội dung, không nói về tìm phòng.
- Nếu người dùng tỏ ý TÌM PHÒNG (như chứa "tìm/thuê phòng", địa danh, khoảng giá…):
  • Hỏi thêm 1-2 thông tin còn thiếu nếu thật sự cần; nếu đủ thông tin, đưa ra câu trả lời ngắn mô tả bạn đang tìm và sẽ hiển thị kết quả ngay bên dưới.
- Không đề cập đến mô hình hay hệ thống. Chỉ tập trung vào nội dung hữu ích.`;

    // Map 'assistant' -> 'model' theo SDK Gemini
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content ?? "") }],
    }));

    const safetySettings: SafetySetting[] = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const resp = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        safetySettings,
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
    });

    return new Response(JSON.stringify({ reply: resp.text ?? "" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[/api/chatbot] ERROR:", err?.stack || err?.message || String(err));
    return new Response(JSON.stringify({ error: err?.message || String(err) }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}

// ⚠️ KHÔNG được có `export default` ở file này
