import { useEffect } from 'react';

/**
 * Hook để preload images một cách tối ưu cho Next.js
 * Sử dụng link preload thay vì new Image() constructor
 */
export const useImagePreload = (imageUrl: string | undefined) => {
  useEffect(() => {
    if (!imageUrl || imageUrl === '/placeholder-room.svg' || typeof window === 'undefined') {
      return;
    }

    // Sử dụng link preload thay vì new Image() constructor
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageUrl;
    
    // Thêm vào head để preload
    document.head.appendChild(link);
    
    // Cleanup khi component unmount
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [imageUrl]);
};

/**
 * Hook để preload multiple images
 */
export const useMultipleImagePreload = (imageUrls: string[]) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const links: HTMLLinkElement[] = [];
    
    imageUrls.forEach(url => {
      if (url && url !== '/placeholder-room.svg') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);
        links.push(link);
      }
    });
    
    // Cleanup
    return () => {
      links.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [imageUrls]);
};
