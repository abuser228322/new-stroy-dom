'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';

const CONTACT_INFO = {
  phone: '8-937-133-33-66',
  phoneClean: '+79371333366',
  address: 'г. Астрахань, ул. Рыбинская, 25Н',
  email: 'info@stroydom30.ru',
  workHoursWeekday: 'Пн-Сб: 08:00-16:00',
  workHoursSunday: 'Вск: 08:00-14:00',
};

const FOOTER_LINKS = {
  info: [
    { name: 'Доставка и оплата', href: '/payment' },
    { name: 'Акции', href: '/sales' },
    { name: 'Контакты', href: '/contacts' },
  ],
  legal: [
    { name: 'Политика конфиденциальности', href: '/policy' },
  ],
};

interface AccordionSectionProps {
  title: string;
  sectionKey: string;
  items: { name: string; href: string }[];
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionSection({ title, sectionKey, items, isOpen, onToggle }: AccordionSectionProps) {
  const contentRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.maxHeight = isOpen ? `${contentRef.current.scrollHeight}px` : '0px';
    }
  }, [isOpen]);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className={`w-full flex justify-between items-center py-4 px-4 text-left transition-colors ${
          isOpen ? 'bg-primary text-white' : 'text-gray-900 hover:bg-gray-50'
        }`}
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium">{title}</span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <ul
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out bg-gray-50"
        style={{ maxHeight: '0px' }}
      >
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block py-2.5 px-6 text-gray-600 hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const { categories } = useCategories();

  // Генерируем ссылки каталога из БД
  const catalogLinks = categories.slice(0, 8).map((cat) => ({
    name: cat.name,
    href: `/catalog/${cat.slug}`,
  }));

  const handleToggle = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Мобильное аккордеон-меню */}
      <div className="lg:hidden">
        <AccordionSection
          title="Каталог"
          sectionKey="catalog"
          items={catalogLinks}
          isOpen={openSection === 'catalog'}
          onToggle={() => handleToggle('catalog')}
        />
        <AccordionSection
          title="Информация"
          sectionKey="info"
          items={FOOTER_LINKS.info}
          isOpen={openSection === 'info'}
          onToggle={() => handleToggle('info')}
        />
        <AccordionSection
          title="Документы"
          sectionKey="legal"
          items={FOOTER_LINKS.legal}
          isOpen={openSection === 'legal'}
          onToggle={() => handleToggle('legal')}
        />
      </div>

      {/* Десктопная версия */}
      <div className="hidden lg:block bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-12 gap-8">
            {/* Логотип и контакты */}
            <div className="col-span-3">
              <Link href="/" className="flex items-center gap-3 mb-6 group">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:shadow-sky-500/50 transition-shadow">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xl font-bold text-white group-hover:text-sky-400 transition-colors">Строй Дом</span>
                  <span className="block text-xs text-gray-400">Строительные материалы</span>
                </div>
              </Link>

              <div className="space-y-3">
                <a
                  href={`tel:${CONTACT_INFO.phoneClean}`}
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span className="font-semibold">{CONTACT_INFO.phone}</span>
                </a>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>{CONTACT_INFO.email}</span>
                </a>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span>{CONTACT_INFO.address}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span>{CONTACT_INFO.workHoursWeekday}</span>
                    <span className="text-sm text-gray-400">{CONTACT_INFO.workHoursSunday}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Каталог */}
            <div className="col-span-3">
              <h3 className="text-lg font-bold text-white mb-4">Каталог</h3>
              <ul className="space-y-2.5">
                {catalogLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/catalog"
                    className="text-sky-400 font-semibold hover:text-sky-300 transition-colors"
                  >
                    Весь каталог →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Информация */}
            <div className="col-span-2">
              <h3 className="text-lg font-bold text-white mb-4">Информация</h3>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.info.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Документы */}
            <div className="col-span-2">
              <h3 className="text-lg font-bold text-white mb-4">Документы</h3>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.legal.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Мы в соцсетях */}
            <div className="col-span-2">
              <h3 className="text-lg font-bold text-white mb-4">Мы в соцсетях</h3>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white transition-all"
                  aria-label="VKontakte"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.684 4 8.222c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.18-3.624 2.18-3.624.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.78 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.491-.085.745-.576.745z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white transition-all"
                  aria-label="Telegram"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-emerald-500 hover:text-white transition-all"
                  aria-label="WhatsApp"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>

              {/* Способы оплаты */}
              <h3 className="text-lg font-bold text-white mt-6 mb-4">Способы оплаты</h3>
              <div className="flex gap-2 flex-wrap">
                <div className="px-3 py-1.5 bg-white/10 rounded-lg text-xs text-gray-300">Наличные</div>
                <div className="px-3 py-1.5 bg-white/10 rounded-lg text-xs text-gray-300">Карта</div>
                <div className="px-3 py-1.5 bg-white/10 rounded-lg text-xs text-gray-300">Перевод</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Нижняя часть */}
      <div className="bg-slate-950 border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Копирайт */}
            <div className="text-sm text-gray-400 text-center lg:text-left">
              © {currentYear} Строй Дом. Все права защищены.
            </div>

            {/* Контакты мобильные */}
            <div className="lg:hidden text-center">
              <a
                href={`tel:${CONTACT_INFO.phoneClean}`}
                className="block text-xl font-bold text-sky-400 mb-1"
              >
                {CONTACT_INFO.phone}
              </a>
              <p className="text-sm text-gray-500">{CONTACT_INFO.workHoursWeekday}</p>
              <p className="text-xs text-gray-500">{CONTACT_INFO.workHoursSunday}</p>
            </div>

            {/* Ссылка на разработчика */}
            <div className="text-sm text-gray-500">
              Разработка сайта:{' '}
              <a href="#" className="hover:text-sky-400 transition-colors">
                WebStudio
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
