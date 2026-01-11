import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, authErrorResponse } from "@/lib/auth-utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - получить магазин по ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAdmin(request);
  if (!authResult.success) return authErrorResponse(authResult);
  
  const { id } = await params;
  const storeId = parseInt(id, 10);
  
  if (isNaN(storeId)) {
    return NextResponse.json({ error: "Неверный ID магазина" }, { status: 400 });
  }
  
  try {
    const store = await db.query.stores.findFirst({
      where: eq(stores.id, storeId),
    });
    
    if (!store) {
      return NextResponse.json({ error: "Магазин не найден" }, { status: 404 });
    }
    
    return NextResponse.json(store);
  } catch (error) {
    console.error("Error fetching store:", error);
    return NextResponse.json({ error: "Ошибка получения магазина" }, { status: 500 });
  }
}

// PUT - обновить магазин
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAdmin(request);
  if (!authResult.success) return authErrorResponse(authResult);
  
  const { id } = await params;
  const storeId = parseInt(id, 10);
  
  if (isNaN(storeId)) {
    return NextResponse.json({ error: "Неверный ID магазина" }, { status: 400 });
  }
  
  try {
    const body = await request.json();
    const {
      name,
      shortName,
      address,
      phone,
      workingHours,
      assortmentDescription,
      isActive,
      sortOrder,
    } = body;
    
    // Проверяем существование магазина
    const existingStore = await db.query.stores.findFirst({
      where: eq(stores.id, storeId),
    });
    
    if (!existingStore) {
      return NextResponse.json({ error: "Магазин не найден" }, { status: 404 });
    }
    
    // Обновляем магазин
    const [updatedStore] = await db
      .update(stores)
      .set({
        name: name ?? existingStore.name,
        shortName: shortName ?? existingStore.shortName,
        address: address ?? existingStore.address,
        phone: phone ?? existingStore.phone,
        workingHours: workingHours ?? existingStore.workingHours,
        assortmentDescription: assortmentDescription ?? existingStore.assortmentDescription,
        isActive: isActive ?? existingStore.isActive,
        sortOrder: sortOrder ?? existingStore.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId))
      .returning();
    
    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error("Error updating store:", error);
    return NextResponse.json({ error: "Ошибка обновления магазина" }, { status: 500 });
  }
}
