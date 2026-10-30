/* ============================================================
   TradeLink — ProductImage Component
   Displays product photography with seamless fallback when
   images fail to load or are missing.
   ============================================================ */
import { useState } from 'react';
import { Package, Wrench, Cpu, Box, Sparkles, Layers } from 'lucide-react';

const FALLBACK_ICON_MAP = {
  machinery: FactoryIcon,
  tools: Wrench,
  electronics: Cpu,
  packaging: Box,
  textiles: Sparkles,
  default: Package,
};

function FactoryIcon(props) {
  return (
    <svg width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M17 18h1" />
      <path d="M12 18h1" />
      <path d="M7 18h1" />
    </svg>
  );
}

export default function ProductImage({
  src,
  alt = 'Product image',
  className = '',
  style = {},
  fallbackCategory = 'default',
  aspectRatio = 'square', // 'square', 'video', 'banner', 'fill'
  badge = null,
}) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const Icon = FALLBACK_ICON_MAP[fallbackCategory] || FALLBACK_ICON_MAP.default;

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'banner'
      ? 'aspect-[21/9]'
      : '';

  if (!src || error) {
    return (
      <div
        className={`product-fallback-box ${aspectClass} ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F1F5F9',
          color: '#94A3B8',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'inherit',
          ...style,
        }}
        aria-label={alt}
      >
        <Icon size={24} strokeWidth={1.5} color="#64748B" />
        <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: 500, letterSpacing: '0.02em', color: '#64748B' }}>
          TradeLink B2B
        </span>
        {badge}
      </div>
    );
  }

  return (
    <div
      className={`product-image-container ${aspectClass} ${className}`}
      style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#F8FAFC', borderRadius: 'inherit', ...style }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: loaded ? 1 : 0.8,
          transition: 'opacity 0.2s ease',
        }}
      />
      {badge}
    </div>
  );
}

