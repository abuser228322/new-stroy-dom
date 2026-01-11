'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface OrderItem {
  id: number;
  urlId: string;
  title: string;
  image: string | null;
  quantity: number;
  price: string;
  size: string | null;
  unit: string | null;
  total: string;
}

interface User {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
}

interface Order {
  id: number;
  orderNumber: string;
  userId: number | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  status: string;
  deliveryType: string;
  paymentMethod: string;
  deliveryAddress: string | null;
  deliveryComment: string | null;
  subtotal: string;
  deliveryPrice: string;
  discount: string;
  total: string;
  couponCode: string | null;
  customerComment: string | null;
  adminComment: string | null;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  items: OrderItem[];
  user: User | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: 'Ожидает', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { text: 'Подтверждён', color: 'bg-blue-100 text-blue-800' },
  processing: { text: 'В обработке', color: 'bg-indigo-100 text-indigo-800' },
  ready: { text: 'Готов', color: 'bg-cyan-100 text-cyan-800' },
  delivering: { text: 'Доставка', color: 'bg-purple-100 text-purple-800' },
  completed: { text: 'Завершён', color: 'bg-green-100 text-green-800' },
  cancelled: { text: 'Отменён', color: 'bg-red-100 text-red-800' },
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Ожидает подтверждения' },
  { value: 'confirmed', label: 'Подтверждён' },
  { value: 'processing', label: 'В обработке' },
  { value: 'ready', label: 'Готов к выдаче' },
  { value: 'delivering', label: 'В доставке' },
  { value: 'completed', label: 'Завершён' },
  { value: 'cancelled', label: 'Отменён' },
];

const DELIVERY_LABELS: Record<string, string> = {
  pickup_rybinskaya: 'Рыбинская 25Н',
  pickup_svobody: 'пл. Свободы 14К',
  delivery: 'Доставка',
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Наличные',
  card: 'Карта',
  online: 'Онлайн',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Фильтры
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Модальное окно деталей
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '20');
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);
      
      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error('Ошибка загрузки заказов');
      
      const data = await res.json();
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, search]);
  
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };
  
  const openOrderDetails = async (order: Order) => {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`);
      if (!res.ok) throw new Error('Ошибка загрузки');
      const fullOrder = await res.json();
      setSelectedOrder(fullOrder);
      setIsModalOpen(true);
    } catch (err) {
      alert('Ошибка загрузки заказа');
    }
  };
  
  const updateOrderStatus = async (orderId: number, newStatus: string, cancelReason?: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          cancelReason: newStatus === 'cancelled' ? cancelReason : undefined
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка обновления');
      }
      
      const updatedOrder = await res.json();
      setSelectedOrder(updatedOrder);
      
      // Обновляем список
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setUpdating(false);
    }
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('ru-RU').format(Number(price));
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Заказы</h1>
        <div className="text-sm text-gray-500">
          Всего: {pagination?.total || 0}
        </div>
      </div>
      
      {/* Фильтры */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Все статусы</option>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Номер, имя, телефон..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="self-end px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Найти
            </button>
          </form>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
      )}
      
      {/* Таблица заказов */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Заказы не найдены
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">№ Заказа</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Покупатель</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Получение</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Сумма</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const statusInfo = STATUS_LABELS[order.status] || { text: order.status, color: 'bg-gray-100' };
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-medium text-gray-900">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {DELIVERY_LABELS[order.deliveryType]}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatPrice(order.total)} ₽
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                      >
                        Подробнее
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        
        {/* Пагинация */}
        {pagination && pagination.pages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Страница {pagination.page} из {pagination.pages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                ← Назад
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                disabled={currentPage === pagination.pages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Вперёд →
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Модальное окно деталей заказа */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Заказ {selectedOrder.orderNumber}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Статус и управление */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">Статус</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_LABELS[selectedOrder.status]?.color || 'bg-gray-100'}`}>
                    {STATUS_LABELS[selectedOrder.status]?.text || selectedOrder.status}
                  </span>
                </div>
                {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                        disabled={updating}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
                      >
                        Подтвердить
                      </button>
                    )}
                    {selectedOrder.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                        disabled={updating}
                        className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 disabled:opacity-50"
                      >
                        В обработку
                      </button>
                    )}
                    {selectedOrder.status === 'processing' && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                        disabled={updating}
                        className="px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600 disabled:opacity-50"
                      >
                        Готов
                      </button>
                    )}
                    {selectedOrder.status === 'ready' && selectedOrder.deliveryType === 'delivery' && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'delivering')}
                        disabled={updating}
                        className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 disabled:opacity-50"
                      >
                        В доставку
                      </button>
                    )}
                    {(selectedOrder.status === 'ready' || selectedOrder.status === 'delivering') && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                        disabled={updating}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
                      >
                        Завершить
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const reason = prompt('Причина отмены:');
                        if (reason !== null) {
                          updateOrderStatus(selectedOrder.id, 'cancelled', reason);
                        }
                      }}
                      disabled={updating}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 disabled:opacity-50"
                    >
                      Отменить
                    </button>
                  </div>
                )}
              </div>
              
              {/* Покупатель */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Покупатель</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                  <p className="text-gray-600">
                    <a href={`tel:${selectedOrder.customerPhone}`} className="text-blue-600 hover:underline">
                      {selectedOrder.customerPhone}
                    </a>
                  </p>
                  {selectedOrder.customerEmail && (
                    <p className="text-gray-600">{selectedOrder.customerEmail}</p>
                  )}
                  {selectedOrder.user && (
                    <p className="text-sm text-gray-500">
                      Зарегистрирован: @{selectedOrder.user.username}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Получение и оплата */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Получение</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-medium text-gray-900">{DELIVERY_LABELS[selectedOrder.deliveryType]}</p>
                    {selectedOrder.deliveryAddress && (
                      <p className="text-gray-600 mt-1 text-sm">{selectedOrder.deliveryAddress}</p>
                    )}
                    {selectedOrder.deliveryComment && (
                      <p className="text-gray-500 mt-1 text-sm">{selectedOrder.deliveryComment}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Оплата</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-medium text-gray-900">{PAYMENT_LABELS[selectedOrder.paymentMethod]}</p>
                    {selectedOrder.couponCode && (
                      <p className="text-green-600 mt-1 text-sm">Купон: {selectedOrder.couponCode}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Товары */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Товары</h3>
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-0">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                        {item.image && (
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} {item.unit || 'шт'} × {formatPrice(item.price)} ₽
                          {item.size && ` · ${item.size}`}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 shrink-0">
                        {formatPrice(item.total)} ₽
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Итого */}
              <div className="bg-orange-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Товары</span>
                  <span>{formatPrice(selectedOrder.subtotal)} ₽</span>
                </div>
                {Number(selectedOrder.deliveryPrice) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Доставка</span>
                    <span>{formatPrice(selectedOrder.deliveryPrice)} ₽</span>
                  </div>
                )}
                {Number(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Скидка</span>
                    <span>−{formatPrice(selectedOrder.discount)} ₽</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-orange-200">
                  <span>Итого</span>
                  <span>{formatPrice(selectedOrder.total)} ₽</span>
                </div>
              </div>
              
              {/* Комментарии */}
              {(selectedOrder.customerComment || selectedOrder.cancelReason) && (
                <div className="space-y-3">
                  {selectedOrder.customerComment && (
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-sm font-medium text-amber-800 mb-1">Комментарий покупателя</p>
                      <p className="text-amber-700 text-sm">{selectedOrder.customerComment}</p>
                    </div>
                  )}
                  {selectedOrder.cancelReason && (
                    <div className="bg-red-50 rounded-xl p-4">
                      <p className="text-sm font-medium text-red-800 mb-1">Причина отмены</p>
                      <p className="text-red-700 text-sm">{selectedOrder.cancelReason}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Даты */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Создан: {formatDate(selectedOrder.createdAt)}</p>
                {selectedOrder.confirmedAt && <p>Подтверждён: {formatDate(selectedOrder.confirmedAt)}</p>}
                {selectedOrder.completedAt && <p>Завершён: {formatDate(selectedOrder.completedAt)}</p>}
                {selectedOrder.cancelledAt && <p>Отменён: {formatDate(selectedOrder.cancelledAt)}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
