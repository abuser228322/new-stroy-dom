import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, orderParts, stores, coupons, couponUsages } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { validateSession } from "@/lib/auth";

// Типы для cartItems
interface CartItemInput {
  productId?: string;
  urlId: string;
  title: string;
  image?: string | null;
  price: number;
  quantity: number;
  size?: string | null;
  unit?: string | null;
  storeId?: number;
  storeSlug?: string;
}

interface PartDeliveryInput {
  storeId: number;
  storeSlug: string;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryComment?: string;
}

// Генерация номера заказа
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SD-${year}${month}${day}-${random}`;
}

// GET - получить заказы текущего пользователя
export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  
  if (!token) {
    return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
  }
  
  const user = await validateSession(token);
  if (!user) {
    return NextResponse.json({ error: "Сессия истекла" }, { status: 401 });
  }
  
  try {
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, user.id),
      orderBy: [desc(orders.createdAt)],
      with: {
        parts: {
          with: {
            store: true,
            items: true,
          },
        },
        items: true,
      },
    });
    
    return NextResponse.json(userOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Ошибка получения заказов" }, { status: 500 });
  }
}

// POST - создать новый заказ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
      customerComment,
      couponCode,
      partsDelivery, // Новое: массив с данными о доставке для каждого магазина
      items: cartItems,
    } = body;
    
    // Валидация обязательных полей
    if (!customerName?.trim()) {
      return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
    }
    if (!customerPhone?.trim()) {
      return NextResponse.json({ error: "Укажите телефон" }, { status: 400 });
    }
    if (!paymentMethod) {
      return NextResponse.json({ error: "Выберите способ оплаты" }, { status: 400 });
    }
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
    }
    if (!partsDelivery || partsDelivery.length === 0) {
      return NextResponse.json({ error: "Укажите способ получения" }, { status: 400 });
    }
    
    // Проверяем авторизацию (опционально)
    const token = request.cookies.get("auth_token")?.value;
    let userId: number | null = null;
    if (token) {
      const user = await validateSession(token);
      if (user) {
        userId = user.id;
      }
    }
    
    // Загружаем магазины
    const allStores = await db.select().from(stores);
    const storeMap = new Map(allStores.map(s => [s.slug, s]));
    
    // Типизируем cartItems
    const typedCartItems = cartItems as CartItemInput[];
    const typedPartsDelivery = partsDelivery as PartDeliveryInput[];
    
    // Группируем товары по магазинам
    const itemsByStore: Record<string, CartItemInput[]> = {};
    for (const item of typedCartItems) {
      const storeSlug = item.storeSlug || 'rybinskaya';
      if (!itemsByStore[storeSlug]) {
        itemsByStore[storeSlug] = [];
      }
      itemsByStore[storeSlug].push(item);
    }
    
    // Рассчитываем сумму товаров по частям
    let totalSubtotal = 0;
    let totalDeliveryPrice = 0;
    
    const partsData: Array<{
      storeSlug: string;
      storeId: number;
      deliveryType: 'pickup' | 'delivery';
      deliveryAddress: string | null;
      deliveryComment: string | null;
      subtotal: number;
      deliveryPrice: number;
      items: CartItemInput[];
    }> = [];
    
    for (const partDelivery of typedPartsDelivery) {
      const store = storeMap.get(partDelivery.storeSlug);
      if (!store) {
        return NextResponse.json({ error: `Магазин ${partDelivery.storeSlug} не найден` }, { status: 400 });
      }
      
      const storeItems = itemsByStore[partDelivery.storeSlug] || [];
      const partSubtotal = storeItems.reduce((sum: number, item: CartItemInput) => sum + item.price * item.quantity, 0);
      const partDeliveryPrice = partDelivery.deliveryType === 'delivery' ? 500 : 0; // Можно настроить
      
      totalSubtotal += partSubtotal;
      totalDeliveryPrice += partDeliveryPrice;
      
      partsData.push({
        storeSlug: partDelivery.storeSlug,
        storeId: store.id,
        deliveryType: partDelivery.deliveryType,
        deliveryAddress: partDelivery.deliveryType === 'delivery' ? (partDelivery.deliveryAddress?.trim() || null) : null,
        deliveryComment: partDelivery.deliveryComment?.trim() || null,
        subtotal: partSubtotal,
        deliveryPrice: partDeliveryPrice,
        items: storeItems,
      });
    }
    
    // Обрабатываем купон
    let discount = 0;
    let couponId: number | null = null;
    
    if (couponCode?.trim()) {
      const coupon = await db.query.coupons.findFirst({
        where: and(
          eq(coupons.code, couponCode.trim().toUpperCase()),
          eq(coupons.isActive, true)
        ),
      });
      
      if (coupon) {
        const now = new Date();
        if ((!coupon.startDate || new Date(coupon.startDate) <= now) &&
            (!coupon.endDate || new Date(coupon.endDate) >= now)) {
          
          if (!coupon.minOrderAmount || totalSubtotal >= parseFloat(coupon.minOrderAmount)) {
            if (!coupon.usageLimit || (coupon.usageCount || 0) < coupon.usageLimit) {
              couponId = coupon.id;
              
              if (coupon.discountType === "percent") {
                discount = totalSubtotal * (parseFloat(coupon.discountValue) / 100);
                if (coupon.maxDiscountAmount) {
                  discount = Math.min(discount, parseFloat(coupon.maxDiscountAmount));
                }
              } else {
                discount = parseFloat(coupon.discountValue);
              }
            }
          }
        }
      }
    }
    
    // Итоговая сумма
    const total = totalSubtotal - discount + totalDeliveryPrice;
    
    // Генерируем номер заказа
    const orderNumber = generateOrderNumber();
    
    // Создаём заказ
    const [newOrder] = await db.insert(orders).values({
      orderNumber,
      userId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim() || null,
      status: "pending",
      paymentMethod,
      subtotal: totalSubtotal.toFixed(2),
      deliveryPrice: totalDeliveryPrice.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
      couponId,
      couponCode: couponId ? couponCode.trim().toUpperCase() : null,
      customerComment: customerComment?.trim() || null,
    }).returning();
    
    // Создаём части заказа и позиции
    for (const partData of partsData) {
      // Создаём часть заказа
      const [newPart] = await db.insert(orderParts).values({
        orderId: newOrder.id,
        storeId: partData.storeId,
        deliveryType: partData.deliveryType,
        deliveryAddress: partData.deliveryAddress,
        deliveryComment: partData.deliveryComment,
        subtotal: partData.subtotal.toFixed(2),
        deliveryPrice: partData.deliveryPrice.toFixed(2),
        partStatus: "pending",
      }).returning();
      
      // Добавляем позиции для этой части
      if (partData.items.length > 0) {
        await db.insert(orderItems).values(
          partData.items.map((item: CartItemInput) => ({
            orderId: newOrder.id,
            orderPartId: newPart.id,
            productId: item.productId ? parseInt(item.productId, 10) : null,
            storeId: partData.storeId,
            urlId: item.urlId,
            title: item.title,
            image: item.image || null,
            quantity: item.quantity,
            price: item.price.toFixed(2),
            size: item.size || null,
            unit: item.unit || null,
            total: (item.price * item.quantity).toFixed(2),
          }))
        );
      }
    }
    
    // Записываем использование купона
    if (couponId && userId) {
      await db.insert(couponUsages).values({
        couponId,
        userId,
        orderAmount: totalSubtotal.toFixed(2),
        discountAmount: discount.toFixed(2),
      });
      
      // Увеличиваем счётчик использований
      const currentCoupon = await db.query.coupons.findFirst({ where: eq(coupons.id, couponId) });
      await db.update(coupons)
        .set({ usageCount: (currentCoupon?.usageCount || 0) + 1 })
        .where(eq(coupons.id, couponId));
    }
    
    // Возвращаем созданный заказ с частями
    const createdOrder = await db.query.orders.findFirst({
      where: eq(orders.id, newOrder.id),
      with: {
        parts: {
          with: {
            store: true,
            items: true,
          },
        },
        items: true,
      },
    });
    
    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Ошибка создания заказа" }, { status: 500 });
  }
}
