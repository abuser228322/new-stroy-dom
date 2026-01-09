'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPercent, FaTruck, FaGift, FaCalendar, FaTag, FaFire } from 'react-icons/fa';

interface Promotion {
  id: number;
  title: string;
  description: string | null;
  discount: string | null;
  validUntil: string | null;
  image: string | null;
  icon: string;
  color: string;
  link: string | null;
  sortOrder: number;
  isActive: boolean;
}

const ICON_OPTIONS = [
  { value: 'percent', label: 'Процент', icon: <FaPercent /> },
  { value: 'truck', label: 'Доставка', icon: <FaTruck /> },
  { value: 'gift', label: 'Подарок', icon: <FaGift /> },
  { value: 'calendar', label: 'Календарь', icon: <FaCalendar /> },
  { value: 'tag', label: 'Ценник', icon: <FaTag /> },
  { value: 'fire', label: 'Огонь', icon: <FaFire /> },
];

const COLOR_OPTIONS = [
  { value: 'red', label: 'Красный', class: 'bg-red-500' },
  { value: 'green', label: 'Зелёный', class: 'bg-green-500' },
  { value: 'blue', label: 'Синий', class: 'bg-blue-500' },
  { value: 'orange', label: 'Оранжевый', class: 'bg-orange-500' },
  { value: 'purple', label: 'Фиолетовый', class: 'bg-purple-500' },
  { value: 'yellow', label: 'Жёлтый', class: 'bg-yellow-500' },
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'percent': return <FaPercent />;
    case 'truck': return <FaTruck />;
    case 'gift': return <FaGift />;
    case 'calendar': return <FaCalendar />;
    case 'tag': return <FaTag />;
    case 'fire': return <FaFire />;
    default: return <FaPercent />;
  }
};

export default function PromotionsAdminPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    validUntil: '',
    image: '',
    icon: 'percent',
    color: 'red',
    link: '',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/admin/promotions');
      const data = await res.json();
      setPromotions(data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (promo?: Promotion) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        title: promo.title,
        description: promo.description || '',
        discount: promo.discount || '',
        validUntil: promo.validUntil || '',
        image: promo.image || '',
        icon: promo.icon,
        color: promo.color,
        link: promo.link || '',
        sortOrder: promo.sortOrder,
        isActive: promo.isActive,
      });
    } else {
      setEditingPromo(null);
      setFormData({
        title: '',
        description: '',
        discount: '',
        validUntil: '',
        image: '',
        icon: 'percent',
        color: 'red',
        link: '',
        sortOrder: promotions.length,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPromo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPromo 
        ? `/api/admin/promotions/${editingPromo.id}`
        : '/api/admin/promotions';
      
      const method = editingPromo ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchPromotions();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту акцию?')) return;
    
    try {
      await fetch(`/api/admin/promotions/${id}`, { method: 'DELETE' });
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const toggleActive = async (promo: Promotion) => {
    try {
      await fetch(`/api/admin/promotions/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...promo, isActive: !promo.isActive }),
      });
      fetchPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Акции и спецпредложения</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <FaPlus />
          Добавить акцию
        </button>
      </div>

      {/* Список акций */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Порядок</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Иконка</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Название</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Скидка</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Срок</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Статус</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {promotions.map((promo) => (
              <tr key={promo.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="text-gray-600">{promo.sortOrder}</span>
                </td>
                <td className="px-4 py-3">
                  <div className={`w-10 h-10 rounded-lg ${COLOR_OPTIONS.find(c => c.value === promo.color)?.class || 'bg-gray-500'} text-white flex items-center justify-center`}>
                    {getIconComponent(promo.icon)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{promo.title}</p>
                    {promo.description && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">{promo.description}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-red-600">{promo.discount}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-500">{promo.validUntil}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(promo)}
                    className={`flex items-center gap-2 text-sm ${
                      promo.isActive ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {promo.isActive ? (
                      <>
                        <FaToggleOn className="text-xl" />
                        Активна
                      </>
                    ) : (
                      <>
                        <FaToggleOff className="text-xl" />
                        Скрыта
                      </>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openModal(promo)}
                      className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
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

        {promotions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Акций пока нет. Создайте первую!
          </div>
        )}
      </div>

      {/* Модалка создания/редактирования */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPromo ? 'Редактировать акцию' : 'Новая акция'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Название */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                  placeholder="Скидка 10% на сухие смеси"
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
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none resize-none"
                  rows={3}
                  placeholder="Подробное описание акции..."
                />
              </div>

              {/* Скидка и срок */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Скидка / Бонус
                  </label>
                  <input
                    type="text"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                    placeholder="-10%, Бесплатно"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Срок действия
                  </label>
                  <input
                    type="text"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                    placeholder="До конца месяца"
                  />
                </div>
              </div>

              {/* Иконка и цвет */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Иконка
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цвет
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                  >
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Превью иконки */}
              <div className="flex justify-center">
                <div className={`w-16 h-16 rounded-xl ${COLOR_OPTIONS.find(c => c.value === formData.color)?.class || 'bg-gray-500'} text-white flex items-center justify-center text-2xl`}>
                  {getIconComponent(formData.icon)}
                </div>
              </div>

              {/* Ссылка */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ссылка
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                  placeholder="/catalog/suhie-smesi"
                />
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
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
                      className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-gray-700">Активна</span>
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
                  className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                >
                  {editingPromo ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
