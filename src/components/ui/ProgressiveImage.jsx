import { useState } from 'react'

export default function ProgressiveImage({ src, alt, className = '', imgClassName = '' }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={`relative overflow-hidden bg-white/5 ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full transition duration-700 ${loaded ? 'blur-0 scale-100' : 'blur-sm scale-105'} ${imgClassName || 'object-cover'}`}
      />
    </div>
  )
}
