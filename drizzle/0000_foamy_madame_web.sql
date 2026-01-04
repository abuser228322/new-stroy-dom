CREATE TYPE "public"."user_role" AS ENUM('SUPERADMIN', 'ADMIN', 'MODER', 'USER');--> statement-breakpoint
CREATE TABLE "calculator_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "calculator_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "calculator_formulas" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"formula_type" varchar(50) NOT NULL,
	"formula_params" jsonb,
	"result_unit" varchar(100) NOT NULL,
	"result_unit_template" varchar(255),
	"recommendations_template" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "calculator_formulas_category_id_unique" UNIQUE("category_id")
);
--> statement-breakpoint
CREATE TABLE "calculator_inputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"key" varchar(100) NOT NULL,
	"label" varchar(255) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"default_value" real NOT NULL,
	"min_value" real NOT NULL,
	"max_value" real,
	"step" real NOT NULL,
	"tooltip" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calculator_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"product_id" integer,
	"name" varchar(255) NOT NULL,
	"consumption" real NOT NULL,
	"consumption_unit" varchar(100) NOT NULL,
	"bag_weight" real,
	"price" numeric(10, 2),
	"tooltip" text,
	"product_url_id" varchar(255),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"short_name" varchar(100),
	"description" text,
	"image" text,
	"icon" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coupon_usages" (
	"id" serial PRIMARY KEY NOT NULL,
	"coupon_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"order_amount" numeric(10, 2),
	"discount_amount" numeric(10, 2),
	"used_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"min_order_amount" numeric(10, 2),
	"max_discount_amount" numeric(10, 2),
	"usage_limit" integer,
	"usage_per_user" integer DEFAULT 1,
	"usage_count" integer DEFAULT 0,
	"start_date" timestamp,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"url_id" varchar(255) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"image" text,
	"category_id" integer NOT NULL,
	"subcategory_id" integer NOT NULL,
	"price" numeric(10, 2),
	"prices_by_size" jsonb,
	"size_text" varchar(255),
	"unit" varchar(50) DEFAULT 'шт',
	"brand" varchar(255),
	"in_stock" boolean DEFAULT true,
	"is_weight" boolean DEFAULT false,
	"quantity_step" numeric(10, 2),
	"min_quantity" numeric(10, 2),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_url_id_unique" UNIQUE("url_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"user_agent" text,
	"ip" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "subcategories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"image" text,
	"category_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" text,
	"telegram_id" varchar(50),
	"telegram_username" varchar(100),
	"email" varchar(255),
	"email_verified" boolean DEFAULT false,
	"phone" varchar(20),
	"phone_verified" boolean DEFAULT false,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"avatar" text,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "calculator_formulas" ADD CONSTRAINT "calculator_formulas_category_id_calculator_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."calculator_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_inputs" ADD CONSTRAINT "calculator_inputs_category_id_calculator_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."calculator_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_products" ADD CONSTRAINT "calculator_products_category_id_calculator_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."calculator_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_products" ADD CONSTRAINT "calculator_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_id_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."subcategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;