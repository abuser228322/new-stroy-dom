'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Store {
  id: number;
  slug: string;
  name: string;
  shortName: string | null;
  address: string;
  phone: string | null;
  workingHours: {
    monSat: string;
    sun: string;
  } | null;
  assortmentDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Модальное окно редактирования
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Форма редактирования
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    address: '',
    phone: '',
    monSat: '',
    sun: '',
    assortmentDescription: '',
    isActive: true,
    sortOrder: 0,
  });
  
  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stores');
      if (!res.ok) throw new Error('Ошибка загрузки магазинов');
      
      const data = await res.json();
      setStores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);
  
  const openEditModal = (store: Store) => {
    setSelectedStore(store);
    setFormData({
      name: store.name,
      shortName: store.shortName || '',
      address: store.address,
      phone: store.phone || '',
      monSat: store.workingHours?.monSat || '',
      sun: store.workingHours?.sun || '',
      assortmentDescription: store.assortmentDescription || '',
      isActive: store.isActive,
      sortOrder: store.sortOrder,
    });
    setSaveMessage(null);
    setIsModalOpen(true);
  };
  
  const handleSave = async () => {
    if (!selectedStore) return;
    
    setSaving(true);
    setSaveMessage(null);
    
    try {
      const res = await fetch(`/api/admin/stores/${selectedStore.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          shortName: formData.shortName || null,
          address: formData.address,
          phone: formData.phone || null,
          workingHours: {
            monSat: formData.monSat,
            sun: formData.sun,
          },
          assortmentDescription: formData.assortmentDescription || null,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка сохранения');
      }
      
      const updatedStore = await res.json();
      setStores(prev => prev.map(s => s.id === updatedStore.id ? updatedStore : s));
      setSaveMessage({ type: 'success', text: 'Магазин успешно обновлён!' });
      
      // Закрыть модалку через 1.5 секунды
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedStore(null);
      }, 1500);
    } catch (err) {
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Ошибка' });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Магазины</h1>
          <p className="text-sm text-gray-500 mt-1">Управление точками продаж</p>
        </div>
        <Link
          href="/admin"
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Назад
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
      )}
      
      {/* Список магазинов */}
      <div className="grid gap-4">
        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            Магазины не найдены
          </div>
        ) : (
          stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">{store.name}</h2>
                    {!store.isActive && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        Неактивен
                      </span>
                    )}
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Адрес</p>
                      <p className="text-gray-900">{store.address}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Телефон</p>
                      <p className="text-gray-900">{store.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">График работы</p>
                      {store.workingHours ? (
                        <div className="text-gray-900">
                          <p>Пн-Сб: {store.workingHours.monSat}</p>
                          <p>Вс: {store.workingHours.sun}</p>
                        </div>
                      ) : (
                        <p className="text-gray-400">Не указан</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-500">Ассортимент</p>
                      <p className="text-gray-900 line-clamp-2">
                        {store.assortmentDescription || '—'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => openEditModal(store)}
                  className="ml-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  Редактировать
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Модальное окно редактирования */}
      {isModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Редактировать магазин</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {saveMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  saveMessage.type === 'success' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {saveMessage.text}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Краткое название
                </label>
                <input
                  type="text"
                  value={formData.shortName}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Рыбинская"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Адрес
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="+79371333366"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Пн-Сб
                  </label>
                  <input
                    type="text"
                    value={formData.monSat}
                    onChange={(e) => setFormData(prev => ({ ...prev, monSat: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="08:00-16:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Воскресенье
                  </label>
                  <input
                    type="text"
                    value={formData.sun}
                    onChange={(e) => setFormData(prev => ({ ...prev, sun: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="08:00-14:00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание ассортимента
                </label>
                <textarea
                  value={formData.assortmentDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, assortmentDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Стройматериалы: смеси, профили..."
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Активен</span>
                </label>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Порядок:</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
