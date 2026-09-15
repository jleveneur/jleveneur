import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

const createdAt = () => integer("created_at", { mode: "timestamp_ms" }).notNull()
const updatedAt = () => integer("updated_at", { mode: "timestamp_ms" }).notNull()

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  isAnonymous: integer("is_anonymous", { mode: "boolean" }),
  lastActiveOrganizationId: text("last_active_organization_id"),
  createdAt: createdAt(),
  updatedAt: updatedAt()
})

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    activeOrganizationId: text("active_organization_id"),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (table) => [index("idx_session__user_id").on(table.userId)]
)

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (table) => [index("idx_account__user_id").on(table.userId)]
)

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (table) => [index("idx_verification__identifier").on(table.identifier)]
)

export const organization = sqliteTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  metadata: text("metadata"),
  createdAt: createdAt()
})

export const member = sqliteTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    createdAt: createdAt()
  },
  (table) => [
    uniqueIndex("uq_member__organization_id_user_id").on(table.organizationId, table.userId),
    index("idx_member__user_id").on(table.userId)
  ]
)

export const invitation = sqliteTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").notNull().default("pending"),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: createdAt()
  },
  (table) => [index("idx_invitation__organization_id").on(table.organizationId)]
)

export const board = sqliteTable(
  "board",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: createdAt()
  },
  (table) => [index("idx_board__organization_id").on(table.organizationId)]
)

export const column = sqliteTable(
  "column",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    boardId: text("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    position: integer("position").notNull(),
    createdAt: createdAt()
  },
  (table) => [index("idx_column__organization_id_board_id").on(table.organizationId, table.boardId)]
)

export const card = sqliteTable(
  "card",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    boardId: text("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    columnId: text("column_id")
      .notNull()
      .references(() => column.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    priority: text("priority").notNull().default("medium"),
    dueDate: text("due_date"),
    progress: integer("progress").notNull().default(0),
    position: integer("position").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (table) => [index("idx_card__organization_id_column_id").on(table.organizationId, table.columnId)]
)

export const cardAssignee = sqliteTable(
  "card_assignee",
  {
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" })
  },
  (table) => [
    uniqueIndex("uq_card_assignee__card_id_user_id").on(table.cardId, table.userId),
    index("idx_card_assignee__organization_id").on(table.organizationId)
  ]
)

export const subtask = sqliteTable(
  "subtask",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    done: integer("done", { mode: "boolean" }).notNull().default(false),
    position: integer("position").notNull(),
    createdAt: createdAt()
  },
  (table) => [index("idx_subtask__organization_id_card_id").on(table.organizationId, table.cardId)]
)

/**
 * Attachment *metadata* only. File bytes live in R2 at `r2Key`.
 * There is no blob/data column on purpose.
 */
export const attachment = sqliteTable(
  "attachment",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    r2Key: text("r2_key").notNull(),
    createdAt: createdAt()
  },
  (table) => [
    index("idx_attachment__organization_id_card_id").on(table.organizationId, table.cardId)
  ]
)

export const comment = sqliteTable(
  "comment",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: createdAt()
  },
  (table) => [index("idx_comment__organization_id_card_id").on(table.organizationId, table.cardId)]
)

export const notification = sqliteTable(
  "notification",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    read: integer("read", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt()
  },
  (table) => [
    index("idx_notification__organization_id_user_id").on(table.organizationId, table.userId)
  ]
)
