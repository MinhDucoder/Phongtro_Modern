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
