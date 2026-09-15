const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "user" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "email_verified" integer NOT NULL DEFAULT 0,
    "image" text,
    "is_anonymous" integer,
    "last_active_organization_id" text,
    "created_at" integer NOT NULL,
    "updated_at" integer NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "session" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "token" text NOT NULL UNIQUE,
    "expires_at" integer NOT NULL,
    "ip_address" text,
    "user_agent" text,
    "active_organization_id" text,
    "created_at" integer NOT NULL,
    "updated_at" integer NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "idx_session__user_id" ON "session" ("user_id")`,
  `CREATE TABLE IF NOT EXISTS "account" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "account_id" text NOT NULL,
    "provider_id" text NOT NULL,
    "access_token" text,
    "refresh_token" text,
    "access_token_expires_at" integer,
    "refresh_token_expires_at" integer,
    "scope" text,
    "id_token" text,
    "password" text,
    "created_at" integer NOT NULL,
    "updated_at" integer NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "idx_account__user_id" ON "account" ("user_id")`,
  `CREATE TABLE IF NOT EXISTS "verification" (
    "id" text PRIMARY KEY NOT NULL,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expires_at" integer NOT NULL,
    "created_at" integer NOT NULL,
    "updated_at" integer NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "idx_verification__identifier" ON "verification" ("identifier")`,
  `CREATE TABLE IF NOT EXISTS "organization" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "slug" text NOT NULL UNIQUE,
    "logo" text,
    "metadata" text,
    "created_at" integer NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "member" (
    "id" text PRIMARY KEY NOT NULL,
    "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "role" text NOT NULL DEFAULT 'member',
    "created_at" integer NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "uq_member__organization_id_user_id" ON "member" ("organization_id", "user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_member__user_id" ON "member" ("user_id")`,
  `CREATE TABLE IF NOT EXISTS "invitation" (
    "id" text PRIMARY KEY NOT NULL,
    "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
    "email" text NOT NULL,
    "role" text,
    "status" text NOT NULL DEFAULT 'pending',
    "expires_at" integer NOT NULL,
    "inviter_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "created_at" integer NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "idx_invitation__organization_id" ON "invitation" ("organization_id")`,
  `CREATE TABLE IF NOT EXISTS "board" (
    "id" text PRIMARY KEY NOT NULL,
    "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "created_at" integer NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "idx_board__organization_id" ON "board" ("organization_id")`,
  `CREATE TABLE IF NOT EXISTS "column" (
    "id" text PRIMARY KEY NOT NULL,
    "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
    "board_id" text NOT NULL REFERENCES "board"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "position" integer NOT NULL,
    "created_at" integer NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "idx_column__organization_id_board_id" ON "column" ("organization_id", "board_id")`,
  `CREATE TABLE IF NOT EXISTS "card" (
    "id" text PRIMARY KEY NOT NULL,
    "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
    "board_id" text NOT NULL REFERENCES "board"("id") ON DELETE CASCADE,
    "column_id" text NOT NULL REFERENCES "column"("id") ON DELETE CASCADE,
    "title" text NOT NULL,
    "description" text NOT NULL DEFAULT '',
    "priority" text NOT NULL DEFAULT 'medium',
    "due_date" text,
    "progress" integer NOT NULL DEFAULT 0,
    "position" integer NOT NULL,
    "created_at" integer NOT NULL,
    "updated_at" integer NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "idx_card__organization_id_column_id" ON "card" ("organization_id", "column_id")`,
  `CREATE TABLE IF NOT EXISTS "card_assignee" (
    "card_id" text NOT NULL REFERENCES "card"("id") ON DELETE CASCADE,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "uq_card_assignee__card_id_user_id" ON "card_assignee" ("card_id", "user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_card_assignee__organization_id" ON "card_assignee" ("organization_id")`,
  `CREATE TABLE IF NOT EXISTS "subtask" (
    "id" text PRIMARY KEY NOT NULL,
    "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
    "card_id" text NOT NULL REFERENCES "card"("id") ON DELETE CASCADE,
    "title" text NOT NULL,
    "done" integer NOT NULL DEFAULT 0,
    "position" integer NOT NULL,
    "created_at" integer NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "idx_subtask__organization_id_card_id" ON "subtask" ("organization_id", "card_id")`,
  `CREATE TABLE IF NOT EXISTS "attachment" (
    "id" text PRIMARY KEY NOT NULL,
    "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
    "card_id" text NOT NULL REFERENCES "card"("id") ON DELETE CASCADE,
    "file_name" text NOT NULL,
    "content_type" text NOT NULL,
    "byte_size" integer NOT NULL,
    "r2_key" text NOT NULL,
    "created_at" integer NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "idx_attachment__organization_id_card_id" ON "attachment" ("organization_id", "card_id")`,
  `CREATE TABLE IF NOT EXISTS "comment" (
    "id" text PRIMARY KEY NOT NULL,
    "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
    "card_id" text NOT NULL REFERENCES "card"("id") ON DELETE CASCADE,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "body" text NOT NULL,
    "created_at" integer NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "idx_comment__organization_id_card_id" ON "comment" ("organization_id", "card_id")`,
  `CREATE TABLE IF NOT EXISTS "notification" (
    "id" text PRIMARY KEY NOT NULL,
    "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "kind" text NOT NULL,
    "title" text NOT NULL,
    "body" text NOT NULL,
    "read" integer NOT NULL DEFAULT 0,
    "created_at" integer NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "idx_notification__organization_id_user_id" ON "notification" ("organization_id", "user_id")`
] as const

export const ATTACHMENT_TABLE_SQL =
  STATEMENTS.find((sql) => sql.includes('CREATE TABLE IF NOT EXISTS "attachment"')) ??
  'CREATE TABLE IF NOT EXISTS "attachment"'

export async function ensureSchema(db: D1Database): Promise<void> {
  for (const statement of STATEMENTS) {
    await db.prepare(statement).run()
  }
}

let ready: Promise<void> | null = null

export function ensureSchemaOnce(db: D1Database): Promise<void> {
  ready ??= ensureSchema(db)
  return ready
}
