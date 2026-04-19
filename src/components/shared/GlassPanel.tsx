'use client';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
  style?: React.CSSProperties;
}

export default function GlassPanel({ children, className = '', strong, style }: GlassPanelProps) {
  return (
    <div className={`${strong ? 'glass-panel-strong' : 'glass-panel'} ${className}`} style={style}>
      {children}
    </div>
  );
}
