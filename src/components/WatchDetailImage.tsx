'use client';

import Image from 'next/image';
import { useState } from 'react';

interface WatchDetailImageProps {
  src: string;
  alt: string;
  dataAiHint?: string;
}

export default function WatchDetailImage({ src, alt, dataAiHint }: WatchDetailImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    setImgSrc('https://placehold.co/600x400.png');
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-contain p-4 md:p-8"
      data-ai-hint={dataAiHint || ''}
      onError={handleError}
    />
  );
}
