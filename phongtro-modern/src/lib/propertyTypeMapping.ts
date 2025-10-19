/**
 * Mapping giữa frontend URL format (kebab-case) và backend DB format (snake_case)
 */

// Frontend -> Backend mapping
export const PROPERTY_TYPE_TO_DB: Record<string, string> = {
  'phong-tro': 'phong_tro',
  'nha-rieng': 'nha_nguyen_can',
  'nha-nguyen-can': 'nha_nguyen_can',
  'can-ho': 'can_ho_chung_cu',
  'can-ho-chung-cu': 'can_ho_chung_cu',
  'can-ho-mini': 'can_ho_mini',
  'can-ho-dich-vu': 'can_ho_dich_vu',
  'o-ghep': 'o_ghep',
  'mat-bang': 'mat_bang',
};

// Backend -> Frontend mapping
export const PROPERTY_TYPE_FROM_DB: Record<string, string> = {
  'phong_tro': 'phong-tro',
  'nha_nguyen_can': 'nha-nguyen-can',
  'can_ho_chung_cu': 'can-ho-chung-cu',
  'can_ho_mini': 'can-ho-mini',
  'can_ho_dich_vu': 'can-ho-dich-vu',
  'o_ghep': 'o-ghep',
  'mat_bang': 'mat-bang',
};

// Labels hiển thị cho user
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  'phong-tro': 'Phòng trọ',
  'nha-rieng': 'Nhà nguyên căn',
  'nha-nguyen-can': 'Nhà nguyên căn',
  'can-ho': 'Căn hộ chung cư',
  'can-ho-chung-cu': 'Căn hộ chung cư',
  'can-ho-mini': 'Căn hộ mini',
  'can-ho-dich-vu': 'Căn hộ dịch vụ',
  'o-ghep': 'Ở ghép',
  'mat-bang': 'Mặt bằng',
};

/**
 * Convert frontend format sang backend format
 * @param frontendType - Format từ URL/Frontend (phong-tro, nha-rieng, etc.)
 * @returns Backend format (phong_tro, nha_nguyen_can, etc.)
 */
export function toBackendPropertyType(frontendType: string): string {
  return PROPERTY_TYPE_TO_DB[frontendType] || frontendType;
}

/**
 * Convert backend format sang frontend format
 * @param backendType - Format từ database (phong_tro, nha_nguyen_can, etc.)
 * @returns Frontend format (phong-tro, nha-rieng, etc.)
 */
export function toFrontendPropertyType(backendType: string): string {
  return PROPERTY_TYPE_FROM_DB[backendType] || backendType;
}

/**
 * Lấy label hiển thị cho user
 * @param propertyType - Frontend hoặc backend format
 * @returns Label tiếng Việt
 */
export function getPropertyTypeLabel(propertyType: string): string {
  // Try frontend format first
  if (PROPERTY_TYPE_LABELS[propertyType]) {
    return PROPERTY_TYPE_LABELS[propertyType];
  }
  // Try converting from backend format
  const frontendType = toFrontendPropertyType(propertyType);
  return PROPERTY_TYPE_LABELS[frontendType] || propertyType;
}

/**
 * Danh sách tất cả property types cho dropdown/filter
 */
export const ALL_PROPERTY_TYPES = [
  { value: 'phong-tro', label: 'Phòng trọ', dbValue: 'phong_tro' },
  { value: 'nha-nguyen-can', label: 'Nhà nguyên căn', dbValue: 'nha_nguyen_can' },
  { value: 'can-ho-chung-cu', label: 'Căn hộ chung cư', dbValue: 'can_ho_chung_cu' },
  { value: 'can-ho-mini', label: 'Căn hộ mini', dbValue: 'can_ho_mini' },
  { value: 'can-ho-dich-vu', label: 'Căn hộ dịch vụ', dbValue: 'can_ho_dich_vu' },
  { value: 'o-ghep', label: 'Ở ghép', dbValue: 'o_ghep' },
  { value: 'mat-bang', label: 'Mặt bằng', dbValue: 'mat_bang' },
];
