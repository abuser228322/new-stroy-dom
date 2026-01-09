'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import type { CreateContactRequestData } from '../types/types';


export default function ContactForm() {
  const [formData, setFormData] = useState<CreateContactRequestData>({
    name: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CreateContactRequestData) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: Реализовать отправку на API
      // const response = await apiClient.post('/contacts', formData);
      
      // Симуляция отправки
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({ name: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 lg:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          {/* Форма */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Оставить заявку</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Ваше имя *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="Введите имя"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Сообщение
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent focus:bg-white transition-all resize-none"
                  placeholder="Опишите ваш вопрос или какие материалы вас интересуют"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:from-sky-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Отправка...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Отправить заявку
                  </>
                )}
              </button>
              
              {submitStatus === 'success' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-center text-emerald-700 font-medium">
                    ✓ Заявка отправлена! Мы свяжемся с вами в ближайшее время.
                  </p>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-center text-red-700 font-medium">
                    Ошибка отправки. Попробуйте позвонить по телефону.
                  </p>
                </div>
              )}
              
              <p className="text-xs text-center text-gray-500">
                Нажимая кнопку, вы соглашаетесь с{' '}
                <a href="/policy" className="text-sky-600 hover:underline">
                  политикой конфиденциальности
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
