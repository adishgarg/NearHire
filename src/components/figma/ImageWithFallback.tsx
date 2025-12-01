"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
}

export function ImageWithFallback({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  // Debug logging
  console.log('ImageWithFallback rendered:', { 
    originalSrc: src, 
    currentSrc: imgSrc, 
    hasError, 
    alt: alt.substring(0, 30) + '...' 
  });

  const handleError = () => {
    console.log('Image loading failed for:', imgSrc, 'switching to fallback:', fallbackSrc);
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    console.log('Image loaded successfully:', imgSrc);
  };

  // Update imgSrc when src prop changes
  useEffect(() => {
    console.log('ImageWithFallback src prop changed:', { oldSrc: imgSrc, newSrc: src });
    if (src && src.trim() !== '' && src !== imgSrc) {
      setImgSrc(src);
      setHasError(false);
    }
  }, [src]);

  // If no source provided, show placeholder
  if (!src || src.trim() === '') {
    console.log('No src provided, showing placeholder');
    return (
      <div 
        className={`bg-zinc-800 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-zinc-400 text-sm">No Image URL</span>
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
}