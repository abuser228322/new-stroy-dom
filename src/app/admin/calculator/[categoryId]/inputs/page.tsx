'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface CalculatorInput {
  id: number;
  categoryId: number;
  key: string;
  label: string;
  unit: string;
  defaultValue: number;
  minValue: number;
  maxValue: number | null;
  step: number;
  tooltip: string | null;
  sortOrder: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export default function CalculatorInputsPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [inputs, setInputs] = useState<CalculatorInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInput, setEditingInput] = useState<CalculatorInput | null>(null);

  const [formData, setFormData] = useState({
    key: '',
    label: '',
    unit: '',
    defaultValue: 0,
    minValue: 0,
    maxValue: '',
    step: 1,
    tooltip: '',
  });

  useEffect(() => {
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    try {
      const catRes = await fetch(`/api/admin/calculator/categories/${categoryId}`);
      if (catRes.ok) {
        setCategory(await catRes.json());
      }

      const inputsRes = await fetch(`/api/admin/calculator/categories/${categoryId}/inputs`);
      if (inputsRes.ok) {
        setInputs(await inputsRes.json());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingInput
      ? `/api/admin/calculator/categories/${categoryId}/inputs/${editingInput.id}`
      : `/api/admin/calculator/categories/${categoryId}/inputs`;

    const method = editingInput ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxValue: formData.maxValue ? parseFloat(formData.maxValue) : null,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error saving input:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этот параметр?')) return;

    try {
      const res = await fetch(`/api/admin/calculator/categories/${categoryId}/inputs/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting input:', error);
    }
  };

  const handleEdit = (input: CalculatorInput) => {
    setEditingInput(input);
    setFormData({
      key: input.key,
      label: input.label,
      unit: input.unit,
      defaultValue: input.defaultValue,
      minValue: input.minValue,
      maxValue: input.maxValue?.toString() || '',
      step: input.step,
      tooltip: input.tooltip || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingInput(null);
    setFormData({
      key: '',
      label: '',
      unit: '',
      defaultValue: 0,
      minValue: 0,
      maxValue: '',
      step: 1,
      tooltip: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Генерация key из label
  const generateKey = (label: string) => {
    const map: Record<string, string> = {
      'площадь': 'area',
      'длина': 'length',
      'ширина': 'width',
      'высота': 'height',
      'толщина': 'thickness',
      'объем': 'volume',
      'количество': 'quantity',
      'слоев': 'layers',
      'слой': 'layer',
    };

    const lower = label.toLowerCase();
    for (const [ru, en] of Object.entries(map)) {
      if (lower.includes(ru)) return en;
    }
    
    return label
      .toLowerCase()
      .replace(/[а-яё]/g, c => {
        const map: Record<string, string> = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return map[c] || c;
      })
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Навигация */}
      <div className="mb-6">
        <Link href="/admin/calculator" className="text-orange-600 hover:text-orange-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад к категориям
        </Link>
      </div>

      {/* Заголовок */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {category?.icon} {category?.name} — Параметры ввода
          </h1>
          <p className="text-gray-500">Настройка полей ввода для калькулятора</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить параметр
        </button>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ключ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Единица</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">По умолч.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Мин/Макс</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Шаг</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inputs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Нет параметров. Добавьте первый параметр для этой категории.
                </td>
              </tr>
            ) : (
              inputs.map((input, index) => (
                <tr key={input.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{input.key}</code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{input.label}</div>
                    {input.tooltip && (
                      <div className="text-xs text-gray-500">{input.tooltip}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{input.unit || '—'}</td>
                  <td className="px-4 py-3 font-medium">{input.defaultValue}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {input.minValue} — {input.maxValue ?? '∞'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{input.step}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(input)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Редактировать"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(input.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Удалить"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingInput ? 'Редактировать параметр' : 'Добавить параметр'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название (label) *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    setFormData({ 
                      ...formData, 
                      label,
                      key: formData.key || generateKey(label)
                    });
                  }}
                  required
                  placeholder="Например: Площадь поверхности"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ключ (key) *
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  required
                  placeholder="Например: area"
                  className="w-full border rounded-lg px-3 py-2 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Используется в формулах. Только латиница и нижние подчеркивания.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Единица измерения
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="м², шт, мм"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Значение по умолч.
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.defaultValue}
                    onChange={(e) => setFormData({ ...formData, defaultValue: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Минимум
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.minValue}
                    onChange={(e) => setFormData({ ...formData, minValue: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Максимум
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.maxValue}
                    onChange={(e) => setFormData({ ...formData, maxValue: e.target.value })}
                    placeholder="Не ограничен"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Шаг
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.step}
                    onChange={(e) => setFormData({ ...formData, step: parseFloat(e.target.value) || 1 })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Подсказка
                </label>
                <textarea
                  value={formData.tooltip}
                  onChange={(e) => setFormData({ ...formData, tooltip: e.target.value })}
                  rows={2}
                  placeholder="Дополнительная информация для пользователя"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {editingInput ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
