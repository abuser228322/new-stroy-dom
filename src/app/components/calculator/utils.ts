import type { MaterialConfig, ProductOption, ApiFormula } from './types';

// ================== ФУНКЦИЯ РАСЧЕТА ДЛЯ ДАННЫХ ИЗ БД ==================

export function createCalculateFunction(formula: ApiFormula | null): MaterialConfig['calculate'] {
  if (!formula) {
    // Дефолтная формула по площади
    return (v, product) => {
      const totalKg = (v.area || 0) * product.consumption;
      const bags = Math.ceil(totalKg / (product.bagWeight || 25));
      return {
        amount: bags,
        unit: product.bagWeight ? `мешков (${product.bagWeight}кг)` : 'шт',
        totalWeight: totalKg,
        details: `Общий расход: ${totalKg.toFixed(1)} кг`,
        estimatedPrice: product.price ? bags * product.price : undefined,
      };
    };
  }

  const { formulaType, formulaParams, resultUnit, resultUnitTemplate, recommendationsTemplate } = formula;

  return (v, product) => {
    let amount = 0;
    let totalWeight = 0;
    let details = '';
    let unit = resultUnit;
    
    // Безопасная обработка параметров формулы
    const params = formulaParams || {};
    const areaKey = params.areaKey || 'area';
    const thicknessKey = params.thicknessKey || 'thickness';
    const layersKey = params.layersKey || 'layers';
    const volumeKey = params.volumeKey || 'volume';
    const lengthKey = params.lengthKey || 'length';
    const quantityKey = params.quantityKey || 'width';
    
    switch (formulaType) {
      case 'area': {
        const area = v[areaKey] || 0;
        const thickness = v[thicknessKey] || 10;
        const layers = v[layersKey] || 1;
        const consumptionUnit = product.consumptionUnit || '';
        
        if (consumptionUnit.includes('/см') || consumptionUnit.includes('при 10мм') || consumptionUnit.includes('/м²/см') || consumptionUnit.includes('кг/м²/см')) {
          totalWeight = area * product.consumption * (thickness / 10) * layers;
        } else if (consumptionUnit.includes('/мм') || consumptionUnit.includes('при 1мм') || consumptionUnit.includes('/м²/мм') || consumptionUnit.includes('кг/м²/мм')) {
          totalWeight = area * product.consumption * thickness * layers;
        } else {
          totalWeight = area * product.consumption * layers;
        }
        
        const isLiquidLiters = consumptionUnit.includes('л/м²');
        const isLiquidKg = consumptionUnit.includes('кг/м²') && !consumptionUnit.includes('/см') && !consumptionUnit.includes('/мм') && (
          consumptionUnit.toLowerCase().includes('грунт') || 
          consumptionUnit.toLowerCase().includes('бетонокон') ||
          product.name?.toLowerCase().includes('бетонокон') ||
          product.name?.toLowerCase().includes('грунт')
        );
        const isGrams = consumptionUnit.includes('г/м²') && !consumptionUnit.includes('кг/м²');
        
        if (isLiquidLiters) {
          amount = product.bagWeight ? Math.ceil(totalWeight / product.bagWeight) : Math.ceil(totalWeight);
          unit = product.bagWeight ? `канистр (${product.bagWeight}л)` : 'л';
          details = `Общий расход: ${totalWeight.toFixed(1)} л`;
        } else if (isLiquidKg) {
          amount = product.bagWeight ? Math.ceil(totalWeight / product.bagWeight) : Math.ceil(totalWeight);
          unit = product.bagWeight ? `вёдер (${product.bagWeight}кг)` : 'кг';
          details = `Общий расход: ${totalWeight.toFixed(1)} кг`;
        } else if (isGrams) {
          const totalKg = totalWeight / 1000;
          amount = product.bagWeight ? Math.ceil(totalKg / product.bagWeight) : Math.ceil(totalKg);
          unit = product.bagWeight ? `вёдер (${product.bagWeight}кг)` : 'кг';
          details = `Общий расход: ${totalKg.toFixed(1)} кг`;
        } else {
          amount = product.bagWeight ? Math.ceil(totalWeight / product.bagWeight) : Math.ceil(totalWeight);
          unit = product.bagWeight ? `мешков (${product.bagWeight}кг)` : 'кг';
          details = `Общий расход: ${totalWeight.toFixed(1)} кг`;
        }
        break;
      }
      
      case 'volume': {
        const volume = v[volumeKey] || (v.area || 0) * (v.thickness || 50) / 1000;
        totalWeight = volume * product.consumption;
        amount = product.bagWeight ? Math.ceil(totalWeight / product.bagWeight) : Math.ceil(totalWeight);
        unit = product.bagWeight ? `мешков (${product.bagWeight}кг)` : resultUnit;
        details = `Объём: ${volume.toFixed(2)} м³`;
        break;
      }
      
      case 'sheets': {
        const area = v[areaKey] || 0;
        const length = v[lengthKey] || 0;
        const width = v.width || 0;
        const wastePercent = v.overlap ?? params.wastePercent ?? 10;
        
        if (length > 0 && width > 0 && product.consumptionUnit.includes('ширины')) {
          const sheetsNeeded = Math.ceil(width / product.consumption);
          amount = sheetsNeeded;
          unit = resultUnitTemplate || 'листов';
          details = `Покрытие ${length}м × ${width}м. Листов: ${sheetsNeeded} шт (рабочая ширина ${product.consumption}м)`;
        } else if (product.consumptionUnit.includes('рулон') || product.consumptionUnit.includes('м²/рулон')) {
          const rollArea = product.consumption;
          const areaWithOverlap = area * (1 + wastePercent / 100);
          amount = Math.ceil(areaWithOverlap / rollArea);
          unit = 'рулонов';
          details = `Общий расход: ${areaWithOverlap.toFixed(1)} м² (с запасом ${wastePercent}%)`;
        } else {
          const sheetArea = product.consumption;
          const areaWithWaste = area * (1 + wastePercent / 100);
          amount = Math.ceil(areaWithWaste / sheetArea);
          
          if (product.consumptionUnit.includes('м²/лист') || product.consumptionUnit.includes('м² на лист')) {
            unit = 'листов';
          } else if (product.consumptionUnit.includes('м²/уп') || product.consumptionUnit.includes('м² в упаковке')) {
            unit = 'упаковок';
          } else {
            unit = resultUnitTemplate || 'упаковок';
          }
          details = `Общий расход: ${areaWithWaste.toFixed(1)} м² (с запасом ${wastePercent}%)`;
        }
        break;
      }
      
      case 'pieces': {
        const quantity = v[quantityKey] || v.blocks || 0;
        totalWeight = quantity * product.consumption;
        amount = product.bagWeight ? Math.ceil(totalWeight / product.bagWeight) : Math.ceil(totalWeight);
        unit = product.bagWeight ? `мешков (${product.bagWeight}кг)` : resultUnit;
        details = `Общий расход: ${totalWeight.toFixed(1)} ${resultUnit}`;
        break;
      }
      
      default: {
        const area = v.area || 0;
        totalWeight = area * product.consumption;
        amount = product.bagWeight ? Math.ceil(totalWeight / product.bagWeight) : Math.ceil(totalWeight);
        unit = product.bagWeight ? `мешков (${product.bagWeight}кг)` : resultUnit;
        details = `Общий расход: ${totalWeight.toFixed(1)} ${resultUnit}`;
      }
    }

    const estimatedPrice = product.price != null ? amount * product.price : undefined;
    
    let recommendations: string[] = [];
    if (recommendationsTemplate) {
      if (recommendationsTemplate.tips) {
        recommendations = [...recommendationsTemplate.tips];
      }
      if (recommendationsTemplate.warnings) {
        recommendations = [...recommendations, ...recommendationsTemplate.warnings];
      }
    }

    return {
      amount,
      unit,
      totalWeight,
      details,
      estimatedPrice,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };
  };
}
