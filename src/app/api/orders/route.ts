import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products, coupons, couponUsages } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { validateSession } from "@/lib/auth";

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
      deliveryType,
      paymentMethod,
      deliveryAddress,
      deliveryComment,
      customerComment,
      couponCode,
      items: cartItems,
    } = body;
    
    // Валидация обязательных полей
    if (!customerName?.trim()) {
      return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
    }
    if (!customerPhone?.trim()) {
      return NextResponse.json({ error: "Укажите телефон" }, { status: 400 });
    }
    if (!deliveryType) {
      return NextResponse.json({ error: "Выберите способ получения" }, { status: 400 });
    }
    if (!paymentMethod) {
      return NextResponse.json({ error: "Выберите способ оплаты" }, { status: 400 });
    }
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
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
    
    // Рассчитываем сумму товаров
    let subtotal = 0;
    const orderItemsData: Array<{
      urlId: string;
      title: string;
      image: string | null;
      quantity: number;
      price: number;
      size: string | null;
      unit: string | null;
      total: number;
      productId: number | null;
    }> = [];
    
    for (const item of cartItems) {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      orderItemsData.push({
        urlId: item.urlId,
        title: item.title,
        image: item.image || null,
        quantity: item.quantity,
        price: item.price,
        size: item.size || null,
        unit: item.unit || null,
        total: itemTotal,
        productId: item.productId ? parseInt(item.productId, 10) : null,
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
        // Проверяем срок действия
        const now = new Date();
        if ((!coupon.startDate || new Date(coupon.startDate) <= now) &&
            (!coupon.endDate || new Date(coupon.endDate) >= now)) {
          
          // Проверяем минимальную сумму
          if (!coupon.minOrderAmount || subtotal >= parseFloat(coupon.minOrderAmount)) {
            // Проверяем лимит использования
            if (!coupon.usageLimit || (coupon.usageCount || 0) < coupon.usageLimit) {
              couponId = coupon.id;
              
              if (coupon.discountType === "percent") {
                discount = subtotal * (parseFloat(coupon.discountValue) / 100);
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
    
    // Стоимость доставки (можно настроить)
    const deliveryPrice = deliveryType === "delivery" ? 500 : 0;
    
    // Итоговая сумма
    const total = subtotal - discount + deliveryPrice;
    
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
      deliveryType,
      paymentMethod,
      deliveryAddress: deliveryType === "delivery" ? deliveryAddress?.trim() : null,
      deliveryComment: deliveryComment?.trim() || null,
      subtotal: subtotal.toFixed(2),
      deliveryPrice: deliveryPrice.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
      couponId,
      couponCode: couponId ? couponCode.trim().toUpperCase() : null,
      customerComment: customerComment?.trim() || null,
    }).returning();
    
    // Добавляем позиции заказа
    await db.insert(orderItems).values(
      orderItemsData.map(item => ({
        orderId: newOrder.id,
        productId: item.productId,
        urlId: item.urlId,
        title: item.title,
        image: item.image,
        quantity: item.quantity,
        price: item.price.toFixed(2),
        size: item.size,
        unit: item.unit,
        total: item.total.toFixed(2),
      }))
    );
    
    // Записываем использование купона
    if (couponId && userId) {
      await db.insert(couponUsages).values({
        couponId,
        userId,
        orderAmount: subtotal.toFixed(2),
        discountAmount: discount.toFixed(2),
      });
      
      // Увеличиваем счётчик использований
      const currentCoupon = await db.query.coupons.findFirst({ where: eq(coupons.id, couponId) });
      await db.update(coupons)
        .set({ usageCount: (currentCoupon?.usageCount || 0) + 1 })
        .where(eq(coupons.id, couponId));
    }
    
    // Возвращаем созданный заказ
    const createdOrder = await db.query.orders.findFirst({
      where: eq(orders.id, newOrder.id),
      with: {
        items: true,
      },
    });
    
    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Ошибка создания заказа" }, { status: 500 });
  }
}
