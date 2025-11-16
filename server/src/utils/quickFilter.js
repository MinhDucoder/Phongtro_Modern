import fs from "fs";
import path from "path";

/**
 * Hàm đọc file JSON BAD_WORDS
 */
const filePath = path.join(process.cwd(), "src/utils/badword.json");
const raw = fs.readFileSync(filePath, "utf8");
const BADWORDS = JSON.parse(raw);

/**
 * Chuẩn hoá tiếng Việt để tránh bypass:
 * - loại dấu
 * - lowerCase
 * - bỏ ký tự đặc biệt, khoảng trắng dư
 */
function normalize(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")       // remove unicode accents
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")              // replace special chars -> space
    .replace(/\s+/g, " ")                  // normalize spaces
    .trim();
}

/**
 * Kiểm tra có chứa bad words dạng exact
 */
function matchExact(text) {
  const lower = text.toLowerCase();
  return BADWORDS.exact.some(w => lower.includes(w));
}

/**
 * Kiểm tra biến thể / bypass ví dụ: 
 * "d!t", "d1t", "dj.t", "n.g.u", "occho"
 */
function matchVariants(text) {
  const n = normalize(text);
  return BADWORDS.variants.some(v => n.includes(v));
}

/**
 * Kiểm tra bằng regex nâng cao
 */
function matchRegex(text) {
  const lower = text.toLowerCase();
  return BADWORDS.regex.some(pattern => {
    const regex = new RegExp(pattern, "gi");
    return regex.test(lower);
  });
}

/**
 * Hàm check toxic tổng hợp
 */
export function isToxic(text) {
  if (!text || text.trim() === "") return false;

  // Layer 1 – exact
  if (matchExact(text)) return true;

  // Layer 2 – variants
  if (matchVariants(text)) return true;

  // Layer 3 – regex intelligent
  if (matchRegex(text)) return true;

  return false;
}

/**
 * Hàm lọc (thay ***)
 */
export function cleanText(text) {
  if (!text) return text;

  let cleaned = text;

  // Replace exact words
  BADWORDS.exact.forEach(w => {
    const regex = new RegExp(w, "gi");
    cleaned = cleaned.replace(regex, "***");
  });

  // Replace variants
  BADWORDS.variants.forEach(v => {
    const regex = new RegExp(v, "gi");
    cleaned = cleaned.replace(regex, "***");
  });

  // Replace regex
  BADWORDS.regex.forEach(p => {
    const regex = new RegExp(p, "gi");
    cleaned = cleaned.replace(regex, "***");
  });

  return cleaned;
}
