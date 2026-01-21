'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Custom loader pour forcer same-origin /media/... via proxy Next
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  // Si c'est déjà une URL absolue backend, la convertir en /media/...
  if (src.startsWith('http://127.0.0.1:8000/media/') || src.startsWith('http://localhost:8000/media/')) {
    const afterMedia = src.replace(/^https?:\/\/(127\.0\.0\.1|localhost):8000\/media\//, '');
    return `/media/${afterMedia}?w=${width}&q=${quality || 75}`;
  }
  // Sinon, laisser Next gérer (déjà same-origin)
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface ImageWithFallbackProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  sizes?: string;
}

/**
 * Composant Image intelligent avec fallback automatique
 * 
 * Utilisation :
 * <ImageWithFallback
 *   src="/images/hero/hero-main.jpg"           // Photo réelle
 *   fallbackSrc="/illustrations/hero/medical-care.svg"  // Fallback illustration
 *   alt="Centre médical VIDA"
 *   width={1200}
 *   height={800}
 *   className="vida-grain rounded-vida-lg"
 * />
 * 
 * Comportement :
 * - Si hero-main.jpg existe → Affiche la photo
 * - Si hero-main.jpg n'existe pas → Affiche medical-care.svg automatiquement
 * - Grain VIDA appliqué automatiquement via className
 */
export default function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  objectFit = 'cover',
  sizes,
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  const imageProps = fill
    ? { fill: true, sizes }
    : { width, height, sizes };

  return (
    <Image
      {...imageProps}
      src={imgSrc}
      alt={alt}
      className={cn(className)}
      onError={handleError}
      priority={priority}
      style={{ objectFit }}
      loader={customLoader}
      unoptimized={false}
    />
  );
}
