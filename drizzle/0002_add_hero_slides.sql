CREATE TABLE IF NOT EXISTS "hero_slides" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"button_text" varchar(100),
	"button_link" varchar(255),
	"emoji" varchar(50) NOT NULL,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
