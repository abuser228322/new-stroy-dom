'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface Slide {
  id: number;
  title: string;
  description: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  emoji: string;
  sortOrder: number;
  isActive: boolean;
}

// Список эмодзи для выбора
const EMOJI_OPTIONS = [
  { value: '🚚', label: '🚚 Грузовик (доставка)' },
  { value: '💰', label: '💰 Деньги (скидки)' },
  { value: '🏷️', label: '🏷️ Ценник (акции)' },
  { value: '🔥', label: '🔥 Огонь (горячие предложения)' },
  { value: '⭐', label: '⭐ Звезда (топ товары)' },
  { value: '🛠️', label: '🛠️ Инструменты' },
  { value: '🏗️', label: '🏗️ Стройка' },
  { value: '🧱', label: '🧱 Кирпич (материалы)' },
  { value: '🏠', label: '🏠 Дом' },
  { value: '📦', label: '📦 Коробка (товары)' },
  { value: '🎁', label: '🎁 Подарок' },
  { value: '✨', label: '✨ Блеск (новинки)' },
  { value: '💪', label: '💪 Сила (качество)' },
  { value: '🤝', label: '🤝 Рукопожатие (партнёрство)' },
  { value: '📞', label: '📞 Телефон (связь)' },
];

export default function SlidesAdminPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    emoji: '🚚',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/admin/slides');
      const data = await res.json();
      setSlides(data);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (slide?: Slide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title,
        description: slide.description || '',
        buttonText: slide.buttonText || '',
        buttonLink: slide.buttonLink || '',
        emoji: slide.emoji,
        sortOrder: slide.sortOrder,
        isActive: slide.isActive,
      });
    } else {
      setEditingSlide(null);
      setFormData({
        title: '',
        description: '',
        buttonText: '',
        buttonLink: '',
        emoji: '🚚',
        sortOrder: slides.length,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSlide(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingSlide 
        ? `/api/admin/slides/${editingSlide.id}`
        : '/api/admin/slides';
      
      const method = editingSlide ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchSlides();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving slide:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этот слайд?')) return;
    
    try {
      await fetch(`/api/admin/slides/${id}`, { method: 'DELETE' });
      fetchSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
    }
  };

  const toggleActive = async (slide: Slide) => {
    try {
      await fetch(`/api/admin/slides/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...slide, isActive: !slide.isActive }),
      });
      fetchSlides();
    } catch (error) {
      console.error('Error toggling slide:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Слайды главной страницы</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
        >
          <FaPlus />
          Добавить слайд
        </button>
      </div>

      {/* Список слайдов */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Порядок</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Эмодзи</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Заголовок</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Кнопка</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Статус</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {slides.map((slide) => (
              <tr key={slide.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="text-gray-600">{slide.sortOrder}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-3xl">{slide.emoji}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{slide.title}</p>
                    {slide.description && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">{slide.description}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {slide.buttonText && (
                    <span className="text-sm text-gray-600">{slide.buttonText}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(slide)}
                    className={`flex items-center gap-2 text-sm ${
                      slide.isActive ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {slide.isActive ? (
                      <>
                        <FaToggleOn className="text-xl" />
                        Активен
                      </>
                    ) : (
                      <>
                        <FaToggleOff className="text-xl" />
                        Скрыт
                      </>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openModal(slide)}
                      className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {slides.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Слайдов пока нет. Создайте первый!
          </div>
        )}
      </div>

      {/* Модалка создания/редактирования */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSlide ? 'Редактировать слайд' : 'Новый слайд'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Эмодзи */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Эмодзи <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none text-lg"
                  required
                >
                  {EMOJI_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-center">
                  <span className="text-6xl">{formData.emoji}</span>
                </div>
              </div>

              {/* Заголовок */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Заголовок <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                  placeholder="Бесплатная доставка"
                  required
                />
              </div>

              {/* Описание */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none resize-none"
                  rows={3}
                  placeholder="При заказе от 10 000 ₽ доставляем бесплатно по Астрахани и области"
                />
              </div>

              {/* Кнопка */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Текст кнопки
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                    placeholder="Узнать подробнее"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ссылка кнопки
                  </label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                    placeholder="/payment"
                  />
                </div>
              </div>

              {/* Порядок и статус */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Порядок сортировки
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-gray-700">Активен</span>
                  </label>
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
                >
                  {editingSlide ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
