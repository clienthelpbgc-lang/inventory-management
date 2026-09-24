CREATE TABLE "user_active_days" (
	"user_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"day" date NOT NULL,
	CONSTRAINT "user_active_days_user_id_day_pk" PRIMARY KEY("user_id","day")
);
--> statement-breakpoint
ALTER TABLE "user_active_days" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_active_days" ADD CONSTRAINT "user_active_days_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_active_days" ADD CONSTRAINT "user_active_days_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_active_days_company_day_idx" ON "user_active_days" USING btree ("company_id","day");