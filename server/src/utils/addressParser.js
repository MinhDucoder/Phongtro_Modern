/**
 * Utility functions để parse và extract tỉnh/thành phố và quận/huyện từ address string
 */

// Danh sách các tỉnh/thành phố phổ biến ở Việt Nam
const PROVINCES = [
  'Hà Nội', 'Hồ Chí Minh', 'TPHCM', 'TP. Hồ Chí Minh', 'Thành phố Hồ Chí Minh',
  'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'An Giang', 'Bà Rịa - Vũng Tàu',
  'Bạc Liêu', 'Bắc Giang', 'Bắc Kạn', 'Bắc Ninh', 'Bến Tre',
  'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau',
  'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai',
  'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh',
  'Hải Dương', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa',
  'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn',
  'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình',
  'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam',
  'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La',
  'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế',
  'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc',
  'Yên Bái'
];

// Danh sách các quận/huyện phổ biến (có thể mở rộng)
const DISTRICTS = [
  // Hà Nội
  'Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Long Biên', 'Cầu Giấy',
  'Đống Đa', 'Hai Bà Trưng', 'Hoàng Mai', 'Thanh Xuân', 'Sóc Sơn',
  'Đông Anh', 'Gia Lâm', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Mê Linh',
  'Hà Đông', 'Sơn Tây', 'Ba Vì', 'Phúc Thọ', 'Đan Phượng',
  'Hoài Đức', 'Quốc Oai', 'Thạch Thất', 'Chương Mỹ', 'Thanh Oai',
  'Thường Tín', 'Phú Xuyên', 'Ứng Hòa', 'Mỹ Đức',
  // TP. Hồ Chí Minh
  'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
  'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
  'Quận 11', 'Quận 12', 'Bình Thạnh', 'Tân Bình', 'Tân Phú',
  'Phú Nhuận', 'Gò Vấp', 'Bình Tân', 'Củ Chi', 'Hóc Môn',
  'Bình Chánh', 'Nhà Bè', 'Cần Giờ', 'Thủ Đức',
  // Đà Nẵng
  'Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu',
  'Cẩm Lệ', 'Hòa Vang', 'Hoàng Sa',
  // Các quận/huyện khác (có thể mở rộng)
  'Ninh Kiều', 'Ô Môn', 'Bình Thuỷ', 'Cái Răng', 'Thốt Nốt', // Cần Thơ
  'Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Hải An', 'Kiến An', // Hải Phòng
];

/**
 * Loại bỏ dấu tiếng Việt để so sánh không phân biệt dấu
 */
function removeAccents(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Extract tỉnh/thành phố từ address string
 * @param {string} address - Địa chỉ đầy đủ
 * @returns {string|null} - Tên tỉnh/thành phố hoặc null nếu không tìm thấy
 */
export function extractProvince(address) {
  if (!address || typeof address !== 'string') return null;
  
  const normalizedAddress = removeAccents(address);
  
  // Tìm tỉnh/thành phố trong address
  for (const province of PROVINCES) {
    const normalizedProvince = removeAccents(province);
    // Tìm ở cuối address (thường tỉnh ở cuối)
    if (normalizedAddress.includes(normalizedProvince)) {
      return province;
    }
  }
  
  return null;
}

/**
 * Extract quận/huyện từ address string
 * @param {string} address - Địa chỉ đầy đủ
 * @param {string} province - Tỉnh/thành phố (optional, để tăng độ chính xác)
 * @returns {string|null} - Tên quận/huyện hoặc null nếu không tìm thấy
 */
export function extractDistrict(address, province = null) {
  if (!address || typeof address !== 'string') return null;
  
  const normalizedAddress = removeAccents(address);
  
  // Tìm quận/huyện trong address
  for (const district of DISTRICTS) {
    const normalizedDistrict = removeAccents(district);
    
    // Tìm pattern "Quận X" hoặc tên quận
    const patterns = [
      new RegExp(`\\b${normalizedDistrict.replace(/\s+/g, '\\s*')}\\b`, 'i'),
      new RegExp(`quận\\s*${normalizedDistrict.replace(/\s+/g, '\\s*')}`, 'i'),
      new RegExp(`huyện\\s*${normalizedDistrict.replace(/\s+/g, '\\s*')}`, 'i'),
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(normalizedAddress)) {
        return district;
      }
    }
  }
  
  // Fallback: Tìm pattern "Quận X" hoặc "Huyện X"
  const districtPattern = /(?:quận|huyện)\s*(\d+|[a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]+)/i;
  const match = address.match(districtPattern);
  if (match) {
    return match[1].trim();
  }
  
  return null;
}

/**
 * Extract cả tỉnh và quận từ address string
 * @param {string} address - Địa chỉ đầy đủ
 * @returns {object} - { province: string|null, district: string|null }
 */
export function extractLocation(address) {
  if (!address || typeof address !== 'string') {
    return { province: null, district: null };
  }
  
  const province = extractProvince(address);
  const district = extractDistrict(address, province);
  
  return { province, district };
}

/**
 * Kiểm tra xem address có chứa tỉnh/thành phố không
 * @param {string} address - Địa chỉ
 * @param {string} province - Tỉnh/thành phố cần kiểm tra
 * @returns {boolean}
 */
export function matchesProvince(address, province) {
  if (!address || !province) return false;
  
  const extracted = extractProvince(address);
  if (!extracted) return false;
  
  return removeAccents(extracted) === removeAccents(province);
}

/**
 * Kiểm tra xem address có chứa quận/huyện không
 * @param {string} address - Địa chỉ
 * @param {string} district - Quận/huyện cần kiểm tra
 * @returns {boolean}
 */
export function matchesDistrict(address, district) {
  if (!address || !district) return false;
  
  const extracted = extractDistrict(address);
  if (!extracted) return false;
  
  return removeAccents(extracted) === removeAccents(district);
}

/**
 * Kiểm tra xem address có chứa cả tỉnh và quận không
 * @param {string} address - Địa chỉ
 * @param {string} province - Tỉnh/thành phố cần kiểm tra
 * @param {string} district - Quận/huyện cần kiểm tra
 * @returns {boolean}
 */
export function matchesLocation(address, province, district) {
  if (!address) return false;
  
  const matchesProv = !province || matchesProvince(address, province);
  const matchesDist = !district || matchesDistrict(address, district);
  
  return matchesProv && matchesDist;
}

