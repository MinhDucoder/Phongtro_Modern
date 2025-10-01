'use client';

import Image from 'next/image';
import { getFirstImage } from '@/lib/imageUtils';

interface SafeImageProps {
  src: string | string[] | object | undefined | null;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  onClick?: () => void;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  unoptimized?: boolean;
  onError?: () => void;
  onLoad?: () => void;
}

/**
 * A safe wrapper around Next.js Image component that handles edge cases
 * and prevents the "Image is missing required src property" error
 */
export default function SafeImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  onClick,
  sizes,
  priority,
  quality,
  placeholder,
  blurDataURL,
  unoptimized,
  onError,
  onLoad,
  ...props
}: SafeImageProps) {
  // Handle different types of src input
  let safeSrc: string;
  
  if (typeof src === 'string') {
    // If it's already a string, validate it - handle empty strings
    safeSrc = src.trim() !== '' ? src : '/placeholder-room.svg';
  } else if (Array.isArray(src)) {
    // If it's an array, use getFirstImage
    safeSrc = getFirstImage(src);
  } else if (src && typeof src === 'object') {
    // If it's an object, try to extract image URL
    const objSrc = src as any;
    if (objSrc.url) {
      safeSrc = objSrc.url.trim() !== '' ? objSrc.url : '/placeholder-room.svg';
    } else if (objSrc.src) {
      safeSrc = objSrc.src.trim() !== '' ? objSrc.src : '/placeholder-room.svg';
    } else if (objSrc.image) {
      safeSrc = objSrc.image.trim() !== '' ? objSrc.image : '/placeholder-room.svg';
    } else {
      safeSrc = '/placeholder-room.svg';
    }
  } else {
    // For null, undefined, or any other type
    safeSrc = '/placeholder-room.svg';
  }

  // Final validation to ensure we never pass an empty string or object
  if (!safeSrc || typeof safeSrc !== 'string' || safeSrc.trim() === '') {
    safeSrc = '/placeholder-room.svg';
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      onClick={onClick}
      sizes={sizes}
      priority={priority}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      unoptimized={unoptimized}
      onError={onError}
      onLoad={onLoad}
      {...props}
    />
  );
}
