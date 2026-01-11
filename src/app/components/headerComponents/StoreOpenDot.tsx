'use client';

import type { StoreOpenDotProps } from './types';

export function StoreOpenDot({ isOpen }: StoreOpenDotProps) {
  return (
    <span className="relative flex h-3 w-3">
      <span
        className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
          isOpen ? 'bg-green-500 animate-ping' : 'bg-red-500 animate-pulse'
        }`}
      />
      <span className={`relative inline-flex h-3 w-3 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
    </span>
  );
}
