'use client';

import { useState, useEffect, useMemo } from 'react';
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaClock, FaDirections, FaWarehouse } from 'react-icons/fa';

interface StoreInfoProps {
  className?: string;
}

interface StoreStatus {
  isOpen: boolean;
  message: string;
  nextChange: string;
}

const STORES = [
  {
    name: 'Магазин №1',
    address: 'г. Астрахань, ул. Рыбинская, 25Н',
    note: 'Рынок «Славянка»',
    hours: { weekdays: '08:00-16:00', sunday: '08:00-14:00' },
  },
  {
    name: 'Магазин №2',
    address: 'г. Астрахань, пл. Свободы, 14К',
    note: '',
    hours: { weekdays: '09:00-19:00', sunday: '10:00-18:00' },
  },
];

const CONTACT_INFO = {
  phone: '8-937-133-33-66',
  phoneClean: '+79371333366',
  email: 'info@stroydom30.ru',
  workDays: {
    weekdays: { start: 8, end: 16 }, // Пн-Сб 08:00-16:00 (для статуса)
    sunday: { start: 8, end: 14 }, // Воскресенье 08:00-14:00
  },
};

function getStoreStatus(): StoreStatus {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours + minutes / 60;

  // Воскресенье
  if (day === 0) {
    const { start, end } = CONTACT_INFO.workDays.sunday;
    const weekdayStart = CONTACT_INFO.workDays.weekdays.start;
    
    if (currentTime < start) {
      return {
        isOpen: false,
        message: 'Магазин закрыт',
        nextChange: `Откроемся сегодня в ${String(start).padStart(2, '0')}:00`,
      };
    }
    
    if (currentTime >= end) {
      return {
        isOpen: false,
        message: 'Магазин закрыт',
        nextChange: `Откроемся в понедельник в ${String(weekdayStart).padStart(2, '0')}:00`,
      };
    }
    
    return {
      isOpen: true,
      message: 'Сейчас открыто',
      nextChange: `Закроемся в ${String(end).padStart(2, '0')}:00`,
    };
  }

  // Пн-Сб
  const { start, end } = CONTACT_INFO.workDays.weekdays;
  const sundayStart = CONTACT_INFO.workDays.sunday.start;

  if (currentTime < start) {
    return {
      isOpen: false,
      message: 'Магазин закрыт',
      nextChange: `Откроемся сегодня в ${String(start).padStart(2, '0')}:00`,
    };
  }

  if (currentTime >= end) {
    if (day === 6) {
      return {
        isOpen: false,
        message: 'Магазин закрыт',
        nextChange: `Откроемся в воскресенье в ${String(sundayStart).padStart(2, '0')}:00`,
      };
    }
    return {
      isOpen: false,
      message: 'Магазин закрыт',
      nextChange: `Откроемся завтра в ${String(start).padStart(2, '0')}:00`,
    };
  }

  return {
    isOpen: true,
    message: 'Сейчас открыто',
    nextChange: `Закроемся в ${String(end).padStart(2, '0')}:00`,
  };
}

export default function StoreInfo({ className = '' }: StoreInfoProps) {
  const [storeStatus, setStoreStatus] = useState<StoreStatus>(() => getStoreStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStoreStatus(getStoreStatus());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const statusColor = useMemo(() => {
    return storeStatus.isOpen ? 'bg-green-500' : 'bg-gray-400';
  }, [storeStatus.isOpen]);

  return (
    <section className={`rounded-2xl overflow-hidden ${className}`}>
      <div className="grid lg:grid-cols-2 gap-0">
        {/* Карта или изображение склада */}
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[450px] bg-gradient-to-br from-slate-800 to-slate-900">
          {/* Декоративный фон */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M0 20L20 0h20v20L20 40H0z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Акценты */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl" />
          
          {/* Контент */}
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center text-white">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-white/20">
              <FaWarehouse className="text-4xl text-white" />
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">
              Строй Дом
            </h2>
            <p className="text-lg text-slate-300 max-w-md">
              Магазин строительных материалов в Астрахани
            </p>
            
            {/* Мини-статистика */}
            <div className="flex gap-8 mt-8">
              <div>
                <div className="text-3xl font-bold">10+</div>
                <div className="text-sm text-slate-400">лет работы</div>
              </div>
              <div>
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-sm text-slate-400">товаров</div>
              </div>
              <div>
                <div className="text-3xl font-bold">16</div>
                <div className="text-sm text-slate-400">категорий</div>
              </div>
            </div>
          </div>
        </div>

        {/* Информация о магазине */}
        <div className="p-6 lg:p-10 bg-white flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Контактная информация
            </h3>
            <p className="text-gray-600">Приезжайте к нам или свяжитесь удобным способом</p>
          </div>

          {/* Статус работы */}
          <div className="flex items-center gap-3 mb-8 p-4 bg-gray-50 rounded-xl">
            <span className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`} />
            <div>
              <p className="font-semibold text-gray-900">{storeStatus.message}</p>
              <p className="text-sm text-gray-500">{storeStatus.nextChange}</p>
            </div>
          </div>

          {/* Контактная информация */}
          <div className="space-y-5">
            {/* Телефон */}
            <a
              href={`tel:${CONTACT_INFO.phoneClean}`}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-sky-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                <FaPhone className="text-sky-600 text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Телефон</p>
                <p className="font-bold text-xl text-gray-900">{CONTACT_INFO.phone}</p>
              </div>
            </a>

            {/* Адреса магазинов */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              <p className="text-sm text-gray-500 font-medium">Наши магазины</p>
              {STORES.map((store, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className={`w-10 h-10 ${idx === 0 ? 'bg-sky-100' : 'bg-orange-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <FaMapMarkerAlt className={`${idx === 0 ? 'text-sky-600' : 'text-orange-600'} text-sm`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{store.address}</p>
                    {store.note && <p className="text-sm text-gray-500">{store.note}</p>}
                    <p className="text-sm text-gray-500 mt-1.5">
                      <FaClock className="inline mr-1.5" />
                      Пн-Сб: {store.hours.weekdays}, Вск: {store.hours.sunday}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Email */}
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <FaEnvelope className="text-emerald-600 text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{CONTACT_INFO.email}</p>
              </div>
            </a>
          </div>

          {/* Кнопки действий */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href={`tel:${CONTACT_INFO.phoneClean}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-cyan-600 transition-all shadow-lg shadow-sky-500/30 text-sm sm:text-base"
            >
              <FaPhone className="shrink-0" />
              <span>Позвонить</span>
            </a>
            <a
              href="https://yandex.ru/maps/-/CHe38Zwa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-sky-300 hover:text-sky-600 transition-colors text-sm sm:text-base"
            >
              <FaDirections className="shrink-0" />
              <span>Маршрут</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
