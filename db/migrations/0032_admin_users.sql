-- admin_users was first created by hand in Supabase, so this must be a no-op
-- where it already exists. RLS with no policies keeps browser clients (anon /
-- authenticated keys) from reading the admin list; membership is only checked
-- server-side over the direct DB connection, which bypasses RLS.
CREATE TABLE IF NOT EXISTS "admin_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"role" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_users" ENABLE ROW LEVEL SECURITY;