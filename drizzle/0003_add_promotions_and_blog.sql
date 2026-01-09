-- Таблица акций
CREATE TABLE IF NOT EXISTS "promotions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"discount" varchar(50),
	"valid_until" varchar(100),
	"image" text,
	"icon" varchar(50) DEFAULT 'percent',
	"color" varchar(50) DEFAULT 'red',
	"link" varchar(255),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Таблица блога
CREATE TABLE IF NOT EXISTS "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"title" varchar(255) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"image" text,
	"category" varchar(100),
	"tags" text,
	"author_id" integer REFERENCES "users"("id"),
	"view_count" integer DEFAULT 0,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Начальные данные для акций
INSERT INTO promotions (title, description, discount, valid_until, icon, color, link, sort_order, is_active) VALUES 
('Скидка 10% на сухие смеси', 'При покупке от 10 мешков любых сухих смесей действует скидка 10%', '-10%', 'До конца месяца', 'percent', 'red', '/catalog/suhie-smesi', 0, true),
('Бесплатная доставка', 'При заказе от 50 000 ₽ — бесплатная доставка по городу Астрахань', 'Бесплатно', 'Постоянная акция', 'truck', 'green', '/payment', 1, true),
('Профнастил — хит продаж!', 'Специальные цены на профнастил С-8 и МП-20. Выгодно для кровли и забора', 'Низкие цены', 'Пока есть на складе', 'tag', 'blue', '/catalog/profnastil', 2, true),
('Скидка строителям 15%', 'Для строительных бригад и прорабов — постоянная скидка 15% на весь ассортимент', '-15%', 'Постоянная акция', 'gift', 'orange', '/contacts', 3, true);
