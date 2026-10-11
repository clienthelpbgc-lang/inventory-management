ALTER TABLE "products" ALTER COLUMN "min_order_qty" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "max_order_qty" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "max_order_qty" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "reorder_qty" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "opening_stock" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "current_stock" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "purchase_items" ALTER COLUMN "quantity" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "quantity" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "returned_qty" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "purchase_requests" ALTER COLUMN "total_requested_qty" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "purchase_request_items" ALTER COLUMN "requested_qty" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "purchase_request_items" ALTER COLUMN "approved_qty" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "purchase_order_items" ALTER COLUMN "ordered_qty" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "purchase_order_items" ALTER COLUMN "received_qty" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "total_ordered_qty" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "process_order_items" ALTER COLUMN "sent_qty" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "process_order_items" ALTER COLUMN "received_qty" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "process_order_items" ALTER COLUMN "processing_cost" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "sale_returns" ALTER COLUMN "total_returned_qty" SET DATA TYPE numeric(14, 3);--> statement-breakpoint
ALTER TABLE "sale_return_items" ALTER COLUMN "quantity" SET DATA TYPE numeric(14, 3);