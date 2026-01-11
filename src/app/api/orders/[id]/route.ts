import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { validateSession } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - получить заказ по ID (только свой)
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const orderId = parseInt(id, 10);
  
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Неверный ID заказа" }, { status: 400 });
  }
  
  const token = request.cookies.get("auth_token")?.value;
  
  if (!token) {
    return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
  }
  
  const user = await validateSession(token);
  if (!user) {
    return NextResponse.json({ error: "Сессия истекла" }, { status: 401 });
  }
  
  try {
    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, orderId),
        eq(orders.userId, user.id)
      ),
      with: {
        items: {
          with: {
            product: true,
          },
        },
        coupon: true,
      },
    });
    
    if (!order) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Ошибка получения заказа" }, { status: 500 });
  }
}

// PUT - отмена заказа пользователем (только pending/confirmed)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const orderId = parseInt(id, 10);
  
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Неверный ID заказа" }, { status: 400 });
  }
  
  const token = request.cookies.get("auth_token")?.value;
  
  if (!token) {
    return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
  }
  
  const user = await validateSession(token);
  if (!user) {
    return NextResponse.json({ error: "Сессия истекла" }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { action, reason } = body;
    
    // Находим заказ
    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, orderId),
        eq(orders.userId, user.id)
      ),
    });
    
    if (!order) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }
    
    if (action === "cancel") {
      // Отмена возможна только для pending и confirmed
      if (!["pending", "confirmed"].includes(order.status)) {
        return NextResponse.json(
          { error: "Заказ нельзя отменить на этом этапе" },
          { status: 400 }
        );
      }
      
      const [updatedOrder] = await db.update(orders)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
          cancelReason: reason || "Отменён покупателем",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning();
      
      return NextResponse.json(updatedOrder);
    }
    
    return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Ошибка обновления заказа" }, { status: 500 });
  }
}
