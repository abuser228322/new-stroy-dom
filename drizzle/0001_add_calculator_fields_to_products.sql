ALTER TABLE "products" ADD COLUMN "consumption" real;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "consumption_unit" varchar(100);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "bag_weight" real;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "calculator_category_slug" varchar(100);