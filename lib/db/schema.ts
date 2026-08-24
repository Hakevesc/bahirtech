import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/* ============================================================================
   BAHIR TECH — DATABASE SCHEMA (Drizzle ORM)
   Covers the full data model from the implementation plan:
     Phase 4  posts + media (CMS/blog + media library)
     Phase 5  jobs + applications (careers)
     Phase 6  contact_messages + subscribers
     Phase 3  admins (auth foundation)
   Migrations are generated from this file with `npm run db:generate`.
   ============================================================================ */

/** Admin users — one admin to start; auth lands in Phase 3. */
export const admins = pgTable(
  "admins",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("admins_email_uq").on(t.email)]
);

/** Blog / insights posts (Phase 4 CMS). */
export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    /** Tiptap rich-text JSON, stored as text (Phase 4). */
    content: text("content"),
    coverImageId: integer("cover_image_id").references(() => media.id, {
      onDelete: "set null",
    }),
    status: text("status", { enum: ["draft", "published"] })
      .notNull()
      .default("draft"),
    /** Optional category shown as the featured card tag (Phase 4). */
    category: text("category"),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    /** Optional Callout / CTA banner settings */
    ctaText: text("cta_text"),
    ctaLink: text("cta_link"),
    ctaLabel: text("cta_label"),
    authorId: integer("author_id").references(() => admins.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("posts_slug_uq").on(t.slug),
    index("posts_status_idx").on(t.status),
    index("posts_published_at_idx").on(t.publishedAt),
  ]
);
export const media = pgTable(
  "media",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(), // original filename
    storedName: text("stored_name").notNull(), // unique name on disk
    path: text("path").notNull(), // public URL path (/assets/...)
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull().default(0),
    width: integer("width"),
    height: integer("height"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("media_path_idx").on(t.path)]
);

/** Careers: open job postings (Phase 5). */
export const jobs = pgTable(
  "jobs",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    department: text("department"),
    location: text("location").notNull(),
    /** full-time | part-time | contract | internship */
    type: text("type").notNull().default("full-time"),
    summary: text("summary"),
    description: text("description").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("jobs_slug_uq").on(t.slug),
    index("jobs_active_idx").on(t.isActive),
  ]
);

/** Job applications with resume upload (Phase 5). */
export const applications = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    jobId: integer("job_id")
      .references(() => jobs.id, { onDelete: "cascade" })
      .notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    /** resume stored under storage/resumes/<storedName> (gated download). */
    resumePath: text("resume_path").notNull(),
    coverLetter: text("cover_letter"),
    /** new | reviewing | interview | offer | rejected | hired */
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("applications_job_idx").on(t.jobId)]
);

/** Contact form messages (Phase 6). */
export const contactMessages = pgTable(
  "contact_messages",
  {
    id: serial("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    service: text("service"),
    message: text("message").notNull(),
    /** new / read / replied */
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("contact_messages_status_idx").on(t.status)]
);

/** Newsletter subscribers (Phase 6). */
export const subscribers = pgTable(
  "subscribers",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("subscribers_email_uq").on(t.email)]
);

/** Auth sessions (Phase 3) — httpOnly cookie token → admin. */
export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    adminId: integer("admin_id")
      .references(() => admins.id, { onDelete: "cascade" })
      .notNull(),
    /** opaque random token stored in the httpOnly cookie */
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("sessions_token_uq").on(t.token),
    index("sessions_admin_idx").on(t.adminId),
  ]
);
export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;
export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;