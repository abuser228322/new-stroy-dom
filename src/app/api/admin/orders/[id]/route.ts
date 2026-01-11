import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, orderParts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, authErrorResponse } from "@/lib/auth-utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - получить детали заказа
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAdmin(request);
  if (!authResult.success) return authErrorResponse(authResult);
  
  const { id } = await params;
  const orderId = parseInt(id, 10);
  
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Неверный ID заказа" }, { status: 400 });
  }
  
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        parts: {
          with: {
            store: true,
            items: {
              with: {
                product: true,
              },
            },
          },
        },
        items: {
          with: {
            product: true,
          },
        },
        user: {
          columns: {
            id: true,
            username: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            telegramUsername: true,
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

// PUT - обновить статус заказа
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAdmin(request);
  if (!authResult.success) return authErrorResponse(authResult);
  
  const { id } = await params;
  const orderId = parseInt(id, 10);
  
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Неверный ID заказа" }, { status: 400 });
  }
  
  try {
    const body = await request.json();
    const { status, adminComment, cancelReason } = body;
    
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    
    if (!order) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }
    
    // Собираем данные для обновления
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };
    
    if (status) {
      updateData.status = status;
      
      // Устанавливаем соответствующие даты
      if (status === "confirmed" && !order.confirmedAt) {
        updateData.confirmedAt = new Date();
      }
      if (status === "completed" && !order.completedAt) {
        updateData.completedAt = new Date();
      }
      if (status === "cancelled" && !order.cancelledAt) {
        updateData.cancelledAt = new Date();
        if (cancelReason) {
          updateData.cancelReason = cancelReason;
        }
      }
    }
    
    if (adminComment !== undefined) {
      updateData.adminComment = adminComment;
    }
    
    const [updatedOrder] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();
    
    // Возвращаем обновлённый заказ с позициями
    const fullOrder = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
        user: {
          columns: {
            id: true,
            username: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    
    return NextResponse.json(fullOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Ошибка обновления заказа" }, { status: 500 });
  }
}

// DELETE - удалить заказ (только cancelled)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAdmin(request);
  if (!authResult.success) return authErrorResponse(authResult);
  
  const { id } = await params;
  const orderId = parseInt(id, 10);
  
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Неверный ID заказа" }, { status: 400 });
  }
  
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    
    if (!order) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }
    
    // Сначала удаляем позиции заказа
    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    // Затем части заказа
    await db.delete(orderParts).where(eq(orderParts.orderId, orderId));
    // Затем сам заказ
    await db.delete(orders).where(eq(orders.id, orderId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: "Ошибка удаления заказа" }, { status: 500 });
  }
}
