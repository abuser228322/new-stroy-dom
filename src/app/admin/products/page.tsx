"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
}

interface Product {
  id: number;
  urlId: string;
  title: string;
  description: string | null;
  image: string | null;
  categoryId: number;
  subcategoryId: number;
  price: string | null;
  pricesBySize: Record<string, number> | null;
  sizeText: string | null;
  unit: string;
  brand: string | null;
  inStock: boolean;
  isWeight: boolean;
  quantityStep: string | null;
  minQuantity: string | null;
  isActive: boolean;
  category?: Category;
  subcategory?: Subcategory;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Фильтры
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | "">("");
  const [page, setPage] = useState(1);

  // Форма
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, selectedSubcategory, page]);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory as number);
    } else {
      setSubcategories([]);
      setSelectedSubcategory("");
    }
  }, [selectedCategory]);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Ошибка загрузки категорий");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchSubcategories(categoryId: number) {
    try {
      const res = await fetch(`/api/admin/subcategories?categoryId=${categoryId}`);
      if (!res.ok) throw new Error("Ошибка загрузки подкатегорий");
      const data = await res.json();
      setSubcategories(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (search) params.set("search", search);
      if (selectedCategory) params.set("categoryId", selectedCategory.toString());
      if (selectedSubcategory) params.set("subcategoryId", selectedSubcategory.toString());

      const res = await fetch(`/api/admin/products?${params}`);
      if (!res.ok) throw new Error("Ошибка загрузки товаров");
      const data = await res.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Парсим pricesBySize
    let pricesBySize: Record<string, number> | null = null;
    const pricesBySizeStr = formData.get("pricesBySize") as string;
    if (pricesBySizeStr) {
      try {
        pricesBySize = JSON.parse(pricesBySizeStr);
      } catch {
        alert("Неверный формат цен по размерам. Используйте JSON: {\"1м\": 100, \"2м\": 200}");
        return;
      }
    }

    const data = {
      id: editingProduct?.id,
      urlId: formData.get("urlId") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string || null,
      image: formData.get("image") as string || null,
      categoryId: parseInt(formData.get("categoryId") as string),
      subcategoryId: parseInt(formData.get("subcategoryId") as string),
      price: formData.get("price") ? parseFloat(formData.get("price") as string) : null,
      pricesBySize,
      sizeText: formData.get("sizeText") as string || null,
      unit: formData.get("unit") as string || "шт",
      brand: formData.get("brand") as string || null,
      inStock: formData.get("inStock") === "on",
      isWeight: formData.get("isWeight") === "on",
      quantityStep: formData.get("quantityStep") ? parseFloat(formData.get("quantityStep") as string) : null,
      minQuantity: formData.get("minQuantity") ? parseFloat(formData.get("minQuantity") as string) : null,
      isActive: formData.get("isActive") === "on",
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка сохранения");
      }

      await fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function handleDeleteProduct(id: number) {
    if (!confirm("Удалить товар?")) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Ошибка удаления");
      await fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  }

  function transliterate(text: string): string {
    const map: { [key: string]: string } = {
      а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
      з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
      п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
      ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
    };
    return text
      .toLowerCase()
      .split("")
      .map((char) => map[char] || char)
      .join("")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
  }

  function formatPrice(product: Product): string {
    if (product.price) {
      return `${parseFloat(product.price).toLocaleString("ru-RU")} ₽`;
    }
    if (product.pricesBySize) {
      const prices = Object.values(product.pricesBySize);
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (min === max) return `${min.toLocaleString("ru-RU")} ₽`;
        return `${min.toLocaleString("ru-RU")} - ${max.toLocaleString("ru-RU")} ₽`;
      }
    }
    return "Цена не указана";
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-red-500 mt-2">
          Проверьте настройку DATABASE_URL в .env.local
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Товары</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          + Добавить товар
        </button>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Название или URL..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value ? parseInt(e.target.value) : "");
                setSelectedSubcategory("");
                setPage(1);
              }}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
            >
              <option value="">Все категории</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Подкатегория</label>
            <select
              value={selectedSubcategory}
              onChange={(e) => {
                setSelectedSubcategory(e.target.value ? parseInt(e.target.value) : "");
                setPage(1);
              }}
              disabled={!selectedCategory}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border disabled:bg-gray-100"
            >
              <option value="">Все подкатегории</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("");
                setSelectedSubcategory("");
                setPage(1);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>

      {/* Форма товара */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingProduct ? "Редактировать товар" : "Новый товар"}
            </h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Название *</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingProduct?.title || ""}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                    onChange={(e) => {
                      if (!editingProduct) {
                        const urlIdInput = e.target.form?.querySelector('input[name="urlId"]') as HTMLInputElement;
                        if (urlIdInput) urlIdInput.value = transliterate(e.target.value);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL ID *</label>
                  <input
                    type="text"
                    name="urlId"
                    defaultValue={editingProduct?.urlId || ""}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Описание</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description || ""}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Изображение (URL)</label>
                <input
                  type="text"
                  name="image"
                  defaultValue={editingProduct?.image || ""}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Категория *</label>
                  <select
                    name="categoryId"
                    defaultValue={editingProduct?.categoryId || ""}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                    onChange={async (e) => {
                      const catId = parseInt(e.target.value);
                      if (catId) {
                        const res = await fetch(`/api/admin/subcategories?categoryId=${catId}`);
                        const subs = await res.json();
                        // Обновляем options для подкатегории
                        const subSelect = e.target.form?.querySelector('select[name="subcategoryId"]') as HTMLSelectElement;
                        if (subSelect) {
                          subSelect.innerHTML = '<option value="">Выберите подкатегорию</option>' +
                            subs.map((s: Subcategory) => `<option value="${s.id}">${s.name}</option>`).join("");
                        }
                      }
                    }}
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Подкатегория *</label>
                  <select
                    name="subcategoryId"
                    defaultValue={editingProduct?.subcategoryId || ""}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                  >
                    <option value="">Выберите подкатегорию</option>
                    {editingProduct && subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Цена (фиксированная)</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    defaultValue={editingProduct?.price || ""}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Единица измерения</label>
                  <input
                    type="text"
                    name="unit"
                    defaultValue={editingProduct?.unit || "шт"}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Бренд</label>
                  <input
                    type="text"
                    name="brand"
                    defaultValue={editingProduct?.brand || ""}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Цены по размерам (JSON)
                </label>
                <textarea
                  name="pricesBySize"
                  defaultValue={editingProduct?.pricesBySize ? JSON.stringify(editingProduct.pricesBySize, null, 2) : ""}
                  rows={3}
                  placeholder='{"1.5м": 800, "2м": 1000}'
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Текст выбора размера</label>
                <input
                  type="text"
                  name="sizeText"
                  defaultValue={editingProduct?.sizeText || ""}
                  placeholder="Выберите длину:"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Шаг количества</label>
                  <input
                    type="number"
                    name="quantityStep"
                    step="0.01"
                    defaultValue={editingProduct?.quantityStep || ""}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Мин. количество</label>
                  <input
                    type="number"
                    name="minQuantity"
                    step="0.01"
                    defaultValue={editingProduct?.minQuantity || ""}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="inStock"
                    defaultChecked={editingProduct?.inStock ?? true}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">В наличии</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isWeight"
                    defaultChecked={editingProduct?.isWeight ?? false}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Весовой товар</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={editingProduct?.isActive ?? true}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Активен</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Таблица товаров */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Товар
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Категория
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Цена
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Товары не найдены
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      {product.image && (
                        <img
                          src={product.image}
                          alt=""
                          className="w-12 h-12 object-cover rounded mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {product.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          /{product.urlId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {product.category?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.subcategory?.name}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {formatPrice(product)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      {product.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Активен
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Скрыт
                        </span>
                      )}
                      {product.inStock ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          В наличии
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Нет в наличии
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-medium">
                    <button
                      onClick={async () => {
                        setEditingProduct(product);
                        if (product.categoryId) {
                          await fetchSubcategories(product.categoryId);
                        }
                        setShowForm(true);
                      }}
                      className="text-orange-600 hover:text-orange-900 mr-3"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Пагинация */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Показано {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} из{" "}
              {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ← Назад
              </button>
              <span className="px-3 py-1 text-sm">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Далее →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
