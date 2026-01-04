'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface CalculatorFormula {
  id: number;
  categoryId: number;
  formulaType: string;
  formulaParams: Record<string, any>;
  resultUnit: string;
  resultUnitTemplate: string | null;
  recommendationsTemplate: any;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface CalculatorInput {
  id: number;
  key: string;
  label: string;
  unit: string;
}

const FORMULA_TYPES = [
  { value: 'area', label: 'По площади', description: 'Расход = площадь × расход_на_м² × слои' },
  { value: 'volume', label: 'По объему', description: 'Расход = объем × расход_на_м³' },
  { value: 'length', label: 'По длине', description: 'Расход = длина × расход_на_м' },
  { value: 'pieces', label: 'Штучный расчет', description: 'Количество = площадь / площадь_единицы' },
  { value: 'sheets', label: 'Листовой материал', description: 'Листов = площадь / (длина_листа × ширина_листа)' },
  { value: 'custom', label: 'Пользовательская', description: 'Своя формула на JavaScript' },
];

export default function CalculatorFormulaPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [formula, setFormula] = useState<CalculatorFormula | null>(null);
  const [inputs, setInputs] = useState<CalculatorInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    formulaType: 'area',
    formulaParams: {} as Record<string, any>,
    resultUnit: 'кг',
    resultUnitTemplate: '',
    recommendationsTemplate: '',
  });

  useEffect(() => {
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    try {
      const [catRes, formulaRes, inputsRes] = await Promise.all([
        fetch(`/api/admin/calculator/categories/${categoryId}`),
        fetch(`/api/admin/calculator/categories/${categoryId}/formula`),
        fetch(`/api/admin/calculator/categories/${categoryId}/inputs`),
      ]);

      if (catRes.ok) {
        setCategory(await catRes.json());
      }

      if (inputsRes.ok) {
        setInputs(await inputsRes.json());
      }

      if (formulaRes.ok) {
        const data = await formulaRes.json();
        if (data) {
          setFormula(data);
          setFormData({
            formulaType: data.formulaType,
            formulaParams: data.formulaParams || {},
            resultUnit: data.resultUnit,
            resultUnitTemplate: data.resultUnitTemplate || '',
            recommendationsTemplate: data.recommendationsTemplate 
              ? JSON.stringify(data.recommendationsTemplate, null, 2) 
              : '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let recommendations = null;
      if (formData.recommendationsTemplate.trim()) {
        try {
          recommendations = JSON.parse(formData.recommendationsTemplate);
        } catch {
          alert('Ошибка в JSON рекомендаций');
          setSaving(false);
          return;
        }
      }

      const res = await fetch(`/api/admin/calculator/categories/${categoryId}/formula`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formulaType: formData.formulaType,
          formulaParams: formData.formulaParams,
          resultUnit: formData.resultUnit,
          resultUnitTemplate: formData.resultUnitTemplate || null,
          recommendationsTemplate: recommendations,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFormula(data);
        alert('Формула сохранена');
      }
    } catch (error) {
      console.error('Error saving formula:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateFormulaParam = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      formulaParams: {
        ...prev.formulaParams,
        [key]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const selectedType = FORMULA_TYPES.find(t => t.value === formData.formulaType);

  return (
    <div className="p-6 max-w-4xl">
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {category?.icon} {category?.name} — Формула расчета
        </h1>
        <p className="text-gray-500">Настройка логики расчета для калькулятора</p>
      </div>

      {/* Доступные переменные */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-800 mb-2">📊 Доступные переменные из параметров ввода:</h3>
        {inputs.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {inputs.map(input => (
              <code key={input.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {input.key} ({input.label}{input.unit && `, ${input.unit}`})
              </code>
            ))}
          </div>
        ) : (
          <p className="text-blue-600 text-sm">
            Сначала добавьте параметры ввода в{' '}
            <Link href={`/admin/calculator/${categoryId}/inputs`} className="underline">
              разделе параметров
            </Link>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Тип формулы */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Тип формулы</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FORMULA_TYPES.map(type => (
              <label
                key={type.value}
                className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.formulaType === type.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="formulaType"
                  value={type.value}
                  checked={formData.formulaType === type.value}
                  onChange={(e) => setFormData({ ...formData, formulaType: e.target.value })}
                  className="sr-only"
                />
                <span className="font-medium">{type.label}</span>
                <span className="text-xs text-gray-500 mt-1">{type.description}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Параметры формулы */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Параметры формулы</h2>
          
          {formData.formulaType === 'area' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Переменная площади
                </label>
                <select
                  value={formData.formulaParams.areaKey || 'area'}
                  onChange={(e) => updateFormulaParam('areaKey', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {inputs.map(input => (
                    <option key={input.key} value={input.key}>{input.label} ({input.key})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Переменная слоёв (необязательно)
                </label>
                <select
                  value={formData.formulaParams.layersKey || ''}
                  onChange={(e) => updateFormulaParam('layersKey', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Не использовать</option>
                  {inputs.map(input => (
                    <option key={input.key} value={input.key}>{input.label} ({input.key})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {formData.formulaType === 'volume' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Переменная объема
                </label>
                <select
                  value={formData.formulaParams.volumeKey || 'volume'}
                  onChange={(e) => updateFormulaParam('volumeKey', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {inputs.map(input => (
                    <option key={input.key} value={input.key}>{input.label} ({input.key})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {formData.formulaType === 'sheets' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Переменная площади
                </label>
                <select
                  value={formData.formulaParams.areaKey || 'area'}
                  onChange={(e) => updateFormulaParam('areaKey', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {inputs.map(input => (
                    <option key={input.key} value={input.key}>{input.label} ({input.key})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Коэффициент запаса (%)
                  </label>
                  <input
                    type="number"
                    value={formData.formulaParams.wastePercent || 10}
                    onChange={(e) => updateFormulaParam('wastePercent', parseFloat(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.formulaType === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JavaScript выражение
              </label>
              <textarea
                value={formData.formulaParams.expression || ''}
                onChange={(e) => updateFormulaParam('expression', e.target.value)}
                rows={4}
                placeholder="inputs.area * product.consumption * (inputs.layers || 1)"
                className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Доступны: inputs (объект с значениями), product (выбранный продукт)
              </p>
            </div>
          )}
        </div>

        {/* Единица результата */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Отображение результата</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Единица измерения
              </label>
              <input
                type="text"
                value={formData.resultUnit}
                onChange={(e) => setFormData({ ...formData, resultUnit: e.target.value })}
                placeholder="кг, шт, м², л"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Шаблон единицы (необязательно)
              </label>
              <input
                type="text"
                value={formData.resultUnitTemplate}
                onChange={(e) => setFormData({ ...formData, resultUnitTemplate: e.target.value })}
                placeholder="Например: листов по {sheetArea} м²"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Рекомендации */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Рекомендации (JSON)</h2>
          
          <textarea
            value={formData.recommendationsTemplate}
            onChange={(e) => setFormData({ ...formData, recommendationsTemplate: e.target.value })}
            rows={8}
            placeholder={`{
  "tips": [
    "Добавьте 10% на подрезку",
    "Храните материал в сухом месте"
  ],
  "warnings": [
    "Не применять при температуре ниже +5°C"
  ]
}`}
            className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            JSON объект с полями tips и warnings (массивы строк)
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/calculator"
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Отмена
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить формулу'}
          </button>
        </div>
      </form>
    </div>
  );
}
