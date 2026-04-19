'use client';

interface SkeletonCardProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function SkeletonCard({ size = 'md' }: SkeletonCardProps) {
  const sizeClasses = {
    sm: 'w-[100px] h-[140px]',
    md: 'w-[160px] h-[224px]',
    lg: 'w-[240px] h-[336px]',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-white/5 animate-pulse`}>
      <div className="p-2 space-y-2 h-full flex flex-col">
        <div className="h-3 bg-white/5 rounded w-3/4" />
        <div className="flex-1 bg-white/5 rounded" />
        <div className="h-2 bg-white/5 rounded w-1/2" />
        <div className="h-2 bg-white/5 rounded w-2/3" />
      </div>
    </div>
  );
}
