'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaCalculator, FaBox, FaListUl, FaCog } from 'react-icons/fa';

interface CalculatorCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    products: number;
    inputs: number;
  };
}

export default function CalculatorAdminPage() {
  const [categories, setCategories] = useState<CalculatorCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CalculatorCategory | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    description: '',
    icon: '📦',
    isActive: true,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/calculator/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory 
        ? `/api/admin/calculator/categories/${editingCategory.id}`
        : '/api/admin/calculator/categories';
      
      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ slug: '', name: '', description: '', icon: '📦', isActive: true });
        fetchCategories();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить категорию и все её продукты?')) return;
    
    try {
      const res = await fetch(`/api/admin/calculator/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleMove = async (id: number, direction: 'up' | 'down') => {
    try {
      await fetch(`/api/admin/calculator/categories/${id}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });
      fetchCategories();
    } catch (error) {
      console.error('Error moving category:', error);
    }
  };

  const openEditModal = (category: CalculatorCategory) => {
    setEditingCategory(category);
    setFormData({
      slug: category.slug,
      name: category.name,
      description: category.description || '',
      icon: category.icon || '📦',
      isActive: category.isActive,
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ slug: '', name: '', description: '', icon: '📦', isActive: true });
    setIsModalOpen(true);
  };

  const emojiOptions = ['🧱', '🎨', '🔲', '🏠', '🖌️', '💧', '📐', '📋', '🧊', '🔧', '📦', '🪵'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
            <FaCalculator className="text-sky-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Калькулятор материалов</h1>
            <p className="text-sm text-gray-500">Управление категориями и продуктами калькулятора</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
        >
          <FaPlus />
          Добавить категорию
        </button>
      </div>

      {/* Список категорий */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Порядок</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Категория</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Slug</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Продукты</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Поля</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Статус</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category, index) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(category.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <FaArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => handleMove(category.id, 'down')}
                      disabled={index === categories.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <FaArrowDown size={12} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">{category.slug}</code>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/admin/calculator/${category.id}/products`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 text-sky-600 rounded hover:bg-sky-100 transition-colors"
                  >
                    <FaBox size={12} />
                    {category._count?.products || 0}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/admin/calculator/${category.id}/inputs`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded hover:bg-amber-100 transition-colors"
                  >
                    <FaListUl size={12} />
                    {category._count?.inputs || 0}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {category.isActive ? 'Активна' : 'Скрыта'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/calculator/${category.id}/formula`}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Настройка формулы"
                    >
                      <FaCog size={16} />
                    </Link>
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <FaCalculator className="mx-auto text-4xl mb-3 text-gray-300" />
            <p>Категории калькулятора не найдены</p>
            <button
              onClick={openCreateModal}
              className="mt-3 text-sky-600 hover:underline"
            >
              Добавить первую категорию
            </button>
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCategory ? 'Редактировать категорию' : 'Новая категория'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Иконка</label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                      className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                        formData.icon === emoji 
                          ? 'border-sky-500 bg-sky-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  placeholder="Штукатурка"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  placeholder="plaster"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  rows={2}
                  placeholder="Расчёт гипсовой или цементной штукатурки"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-sky-600 rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">Активна</label>
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  {editingCategory ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
