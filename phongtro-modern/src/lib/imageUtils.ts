// Utility functions for handling images

/**
 * Get a safe image URL, fallback to placeholder if invalid
 */
export function getSafeImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return '/placeholder-room.svg';
  }
  return imageUrl;
}

/**
 * Get the first image from an array, with fallback
 */
export function getFirstImage(images: any[] | undefined | null): string {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return '/placeholder-room.svg';
  }
  
  const firstImage = images[0];
  
  // Handle nested arrays (from API response)
  if (Array.isArray(firstImage)) {
    return getFirstImage(firstImage);
  }
  
  return getSafeImageUrl(firstImage);
}

/**
 * Upload multiple images to Cloudinary
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/rooms/uploads/multiImage`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.files && Array.isArray(result.files)) {
      return result.files.map((file: any) => file.url);
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/rooms/uploads/delete`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_id: publicId }),
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Chỉ chấp nhận file ảnh JPG, PNG, JPEG, WEBP'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Kích thước ảnh không được vượt quá 5MB'
    };
  }

  return { isValid: true };
}
