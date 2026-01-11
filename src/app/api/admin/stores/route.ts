import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { requireAdmin, authErrorResponse } from "@/lib/auth-utils";

// GET - получить все магазины
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.success) return authErrorResponse(authResult);
  
  try {
    const allStores = await db.query.stores.findMany({
      orderBy: [asc(stores.sortOrder)],
    });
    
    return NextResponse.json(allStores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json({ error: "Ошибка получения магазинов" }, { status: 500 });
  }
}
