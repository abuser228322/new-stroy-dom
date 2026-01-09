'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaExternalLinkAlt } from 'react-icons/fa';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  category: string | null;
  tags: string | null;
  viewCount: number;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

const CATEGORY_OPTIONS = [
  { value: 'советы', label: '💡 Советы' },
  { value: 'новости', label: '📰 Новости' },
  { value: 'обзоры', label: '🔍 Обзоры' },
  { value: 'инструкции', label: '📋 Инструкции' },
];

// Функция транслитерации для генерации slug
const transliterate = (text: string): string => {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  };
  
  return text.toLowerCase()
    .split('')
    .map(char => map[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    image: '',
    category: 'советы',
    tags: '',
    isPublished: false,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || '',
        content: post.content,
        image: post.image || '',
        category: post.category || 'советы',
        tags: post.tags || '',
        isPublished: post.isPublished,
      });
    } else {
      setEditingPost(null);
      setFormData({
        slug: '',
        title: '',
        excerpt: '',
        content: '',
        image: '',
        category: 'советы',
        tags: '',
        isPublished: false,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingPost ? formData.slug : transliterate(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPost 
        ? `/api/admin/blog/${editingPost.id}`
        : '/api/admin/blog';
      
      const method = editingPost ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchPosts();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту статью?')) return;
    
    try {
      await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const togglePublished = async (post: BlogPost) => {
    try {
      await fetch(`/api/admin/blog/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...post, isPublished: !post.isPublished }),
      });
      fetchPosts();
    } catch (error) {
      console.error('Error toggling post:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Блог</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <FaPlus />
          Новая статья
        </button>
      </div>

      {/* Список статей */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Статья</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Категория</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Просмотры</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Статус</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{post.title}</p>
                    <p className="text-sm text-gray-500">/blog/{post.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">
                    {CATEGORY_OPTIONS.find(c => c.value === post.category)?.label || post.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">{post.viewCount}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => togglePublished(post)}
                    className={`flex items-center gap-2 text-sm ${
                      post.isPublished ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {post.isPublished ? (
                      <>
                        <FaEye className="text-lg" />
                        Опубликована
                      </>
                    ) : (
                      <>
                        <FaEyeSlash className="text-lg" />
                        Черновик
                      </>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {post.isPublished && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Открыть"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    )}
                    <button
                      onClick={() => openModal(post)}
                      className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Статей пока нет. Напишите первую!
          </div>
        )}
      </div>

      {/* Модалка создания/редактирования */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPost ? 'Редактировать статью' : 'Новая статья'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Заголовок */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Заголовок <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  placeholder="Как выбрать профнастил для забора"
                  required
                />
              </div>

              {/* URL (slug) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL статьи <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">/blog/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                    placeholder="kak-vybrat-profnastil"
                    required
                  />
                </div>
              </div>

              {/* Категория */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Краткое описание */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Краткое описание
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none resize-none"
                  rows={2}
                  placeholder="Краткое описание для карточки статьи..."
                />
              </div>

              {/* Контент */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Содержание статьи <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none resize-none font-mono text-sm"
                  rows={10}
                  placeholder="Поддерживается Markdown..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Поддерживается Markdown разметка</p>
              </div>

              {/* Изображение */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL изображения
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  placeholder="/images/blog/article.jpg"
                />
              </div>

              {/* Теги */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Теги (через запятую)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  placeholder="профнастил, забор, строительство"
                />
              </div>

              {/* Статус публикации */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Опубликовать статью</span>
                </label>
              </div>

              {/* Кнопки */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                >
                  {editingPost ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
