"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  slug: string;
  shortName: string | null;
  description: string | null;
  image: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Ошибка загрузки категорий");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const data = {
      id: editingCategory?.id,
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      shortName: formData.get("shortName") as string || null,
      description: formData.get("description") as string || null,
      image: formData.get("image") as string || null,
      icon: formData.get("icon") as string || null,
      sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
      isActive: formData.get("isActive") === "on",
    };

    try {
      const res = await fetch("/api/admin/categories", {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка сохранения");
      }

      await fetchCategories();
      setShowCategoryForm(false);
      setEditingCategory(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm("Удалить категорию? Все подкатегории и товары в ней будут удалены!")) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Ошибка удаления");
      await fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function handleSaveSubcategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const data = {
      id: editingSubcategory?.id,
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      categoryId: selectedCategoryId || editingSubcategory?.categoryId,
      description: formData.get("description") as string || null,
      image: formData.get("image") as string || null,
      sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
      isActive: formData.get("isActive") === "on",
    };

    try {
      const res = await fetch("/api/admin/subcategories", {
        method: editingSubcategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка сохранения");
      }

      await fetchCategories();
      setShowSubcategoryForm(false);
      setEditingSubcategory(null);
      setSelectedCategoryId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function handleDeleteSubcategory(id: number) {
    if (!confirm("Удалить подкатегорию? Все товары в ней будут удалены!")) return;

    try {
      const res = await fetch(`/api/admin/subcategories?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Ошибка удаления");
      await fetchCategories();
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

  if (loading) {
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
        <h1 className="text-2xl font-bold text-gray-900">Категории</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowCategoryForm(true);
          }}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          + Добавить категорию
        </button>
      </div>

      {/* Форма категории */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingCategory ? "Редактировать категорию" : "Новая категория"}
            </h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Название *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingCategory?.name || ""}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                  onChange={(e) => {
                    if (!editingCategory) {
                      const slugInput = e.target.form?.querySelector('input[name="slug"]') as HTMLInputElement;
                      if (slugInput) slugInput.value = transliterate(e.target.value);
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug (URL) *</label>
                <input
                  type="text"
                  name="slug"
                  defaultValue={editingCategory?.slug || ""}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Короткое название</label>
                <input
                  type="text"
                  name="shortName"
                  defaultValue={editingCategory?.shortName || ""}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Описание</label>
                <textarea
                  name="description"
                  defaultValue={editingCategory?.description || ""}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Изображение (URL)</label>
                <input
                  type="text"
                  name="image"
                  defaultValue={editingCategory?.image || ""}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Иконка (URL)</label>
                <input
                  type="text"
                  name="icon"
                  defaultValue={editingCategory?.icon || ""}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Порядок сортировки</label>
                <input
                  type="number"
                  name="sortOrder"
                  defaultValue={editingCategory?.sortOrder || 0}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={editingCategory?.isActive ?? true}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Активна</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
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

      {/* Форма подкатегории */}
      {showSubcategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingSubcategory ? "Редактировать подкатегорию" : "Новая подкатегория"}
            </h2>
            <form onSubmit={handleSaveSubcategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Название *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingSubcategory?.name || ""}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                  onChange={(e) => {
                    if (!editingSubcategory) {
                      const slugInput = e.target.form?.querySelector('input[name="slug"]') as HTMLInputElement;
                      if (slugInput) slugInput.value = transliterate(e.target.value);
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug (URL) *</label>
                <input
                  type="text"
                  name="slug"
                  defaultValue={editingSubcategory?.slug || ""}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Описание</label>
                <textarea
                  name="description"
                  defaultValue={editingSubcategory?.description || ""}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Изображение (URL)</label>
                <input
                  type="text"
                  name="image"
                  defaultValue={editingSubcategory?.image || ""}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Порядок сортировки</label>
                <input
                  type="number"
                  name="sortOrder"
                  defaultValue={editingSubcategory?.sortOrder || 0}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={editingSubcategory?.isActive ?? true}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Активна</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubcategoryForm(false);
                    setEditingSubcategory(null);
                    setSelectedCategoryId(null);
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

      {/* Список категорий */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Категории не найдены</p>
            <p className="text-sm text-gray-400 mt-2">
              Выполните миграцию данных или добавьте категории вручную
            </p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Заголовок категории */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                <div className="flex items-center gap-3">
                  {category.image && (
                    <img src={category.image} alt="" className="w-10 h-10 object-cover rounded" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">/{category.slug}</p>
                  </div>
                  {!category.isActive && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      Неактивна
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setEditingSubcategory(null);
                      setShowSubcategoryForm(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Подкатегория
                  </button>
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setShowCategoryForm(true);
                    }}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Удалить
                  </button>
                </div>
              </div>

              {/* Подкатегории */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="divide-y">
                  {category.subcategories.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 pl-8 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        {sub.image && (
                          <img src={sub.image} alt="" className="w-8 h-8 object-cover rounded" />
                        )}
                        <div>
                          <span className="text-gray-700">{sub.name}</span>
                          <span className="text-sm text-gray-400 ml-2">/{sub.slug}</span>
                        </div>
                        {!sub.isActive && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            Неактивна
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingSubcategory(sub);
                            setShowSubcategoryForm(true);
                          }}
                          className="text-sm text-orange-600 hover:text-orange-700"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => handleDeleteSubcategory(sub.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
