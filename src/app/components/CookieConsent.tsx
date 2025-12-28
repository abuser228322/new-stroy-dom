'use client';

import { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const consent = localStorage.getItem('cookieConsent');
      const consentTime = localStorage.getItem('cookieConsentTime');
      const now = Date.now();
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

      if (!consent || !consentTime) {
        setShowBanner(true);
      } else if (now - parseInt(consentTime) > thirtyDaysInMs) {
        setShowBanner(true);
      } else {
        setShowBanner(false);
      }
    } catch (error) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    try {
      localStorage.setItem('cookieConsent', 'accepted');
      localStorage.setItem('cookieConsentTime', Date.now().toString());
      setShowBanner(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error saving cookie consent:', error);
    }
  };

  const declineCookies = () => {
    try {
      localStorage.setItem('cookieConsent', 'declined');
      localStorage.setItem('cookieConsentTime', Date.now().toString());
      setShowBanner(false);
    } catch (error) {
      console.error('Error saving cookie consent:', error);
    }
  };

  if (!isClient || !showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-500">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm">
          Мы используем файлы cookie для улучшения работы сайта. Продолжая использовать сайт, вы соглашаетесь с нашей{' '}
          <a href="/cookies" className="underline">Политикой использования файлов cookie</a>.
        </p>
        <div className="flex space-x-2 shrink-0">
          <button
            onClick={declineCookies}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm whitespace-nowrap"
          >
            Отклонить
          </button>
          <button
            onClick={acceptCookies}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm whitespace-nowrap"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
