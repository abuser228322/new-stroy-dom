-- Миграция для мультимагазинности
-- Добавляет таблицу stores, обновляет products и структуру заказов

-- ==================== ИЗМЕНЕНИЕ ENUM delivery_type ====================
-- Удаляем старые значения и добавляем новые
DO $$ 
BEGIN
    -- Проверяем существует ли тип
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_type') THEN
        -- Удаляем старый enum и создаём новый
        ALTER TYPE delivery_type RENAME TO delivery_type_old;
        CREATE TYPE delivery_type AS ENUM ('pickup', 'delivery');
        
        -- Для orders мигрируем значения
        ALTER TABLE orders ADD COLUMN delivery_type_new delivery_type;
        UPDATE orders SET delivery_type_new = 
            CASE 
                WHEN delivery_type_old::text IN ('pickup_rybinskaya', 'pickup_svobody') THEN 'pickup'::delivery_type
                ELSE 'delivery'::delivery_type
            END;
        
        -- Сохраняем в temp колонку какой магазин был выбран для pickup
        ALTER TABLE orders ADD COLUMN temp_pickup_store VARCHAR(50);
        UPDATE orders SET temp_pickup_store = 
            CASE 
                WHEN delivery_type_old::text = 'pickup_rybinskaya' THEN 'rybinskaya'
                WHEN delivery_type_old::text = 'pickup_svobody' THEN 'svobody'
                ELSE NULL
            END;
        
        DROP TYPE delivery_type_old;
    ELSE
        CREATE TYPE delivery_type AS ENUM ('pickup', 'delivery');
    END IF;
END $$;

-- ==================== ТАБЛИЦА МАГАЗИНОВ ====================
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    address VARCHAR(500) NOT NULL,
    phone VARCHAR(20),
    working_hours JSONB,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    assortment_description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Добавляем начальные магазины
INSERT INTO stores (slug, name, short_name, address, phone, working_hours, assortment_description, sort_order) VALUES
(
    'rybinskaya',
    'Строй Дом - Рыбинская',
    'Рыбинская',
    'ул. Рыбинская, 25Н, г. Астрахань',
    '+79371333366',
    '{"monSat": "08:00-16:00", "sun": "08:00-14:00"}'::jsonb,
    'Стройматериалы: смеси, профили, гипсокартон, утеплители, крепёж, инструменты',
    1
),
(
    'svobody',
    'Строй Дом - пл. Свободы',
    'пл. Свободы',
    'пл. Свободы, 14К, г. Астрахань',
    '+79371333366',
    '{"monSat": "09:00-19:00", "sun": "10:00-18:00"}'::jsonb,
    'Напольные покрытия, двери, фурнитура, отделочные материалы',
    2
)
ON CONFLICT (slug) DO NOTHING;

-- ==================== ОБНОВЛЕНИЕ PRODUCTS ====================
ALTER TABLE products ADD COLUMN IF NOT EXISTS store_id INTEGER REFERENCES stores(id);

-- Все существующие товары привязываем к магазину Рыбинская (id=1)
UPDATE products SET store_id = (SELECT id FROM stores WHERE slug = 'rybinskaya' LIMIT 1) 
WHERE store_id IS NULL;

-- ==================== ТАБЛИЦА ЧАСТЕЙ ЗАКАЗА ====================
CREATE TABLE IF NOT EXISTS order_parts (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES stores(id),
    delivery_type delivery_type NOT NULL,
    delivery_address TEXT,
    delivery_comment TEXT,
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_price NUMERIC(10, 2) DEFAULT 0,
    part_status order_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ==================== ОБНОВЛЕНИЕ ORDER_ITEMS ====================
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS order_part_id INTEGER REFERENCES order_parts(id) ON DELETE CASCADE;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS store_id INTEGER REFERENCES stores(id);

-- ==================== МИГРАЦИЯ СУЩЕСТВУЮЩИХ ЗАКАЗОВ ====================
-- Создаём части для существующих заказов
DO $$
DECLARE
    order_rec RECORD;
    new_part_id INTEGER;
    store_id_val INTEGER;
BEGIN
    -- Получаем ID магазина Рыбинская
    SELECT id INTO store_id_val FROM stores WHERE slug = 'rybinskaya' LIMIT 1;
    
    -- Для каждого заказа создаём часть
    FOR order_rec IN SELECT id, subtotal, delivery_type_new, delivery_address, delivery_comment, temp_pickup_store FROM orders LOOP
        -- Определяем магазин по сохранённому pickup store
        IF order_rec.temp_pickup_store = 'svobody' THEN
            SELECT id INTO store_id_val FROM stores WHERE slug = 'svobody' LIMIT 1;
        ELSE
            SELECT id INTO store_id_val FROM stores WHERE slug = 'rybinskaya' LIMIT 1;
        END IF;
        
        INSERT INTO order_parts (order_id, store_id, delivery_type, delivery_address, delivery_comment, subtotal, part_status)
        VALUES (
            order_rec.id, 
            store_id_val,
            COALESCE(order_rec.delivery_type_new, 'pickup'::delivery_type),
            order_rec.delivery_address,
            order_rec.delivery_comment,
            COALESCE(order_rec.subtotal, 0),
            'pending'
        )
        RETURNING id INTO new_part_id;
        
        -- Обновляем order_items этого заказа
        UPDATE order_items SET order_part_id = new_part_id, store_id = store_id_val
        WHERE order_id = order_rec.id;
    END LOOP;
END $$;

-- ==================== ОЧИСТКА ORDERS ====================
-- Удаляем временные и перенесённые колонки из orders
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_type_old CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_type_new CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS temp_pickup_store CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_type CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_address CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_comment CASCADE;

-- ==================== ИНДЕКСЫ ====================
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_order_parts_order_id ON order_parts(order_id);
CREATE INDEX IF NOT EXISTS idx_order_parts_store_id ON order_parts(store_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_part_id ON order_items(order_part_id);
CREATE INDEX IF NOT EXISTS idx_order_items_store_id ON order_items(store_id);
