'use client';

import { useState, useEffect } from 'react';
import { isStoreOpenNow, RYBINSKAYA_HOURS, SVOBODY_HOURS, formatStoreHoursLines } from '../lib/storeHours';

function StoreOpenDot({ isOpen, size = 'sm' }: { isOpen: boolean; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'h-2.5 w-2.5' : 'h-2 w-2';
  return (
    <span className={`relative flex ${sizeClass}`}>
      <span
        className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
          isOpen ? 'bg-green-400 animate-ping' : 'bg-red-400'
        }`}
      />
      <span className={`relative inline-flex ${sizeClass} rounded-full ${isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
    </span>
  );
}

export default function StoreStatusBadge() {
  const [isRybinskajaOpen, setIsRybinskajaOpen] = useState<boolean>(() => isStoreOpenNow(RYBINSKAYA_HOURS));
  const [isSvobodyOpen, setIsSvobodyOpen] = useState<boolean>(() => isStoreOpenNow(SVOBODY_HOURS));

  useEffect(() => {
    const tick = () => {
      setIsRybinskajaOpen(isStoreOpenNow(RYBINSKAYA_HOURS));
      setIsSvobodyOpen(isStoreOpenNow(SVOBODY_HOURS));
    };
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, []);

  const rybinskajaHours = formatStoreHoursLines(RYBINSKAYA_HOURS);
  const svobodyHours = formatStoreHoursLines(SVOBODY_HOURS);

  // Хотя бы один магазин открыт?
  const anyOpen = isRybinskajaOpen || isSvobodyOpen;

  return (
    <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-full mb-4 sm:mb-6 border border-white/20">
      {/* Магазин 1 - Рыбинская */}
      <div className="group relative flex items-center gap-2 cursor-help">
        <StoreOpenDot isOpen={isRybinskajaOpen} size="md" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
          <span className="text-xs font-medium text-white/90">Рыбинская</span>
          <span className="text-xs text-white/60 hidden sm:inline">•</span>
          <span className="text-xs text-white/70">{rybinskajaHours.monSat.replace('Пн-Сб: ', '')}</span>
        </div>
        {/* Тултип */}
        <div className="absolute left-0 bottom-full mb-2 bg-slate-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap shadow-lg">
          <div className="font-medium mb-1">ул. Рыбинская 25Н</div>
          <div>{rybinskajaHours.monSat}</div>
          <div>{rybinskajaHours.sun}</div>
          <div className="mt-1 text-xs">
            {isRybinskajaOpen ? (
              <span className="text-green-400">● Сейчас открыто</span>
            ) : (
              <span className="text-red-400">● Сейчас закрыто</span>
            )}
          </div>
        </div>
      </div>

      <span className="hidden sm:block text-white/30">|</span>

      {/* Магазин 2 - Свободы */}
      <div className="group relative flex items-center gap-2 cursor-help">
        <StoreOpenDot isOpen={isSvobodyOpen} size="md" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
          <span className="text-xs font-medium text-white/90">пл. Свободы</span>
          <span className="text-xs text-white/60 hidden sm:inline">•</span>
          <span className="text-xs text-white/70">{svobodyHours.monSat.replace('Пн-Сб: ', '')}</span>
        </div>
        {/* Тултип */}
        <div className="absolute left-0 bottom-full mb-2 bg-slate-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap shadow-lg">
          <div className="font-medium mb-1">пл. Свободы 14К</div>
          <div>{svobodyHours.monSat}</div>
          <div>{svobodyHours.sun}</div>
          <div className="mt-1 text-xs">
            {isSvobodyOpen ? (
              <span className="text-green-400">● Сейчас открыто</span>
            ) : (
              <span className="text-red-400">● Сейчас закрыто</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
