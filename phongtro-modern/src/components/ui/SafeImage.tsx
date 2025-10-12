'use client';

import Image from 'next/image';
import { getFirstImage, getSafeImageSrc } from '@/lib/imageUtils';

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
  // Use the robust getSafeImageSrc function
  const safeSrc = getSafeImageSrc(src);

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
