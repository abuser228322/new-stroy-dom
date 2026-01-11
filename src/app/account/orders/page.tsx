'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

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

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  deliveryType: string;
  paymentMethod: string;
  subtotal: string;
  deliveryPrice: string;
  discount: string;
  total: string;
  customerComment: string | null;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  items: OrderItem[];
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: 'Ожидает подтверждения', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { text: 'Подтверждён', color: 'bg-blue-100 text-blue-800' },
  processing: { text: 'В обработке', color: 'bg-indigo-100 text-indigo-800' },
  ready: { text: 'Готов к выдаче', color: 'bg-cyan-100 text-cyan-800' },
  delivering: { text: 'В доставке', color: 'bg-purple-100 text-purple-800' },
  completed: { text: 'Завершён', color: 'bg-green-100 text-green-800' },
  cancelled: { text: 'Отменён', color: 'bg-red-100 text-red-800' },
};

const DELIVERY_LABELS: Record<string, string> = {
  pickup_rybinskaya: 'Самовывоз: ул. Рыбинская 25Н',
  pickup_svobody: 'Самовывоз: пл. Свободы 14К',
  delivery: 'Доставка',
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Наличными',
  card: 'Картой',
  online: 'Онлайн',
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/account/orders');
    }
  }, [isAuthenticated, isLoading, router]);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);
  
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) {
        throw new Error('Ошибка загрузки заказов');
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Вы уверены, что хотите отменить заказ?')) return;
    
    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка отмены заказа');
      }
      
      // Обновляем список
      await fetchOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка отмены заказа');
    } finally {
      setCancellingId(null);
    }
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('ru-RU').format(Number(price));
  };
  
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/account"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Мои заказы</h1>
          </div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            В корзину
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">У вас пока нет заказов</h2>
            <p className="text-gray-500 mb-6">Выберите товары в каталоге и оформите заказ</p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = STATUS_LABELS[order.status] || { text: order.status, color: 'bg-gray-100 text-gray-800' };
              const isExpanded = expandedOrder === order.id;
              const canCancel = ['pending', 'confirmed'].includes(order.status);
              
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Шапка заказа */}
                  <div
                    className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-semibold text-gray-900">
                            Заказ {order.orderNumber}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          {order.items.length} {order.items.length === 1 ? 'товар' : order.items.length < 5 ? 'товара' : 'товаров'}
                          {' · '}
                          {DELIVERY_LABELS[order.deliveryType]}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(order.total)} ₽
                        </p>
                        <svg
                          className={`w-5 h-5 text-gray-400 mt-2 mx-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Детали заказа */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 sm:p-6">
                      {/* Товары */}
                      <div className="space-y-3 mb-6">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{item.title}</p>
                              <p className="text-sm text-gray-500">
                                {item.quantity} {item.unit || 'шт'} × {formatPrice(item.price)} ₽
                                {item.size && <span className="ml-2">({item.size})</span>}
                              </p>
                            </div>
                            <p className="font-medium text-gray-900 shrink-0">
                              {formatPrice(item.total)} ₽
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      {/* Итоги */}
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm mb-6">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Товары</span>
                          <span className="text-gray-900">{formatPrice(order.subtotal)} ₽</span>
                        </div>
                        {Number(order.deliveryPrice) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Доставка</span>
                            <span className="text-gray-900">{formatPrice(order.deliveryPrice)} ₽</span>
                          </div>
                        )}
                        {Number(order.discount) > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Скидка</span>
                            <span>−{formatPrice(order.discount)} ₽</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-base">
                          <span>Итого</span>
                          <span>{formatPrice(order.total)} ₽</span>
                        </div>
                      </div>
                      
                      {/* Информация */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
                        <div>
                          <p className="text-gray-500 mb-1">Способ получения</p>
                          <p className="text-gray-900">{DELIVERY_LABELS[order.deliveryType]}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Способ оплаты</p>
                          <p className="text-gray-900">{PAYMENT_LABELS[order.paymentMethod]}</p>
                        </div>
                      </div>
                      
                      {order.customerComment && (
                        <div className="bg-amber-50 rounded-xl p-4 text-sm mb-6">
                          <p className="text-amber-800 font-medium mb-1">Комментарий к заказу</p>
                          <p className="text-amber-700">{order.customerComment}</p>
                        </div>
                      )}
                      
                      {order.cancelReason && (
                        <div className="bg-red-50 rounded-xl p-4 text-sm mb-6">
                          <p className="text-red-800 font-medium mb-1">Причина отмены</p>
                          <p className="text-red-700">{order.cancelReason}</p>
                        </div>
                      )}
                      
                      {/* Действия */}
                      {canCancel && (
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelOrder(order.id);
                            }}
                            disabled={cancellingId === order.id}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {cancellingId === order.id ? 'Отмена...' : 'Отменить заказ'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
