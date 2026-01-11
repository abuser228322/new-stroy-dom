-- Енумы для заказов
CREATE TYPE "order_status" AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'ready',
  'delivering',
  'completed',
  'cancelled'
);

CREATE TYPE "delivery_type" AS ENUM (
  'pickup_rybinskaya',
  'pickup_svobody',
  'delivery'
);

CREATE TYPE "payment_method" AS ENUM (
  'cash',
  'card',
  'online'
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS "orders" (
  "id" SERIAL PRIMARY KEY,
  "order_number" VARCHAR(50) NOT NULL UNIQUE,
  "user_id" INTEGER REFERENCES "users"("id"),
  
  "customer_name" VARCHAR(255) NOT NULL,
  "customer_phone" VARCHAR(20) NOT NULL,
  "customer_email" VARCHAR(255),
  
  "status" "order_status" DEFAULT 'pending' NOT NULL,
  "delivery_type" "delivery_type" NOT NULL,
  "payment_method" "payment_method" NOT NULL,
  
  "delivery_address" TEXT,
  "delivery_comment" TEXT,
  
  "subtotal" NUMERIC(10, 2) NOT NULL,
  "delivery_price" NUMERIC(10, 2) DEFAULT '0',
  "discount" NUMERIC(10, 2) DEFAULT '0',
  "total" NUMERIC(10, 2) NOT NULL,
  
  "coupon_id" INTEGER REFERENCES "coupons"("id"),
  "coupon_code" VARCHAR(50),
  
  "customer_comment" TEXT,
  "admin_comment" TEXT,
  
  "confirmed_at" TIMESTAMP,
  "completed_at" TIMESTAMP,
  "cancelled_at" TIMESTAMP,
  "cancel_reason" TEXT,
  
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Таблица позиций заказа
CREATE TABLE IF NOT EXISTS "order_items" (
  "id" SERIAL PRIMARY KEY,
  "order_id" INTEGER NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  
  "product_id" INTEGER REFERENCES "products"("id"),
  
  "url_id" VARCHAR(255) NOT NULL,
  "title" VARCHAR(500) NOT NULL,
  "image" TEXT,
  
  "quantity" INTEGER NOT NULL,
  "price" NUMERIC(10, 2) NOT NULL,
  "size" VARCHAR(100),
  "unit" VARCHAR(50),
  
  "total" NUMERIC(10, 2) NOT NULL,
  
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Индексы
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at" DESC);
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");
