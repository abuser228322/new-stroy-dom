"use client";

import ContactForm from "../components/ContactForm";
import { FaPhone, FaMapMarkerAlt, FaClock, FaEnvelope, FaTruck, FaBuilding } from "react-icons/fa";

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Контакты</h1>
          <p className="text-lg opacity-90">
            Магазин строительных материалов «Строй Дом» в Астрахани
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Наши контакты</h2>
            
            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaPhone className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Телефон</h3>
                  <a href="tel:+79371333366" className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
                    8-937-133-33-66
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Звоните, мы ответим на все вопросы</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Адрес магазина</h3>
                  <p className="text-gray-700">г. Астрахань, ул. Рыбинская 25Н</p>
                  <p className="text-sm text-gray-500 mt-1">Удобная парковка для клиентов</p>
                </div>
              </div>

              {/* Work Hours */}
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaClock className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Режим работы</h3>
                  <p className="text-gray-700">Пн-Сб: 08:00-16:00</p>
                  <p className="text-gray-700">Вск: 08:00-14:00</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                  <a href="mailto:info@stroydom30.ru" className="text-primary hover:text-primary/80 transition-colors">
                    info@stroydom30.ru
                  </a>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
              <h3 className="font-bold text-gray-800 mb-4">Дополнительная информация</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaTruck className="text-accent" />
                  <span className="text-gray-700">Доставка по Астрахани и области</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaBuilding className="text-accent" />
                  <span className="text-gray-700">Работаем с юридическими лицами</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Напишите нам</h2>
            <ContactForm />
          </div>
        </div>

        {/* Map */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Как нас найти</h2>
          <div className="rounded-lg overflow-hidden shadow-lg h-[400px]">
            <iframe
              src="https://yandex.ru/map-widget/v1/?um=constructor%3A7b2e1e4e7a1c5f4c3d2b1a0f9e8d7c6b5a4&amp;source=constructor"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              style={{ display: 'block', border: 'none' }}
              title="Карта проезда"
            />
          </div>
          <p className="text-center text-gray-500 mt-4">
            г. Астрахань, ул. Рыбинская 25Н
          </p>
        </div>
      </div>
    </div>
  );
}
