'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { getCategorySlug, getSubcategorySlug } from '../mock/products';

const CONTACT_INFO = {
  phone: '8-937-133-33-66',
  phoneClean: '+79371333366',
};

interface AppliedCoupon {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxDiscountAmount: number | null;
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalAmount, totalItems, clearCart } = useCart();
  const [isCheckout, setIsCheckout] = useState(false);
  const [orderData, setOrderData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    comment: '',
    delivery: 'pickup', // pickup | delivery
    payment: 'cash', // cash | card | transfer
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // Купон
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Расчёт скидки по купону
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    if (appliedCoupon.discountType === 'percent') {
      const discount = totalAmount * (appliedCoupon.discountValue / 100);
      // Учитываем максимальную скидку
      if (appliedCoupon.maxDiscountAmount) {
        return Math.min(discount, appliedCoupon.maxDiscountAmount);
      }
      return discount;
    } else {
      return Math.min(appliedCoupon.discountValue, totalAmount);
    }
  };

  const discountAmount = calculateDiscount();
  const finalAmount = totalAmount - discountAmount;

  // Применение купона
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Введите код купона');
      return;
    }
    
    setCouponLoading(true);
    setCouponError('');
    
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: couponCode.trim().toUpperCase(),
          orderAmount: totalAmount 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
          maxDiscountAmount: data.coupon.maxDiscountAmount,
        });
        setCouponCode('');
      } else {
        setCouponError(data.error || 'Недействительный купон');
      }
    } catch {
      setCouponError('Ошибка проверки купона');
    } finally {
      setCouponLoading(false);
    }
  };

  // Удаление купона
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Имитация отправки заказа
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // TODO: Отправить заказ на сервер
    console.log('Order:', { items, orderData, totalAmount });

    setIsSubmitting(false);
    setOrderSuccess(true);
    clearCart();
  };

  // Успешный заказ
  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Заказ оформлен!</h1>
          <p className="text-gray-600 mb-8">
            Спасибо за заказ. Мы свяжемся с вами в ближайшее время для подтверждения.
          </p>
          <div className="space-y-3">
            <Link
              href="/catalog"
              className="block w-full py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-cyan-600 transition-all shadow-lg shadow-sky-500/30"
            >
              Продолжить покупки
            </Link>
            <Link
              href="/"
              className="block w-full py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              На главную
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Пустая корзина
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Корзина</h1>
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Корзина пуста</h2>
            <p className="text-gray-600 mb-8">
              Добавьте товары из каталога, чтобы оформить заказ
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-cyan-600 transition-all shadow-lg shadow-sky-500/30"
            >
              Перейти в каталог
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Хлебные крошки */}
      <nav className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-sky-600 transition-colors">
                Главная
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-900 font-medium">Корзина</li>
          </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Корзина <span className="text-gray-400 font-normal">({totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'})</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Список товаров */}
          <div className="grow space-y-4">
            {items.map((item) => {
              const categorySlug = getCategorySlug(item.mainCategory);
              const subcategorySlug = getSubcategorySlug(item.subCategory);
              const productLink = `/catalog/${categorySlug}/${subcategorySlug}/${item.urlId}`;
              
              return (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3 sm:gap-5">
                    {/* Изображение */}
                    <Link
                      href={productLink}
                      className="relative w-16 h-16 sm:w-24 sm:h-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={item.image || '/images/placeholder.jpg'}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </Link>

                    {/* Информация */}
                    <div className="grow min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={productLink}
                          className="font-semibold text-gray-900 hover:text-sky-600 transition-colors text-sm sm:text-base line-clamp-2"
                        >
                          {item.title}
                        </Link>
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                          aria-label="Удалить"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {item.size && item.size !== 'Стандарт' && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Размер: {item.size}</p>
                      )}
                      <p className="text-base sm:text-lg font-bold text-gray-900 mt-1 sm:mt-2">
                        {formatPrice(item.price)} ₽
                      </p>
                    </div>
                  </div>

                  {/* Количество и сумма - отдельная строка */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    <p className="text-sm sm:text-base font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)} ₽
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Кнопка очистки */}
            <button
              onClick={clearCart}
              className="text-gray-500 hover:text-red-500 text-sm transition-colors"
            >
              Очистить корзину
            </button>
          </div>

          {/* Боковая панель */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              {!isCheckout ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Итого</h2>
                  
                  {/* Купон */}
                  <div className="mb-6">
                    {appliedCoupon ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium text-green-800">{appliedCoupon.code}</span>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Скидка: {appliedCoupon.discountType === 'percent' 
                            ? `${appliedCoupon.discountValue}%` 
                            : `${formatPrice(appliedCoupon.discountValue)} ₽`}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Промокод
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              setCouponError('');
                            }}
                            placeholder="Введите код"
                            className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                              couponError ? 'border-red-300' : 'border-gray-200'
                            }`}
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={couponLoading}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 text-sm"
                          >
                            {couponLoading ? '...' : 'Применить'}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-sm text-red-500 mt-1">{couponError}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Товаров:</span>
                      <span>{totalItems} шт.</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Сумма:</span>
                      <span>{formatPrice(totalAmount)} ₽</span>
                    </div>
                    {appliedCoupon && discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Скидка:</span>
                        <span>-{formatPrice(discountAmount)} ₽</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-100 flex justify-between text-lg font-bold text-gray-900">
                      <span>К оплате:</span>
                      <span>{formatPrice(finalAmount)} ₽</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCheckout(true)}
                    className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
                  >
                    Оформить заказ
                  </button>

                  <p className="text-sm text-gray-500 text-center mt-4">
                    Или позвоните нам:{' '}
                    <a href={`tel:${CONTACT_INFO.phoneClean}`} className="text-primary font-semibold">
                      {CONTACT_INFO.phone}
                    </a>
                  </p>
                </>
              ) : (
                <form onSubmit={handleSubmitOrder}>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Оформление заказа</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ваше имя *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={orderData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="Иван Иванов"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={orderData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={orderData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Способ получения
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setOrderData((prev) => ({ ...prev, delivery: 'pickup' }))}
                          className={`py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                            orderData.delivery === 'pickup'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          Самовывоз
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderData((prev) => ({ ...prev, delivery: 'delivery' }))}
                          className={`py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                            orderData.delivery === 'delivery'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          Доставка
                        </button>
                      </div>
                    </div>

                    {orderData.delivery === 'delivery' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Адрес доставки *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={orderData.address}
                          onChange={handleInputChange}
                          required={orderData.delivery === 'delivery'}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                          placeholder="ул. Ленина, д. 1, кв. 1"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Способ оплаты
                      </label>
                      <select
                        name="payment"
                        value={orderData.payment}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      >
                        <option value="cash">Наличными</option>
                        <option value="card">Картой</option>
                        <option value="transfer">Переводом</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Комментарий
                      </label>
                      <textarea
                        name="comment"
                        value={orderData.comment}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Дополнительная информация..."
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-gray-600">
                        <span>Сумма:</span>
                        <span>{formatPrice(totalAmount)} ₽</span>
                      </div>
                      {appliedCoupon && discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Скидка ({appliedCoupon.code}):</span>
                          <span>-{formatPrice(discountAmount)} ₽</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                        <span>К оплате:</span>
                        <span>{formatPrice(finalAmount)} ₽</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-success text-white font-semibold rounded-xl hover:bg-success/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Оформляем...
                        </>
                      ) : (
                        'Подтвердить заказ'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCheckout(false)}
                      className="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
                    >
                      ← Вернуться к корзине
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
