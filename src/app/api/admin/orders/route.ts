import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc, and, or, ilike, sql } from "drizzle-orm";
import { requireAdmin, authErrorResponse } from "@/lib/auth-utils";

// GET - получить все заказы с фильтрами
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.success) return authErrorResponse(authResult);
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const sortOrder = searchParams.get("sortOrder") || "desc";
  
  const offset = (page - 1) * limit;
  
  try {
    // Строим условия фильтрации
    const conditions = [];
    
    if (status && status !== "all") {
      conditions.push(sql`${orders.status} = ${status}`);
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(orders.orderNumber, `%${search}%`),
          ilike(orders.customerName, `%${search}%`),
          ilike(orders.customerPhone, `%${search}%`),
          ilike(orders.customerEmail, `%${search}%`)
        )
      );
    }
    
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Получаем заказы с частями
    const allOrders = await db.query.orders.findMany({
      where,
      orderBy: sortOrder === "desc" ? [desc(orders.createdAt)] : [orders.createdAt],
      limit,
      offset,
      with: {
        parts: {
          with: {
            store: true,
            items: true,
          },
        },
        items: true,
        user: {
          columns: {
            id: true,
            username: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    
    // Подсчитываем общее количество
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(where);
    
    return NextResponse.json({
      orders: allOrders,
      pagination: {
        page,
        limit,
        total: Number(count),
        pages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Ошибка получения заказов" }, { status: 500 });
  }
}
