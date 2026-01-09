'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Coupon {
  id: number;
  code: string;
  description: string | null;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  userUsageLimit: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCoupons = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (search) params.set('search', search);
      
      const res = await fetch(`/api/admin/coupons?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setCoupons(data.coupons);
        setPagination(data.pagination);
      } else {
        setMessage({ type: 'error', text: data.error || 'Ошибка загрузки' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка соединения' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCoupons(1);
  };

  const handleCreateCoupon = async (data: Partial<Coupon>) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Купон создан' });
        setShowCreateModal(false);
        fetchCoupons(1);
      } else {
        setMessage({ type: 'error', text: result.error || 'Ошибка создания' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка соединения' });
    }
  };

  const handleUpdateCoupon = async (couponId: number, data: Partial<Coupon>) => {
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Купон обновлён' });
        setEditingCoupon(null);
        fetchCoupons(pagination?.page || 1);
      } else {
        setMessage({ type: 'error', text: result.error || 'Ошибка обновления' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка соединения' });
    }
  };

  const handleDeleteCoupon = async (couponId: number) => {
    if (!confirm('Удалить этот купон?')) return;
    
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Купон удалён' });
        fetchCoupons(pagination?.page || 1);
      } else {
        const result = await res.json();
        setMessage({ type: 'error', text: result.error || 'Ошибка удаления' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка соединения' });
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    await handleUpdateCoupon(coupon.id, { isActive: !coupon.isActive });
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percent') {
      return `${coupon.discountValue}%`;
    }
    return `${coupon.discountValue} ₽`;
  };

  const isCouponExpired = (coupon: Coupon) => {
    if (!coupon.validUntil) return false;
    return new Date(coupon.validUntil) < new Date();
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Купоны</h1>
          <p className="text-gray-500 mt-1">Система скидок и промокодов</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin" className="text-sky-600 hover:text-sky-700 font-medium">
            ← Назад
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            + Создать купон
          </button>
        </div>
      </div>
      
      {/* Уведомление */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-600' : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="float-right font-bold">×</button>
        </div>
      )}
      
      {/* Поиск */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по коду или описанию..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
          >
            Найти
          </button>
        </form>
      </div>
      
      {/* Таблица купонов */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Купоны не найдены
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Код
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Скидка
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Использований
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Срок действия
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-bold text-gray-900">{coupon.code}</div>
                      {coupon.description && (
                        <div className="text-sm text-gray-500">{coupon.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">{formatDiscount(coupon)}</div>
                      {coupon.minOrderAmount && (
                        <div className="text-xs text-gray-500">от {coupon.minOrderAmount} ₽</div>
                      )}
                      {coupon.maxDiscountAmount && (
                        <div className="text-xs text-gray-500">макс. {coupon.maxDiscountAmount} ₽</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.usedCount} / {coupon.usageLimit || '∞'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {coupon.userUsageLimit} на пользователя
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {coupon.validFrom && (
                        <div>от {new Date(coupon.validFrom).toLocaleDateString('ru-RU')}</div>
                      )}
                      {coupon.validUntil && (
                        <div className={isCouponExpired(coupon) ? 'text-red-500' : ''}>
                          до {new Date(coupon.validUntil).toLocaleDateString('ru-RU')}
                        </div>
                      )}
                      {!coupon.validFrom && !coupon.validUntil && '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isCouponExpired(coupon) ? (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Истёк
                        </span>
                      ) : (
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {coupon.isActive ? 'Активен' : 'Отключён'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingCoupon(coupon)}
                        className="text-sky-600 hover:text-sky-900 mr-3"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={coupon.isActive ? 'text-orange-600 hover:text-orange-900 mr-3' : 'text-green-600 hover:text-green-900 mr-3'}
                      >
                        {coupon.isActive ? 'Выкл' : 'Вкл'}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Пагинация */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Показано {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total}
            </div>
            <div className="flex gap-2">
              {pagination.page > 1 && (
                <button
                  onClick={() => fetchCoupons(pagination.page - 1)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                >
                  ← Назад
                </button>
              )}
              {pagination.page < pagination.totalPages && (
                <button
                  onClick={() => fetchCoupons(pagination.page + 1)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                >
                  Вперёд →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Модальное окно создания */}
      {showCreateModal && (
        <CouponModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateCoupon}
        />
      )}
      
      {/* Модальное окно редактирования */}
      {editingCoupon && (
        <CouponModal
          coupon={editingCoupon}
          onClose={() => setEditingCoupon(null)}
          onSave={(data) => handleUpdateCoupon(editingCoupon.id, data)}
        />
      )}
    </div>
  );
}

function CouponModal({ 
  coupon, 
  onClose, 
  onSave 
}: { 
  coupon?: Coupon; 
  onClose: () => void; 
  onSave: (data: Partial<Coupon>) => void;
}) {
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    description: coupon?.description || '',
    discountType: coupon?.discountType || 'percent' as 'percent' | 'fixed',
    discountValue: coupon?.discountValue || 0,
    minOrderAmount: coupon?.minOrderAmount || '',
    maxDiscountAmount: coupon?.maxDiscountAmount || '',
    usageLimit: coupon?.usageLimit || '',
    userUsageLimit: coupon?.userUsageLimit || 1,
    validFrom: coupon?.validFrom ? coupon.validFrom.split('T')[0] : '',
    validUntil: coupon?.validUntil ? coupon.validUntil.split('T')[0] : '',
    isActive: coupon?.isActive !== false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...formData,
      minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : null,
      maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      validFrom: formData.validFrom || null,
      validUntil: formData.validUntil || null,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {coupon ? 'Редактировать купон' : 'Создать купон'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Код купона *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono uppercase"
              placeholder="SALE2024"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Скидка на всё"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип скидки *</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as 'percent' | 'fixed' }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="percent">Процент (%)</option>
                <option value="fixed">Фиксированная (₽)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Значение *</label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                min="0"
                max={formData.discountType === 'percent' ? 100 : undefined}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Мин. сумма заказа</label>
              <input
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Макс. скидка</label>
              <input
                type="number"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, maxDiscountAmount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Без ограничений"
                min="0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Лимит использований</label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Без лимита"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">На пользователя</label>
              <input
                type="number"
                value={formData.userUsageLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, userUsageLimit: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                min="1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Действует с</label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Действует до</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Активен
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : (coupon ? 'Сохранить' : 'Создать')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
