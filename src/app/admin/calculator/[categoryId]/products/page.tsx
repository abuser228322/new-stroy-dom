'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface CalculatorProduct {
  id: number;
  categoryId: number;
  productId: number | null;
  name: string;
  consumption: number;
  consumptionUnit: string;
  bagWeight: number | null;
  price: number;
  tooltip: string | null;
  productUrlId: string | null;
  sortOrder: number;
  linkedProductName?: string | null;
  linkedProductPrice?: number | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface CatalogProduct {
  id: number;
  name: string;
  price: number;
  urlId: string;
}

export default function CalculatorProductsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<CalculatorProduct[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CalculatorProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    consumption: 0,
    consumptionUnit: 'кг/м²',
    bagWeight: '',
    price: 0,
    tooltip: '',
    productUrlId: '',
    productId: '',
  });

  useEffect(() => {
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    try {
      // Загружаем категорию
      const catRes = await fetch(`/api/admin/calculator/categories/${categoryId}`);
      if (catRes.ok) {
        setCategory(await catRes.json());
      }

      // Загружаем продукты калькулятора
      const prodsRes = await fetch(`/api/admin/calculator/categories/${categoryId}/products`);
      if (prodsRes.ok) {
        setProducts(await prodsRes.json());
      }

      // Загружаем продукты из каталога для связывания
      const catalogRes = await fetch('/api/products?limit=500');
      if (catalogRes.ok) {
        const data = await catalogRes.json();
        setCatalogProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingProduct
      ? `/api/admin/calculator/categories/${categoryId}/products/${editingProduct.id}`
      : `/api/admin/calculator/categories/${categoryId}/products`;

    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bagWeight: formData.bagWeight ? parseFloat(formData.bagWeight) : null,
          productId: formData.productId ? parseInt(formData.productId) : null,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этот продукт?')) return;

    try {
      const res = await fetch(`/api/admin/calculator/categories/${categoryId}/products/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (product: CalculatorProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      consumption: product.consumption,
      consumptionUnit: product.consumptionUnit,
      bagWeight: product.bagWeight?.toString() || '',
      price: product.price,
      tooltip: product.tooltip || '',
      productUrlId: product.productUrlId || '',
      productId: product.productId?.toString() || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      consumption: 0,
      consumptionUnit: 'кг/м²',
      bagWeight: '',
      price: 0,
      tooltip: '',
      productUrlId: '',
      productId: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const selectCatalogProduct = (product: CatalogProduct) => {
    setFormData(prev => ({
      ...prev,
      name: product.name,
      price: product.price,
      productUrlId: product.urlId,
      productId: product.id.toString(),
    }));
    setSearchTerm('');
  };

  const filteredCatalogProducts = searchTerm
    ? catalogProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10)
    : [];

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
            {category?.icon} {category?.name} — Продукты
          </h1>
          <p className="text-gray-500">Управление продуктами калькулятора</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить продукт
        </button>
      </div>

      {/* Таблица продуктов */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Расход</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Фасовка</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Связь с каталогом</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Нет продуктов. Добавьте первый продукт для этой категории.
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{product.name}</div>
                    {product.tooltip && (
                      <div className="text-xs text-gray-500">{product.tooltip}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{product.consumption}</span>
                    <span className="text-gray-500 text-sm ml-1">{product.consumptionUnit}</span>
                  </td>
                  <td className="px-4 py-3">
                    {product.bagWeight ? (
                      <span>{product.bagWeight} кг</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {product.price} ₽
                    {product.linkedProductPrice && product.linkedProductPrice !== product.price && (
                      <span className="text-xs text-gray-400 ml-1">(каталог: {product.linkedProductPrice} ₽)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {product.productId ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                        ✓ Связан
                      </span>
                    ) : product.productUrlId ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                        URL: {product.productUrlId}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Редактировать"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Редактировать продукт' : 'Добавить продукт'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Поиск в каталоге */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Найти в каталоге
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Начните вводить название..."
                  className="w-full border rounded-lg px-3 py-2"
                />
                {filteredCatalogProducts.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                    {filteredCatalogProducts.map(product => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => selectCatalogProduct(product)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.price} ₽</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название продукта *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Расход *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.consumption}
                    onChange={(e) => setFormData({ ...formData, consumption: parseFloat(e.target.value) })}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ед. расхода
                  </label>
                  <select
                    value={formData.consumptionUnit}
                    onChange={(e) => setFormData({ ...formData, consumptionUnit: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="кг/м²">кг/м²</option>
                    <option value="кг/м³">кг/м³</option>
                    <option value="л/м²">л/м²</option>
                    <option value="шт/м²">шт/м²</option>
                    <option value="м²/лист">м²/лист</option>
                    <option value="м/рулон">м/рулон</option>
                    <option value="м³">м³</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Фасовка (кг)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.bagWeight}
                    onChange={(e) => setFormData({ ...formData, bagWeight: e.target.value })}
                    placeholder="Необязательно"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цена (₽) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL товара в каталоге
                </label>
                <input
                  type="text"
                  value={formData.productUrlId}
                  onChange={(e) => setFormData({ ...formData, productUrlId: e.target.value })}
                  placeholder="Например: gk-volma-12-5mm"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Подсказка
                </label>
                <textarea
                  value={formData.tooltip}
                  onChange={(e) => setFormData({ ...formData, tooltip: e.target.value })}
                  rows={2}
                  placeholder="Дополнительная информация о продукте"
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
                  {editingProduct ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
