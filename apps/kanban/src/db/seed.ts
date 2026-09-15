import { and, eq } from "drizzle-orm"

import type { Database } from "./client.ts"
import {
  board,
  card,
  cardAssignee,
  column,
  comment,
  member,
  organization,
  subtask,
  user
} from "./schema.ts"

export const DEMO_ORG_SLUG = "shadowon-outlet"
export const DEMO_ORG_NAME = "Shadowon Outlet"
export const DEMO_BOARD_NAME = "Kanban Board"

const EMMA_ID = "user_emma"
const DANIEL_ID = "user_daniel"
const BOARD_ID = "board_demo"
const COL_BACKLOG = "col_backlog"
const COL_PROGRESS = "col_progress"
const COL_DONE = "col_done"
const CARD_STRIPE = "card_stripe"
const CARD_DARK = "card_dark"
const CARD_CICD = "card_cicd"

function now(): Date {
  return new Date()
}

export async function ensureDemoWorkspace(db: Database, visitorId: string): Promise<string> {
  const existing = await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, DEMO_ORG_SLUG))
    .limit(1)

  const organizationId = existing[0]?.id ?? crypto.randomUUID()
  const createdAt = now()

  if (existing[0] === undefined) {
    await db.insert(organization).values({
      id: organizationId,
      name: DEMO_ORG_NAME,
      slug: DEMO_ORG_SLUG,
      createdAt
    })
  }

  await ensureSeedPeople(db, organizationId, createdAt)
  await ensureMembership(db, organizationId, visitorId, createdAt)
  await ensureDemoBoard(db, organizationId, createdAt)

  return organizationId
}

async function ensureSeedPeople(
  db: Database,
  organizationId: string,
  createdAt: Date
): Promise<void> {
  const people = [
    { id: EMMA_ID, name: "Emma Johnson", email: "emma@example.test" },
    { id: DANIEL_ID, name: "Daniel Smith", email: "daniel@example.test" }
  ]

  for (const person of people) {
    const found = await db.select({ id: user.id }).from(user).where(eq(user.id, person.id)).limit(1)
    if (found[0] === undefined) {
      await db.insert(user).values({
        id: person.id,
        name: person.name,
        email: person.email,
        emailVerified: true,
        isAnonymous: false,
        createdAt,
        updatedAt: createdAt
      })
    }

    await ensureMembership(db, organizationId, person.id, createdAt)
  }
}

async function ensureMembership(
  db: Database,
  organizationId: string,
  userId: string,
  createdAt: Date
): Promise<void> {
  const found = await db
    .select({ id: member.id })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
    .limit(1)

  if (found[0] !== undefined) {
    return
  }

  const members = await db
    .select({ id: member.id })
    .from(member)
    .where(eq(member.organizationId, organizationId))
    .limit(1)

  await db.insert(member).values({
    id: crypto.randomUUID(),
    organizationId,
    userId,
    role: members[0] === undefined ? "owner" : "member",
    createdAt
  })
}

async function ensureDemoBoard(
  db: Database,
  organizationId: string,
  createdAt: Date
): Promise<void> {
  const existing = await db
    .select({ id: board.id })
    .from(board)
    .where(eq(board.organizationId, organizationId))
    .limit(1)

  if (existing[0] !== undefined) {
    return
  }

  await db.insert(board).values({
    id: BOARD_ID,
    organizationId,
    name: DEMO_BOARD_NAME,
    createdAt
  })

  await db.insert(column).values([
    { id: COL_BACKLOG, organizationId, boardId: BOARD_ID, name: "Backlog", position: 0, createdAt },
    {
      id: COL_PROGRESS,
      organizationId,
      boardId: BOARD_ID,
      name: "In Progress",
      position: 1,
      createdAt
    },
    { id: COL_DONE, organizationId, boardId: BOARD_ID, name: "Done", position: 2, createdAt }
  ])

  await db.insert(card).values([
    {
      id: CARD_STRIPE,
      organizationId,
      boardId: BOARD_ID,
      columnId: COL_BACKLOG,
      title: "Integrate Stripe payment gateway",
      description: "Set up and configure Stripe API for handling credit card transactions.",
      priority: "high",
      dueDate: "2026-09-20",
      progress: 33,
      position: 0,
      createdAt,
      updatedAt: createdAt
    },
    {
      id: CARD_DARK,
      organizationId,
      boardId: BOARD_ID,
      columnId: COL_PROGRESS,
      title: "Dark mode toggle implementation",
      description: "Allow users to switch between light and dark themes in settings.",
      priority: "high",
      dueDate: "2026-09-18",
      progress: 33,
      position: 0,
      createdAt,
      updatedAt: createdAt
    },
    {
      id: CARD_CICD,
      organizationId,
      boardId: BOARD_ID,
      columnId: COL_DONE,
      title: "Set up CI/CD pipeline",
      description: "Automate deployment process using GitHub Actions and Vercel.",
      priority: "high",
      dueDate: "2026-09-12",
      progress: 100,
      position: 0,
      createdAt,
      updatedAt: createdAt
    }
  ])

  await db.insert(cardAssignee).values([
    { cardId: CARD_STRIPE, userId: EMMA_ID, organizationId },
    { cardId: CARD_STRIPE, userId: DANIEL_ID, organizationId },
    { cardId: CARD_DARK, userId: DANIEL_ID, organizationId },
    { cardId: CARD_CICD, userId: EMMA_ID, organizationId }
  ])

  await db.insert(subtask).values([
    {
      id: "sub_stripe_1",
      organizationId,
      cardId: CARD_STRIPE,
      title: "Create Stripe account and API keys",
      done: true,
      position: 0,
      createdAt
    },
    {
      id: "sub_stripe_2",
      organizationId,
      cardId: CARD_STRIPE,
      title: "Implement checkout session endpoint",
      done: false,
      position: 1,
      createdAt
    },
    {
      id: "sub_stripe_3",
      organizationId,
      cardId: CARD_STRIPE,
      title: "Handle webhook events",
      done: false,
      position: 2,
      createdAt
    }
  ])

  await db.insert(comment).values({
    id: "comment_stripe_1",
    organizationId,
    cardId: CARD_STRIPE,
    userId: DANIEL_ID,
    body: "Test keys are in the shared vault. Webhook endpoint is next.",
    createdAt: new Date("2026-08-19T16:02:00.000Z")
  })
}
