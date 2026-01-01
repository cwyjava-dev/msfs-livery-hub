import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, liveries, InsertLivery, contacts, InsertContact, Livery } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Livery queries
export async function createLivery(livery: InsertLivery) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(liveries).values(livery);
  return result;
}

export async function getLiveries(filters?: {
  manufacturer?: string;
  aircraft?: string;
  brand?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];
  
  if (filters?.manufacturer) {
    conditions.push(eq(liveries.manufacturer, filters.manufacturer as any));
  }
  if (filters?.aircraft) {
    conditions.push(eq(liveries.aircraft, filters.aircraft));
  }
  if (filters?.brand) {
    conditions.push(eq(liveries.brand, filters.brand));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(liveries.liveryName, `%${filters.search}%`),
        like(liveries.description, `%${filters.search}%`)
      )
    );
  }

  let query = db
    .select({
      livery: liveries,
      user: {
        id: users.id,
        name: users.name,
      },
    })
    .from(liveries)
    .leftJoin(users, eq(liveries.userId, users.id))
    .orderBy(desc(liveries.createdAt));

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
}

export async function getLiveryById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      livery: liveries,
      user: {
        id: users.id,
        name: users.name,
      },
    })
    .from(liveries)
    .leftJoin(users, eq(liveries.userId, users.id))
    .where(eq(liveries.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function incrementDownloadCount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(liveries)
    .set({ downloadCount: sql`${liveries.downloadCount} + 1` })
    .where(eq(liveries.id, id));
}

export async function getUserLiveries(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(liveries)
    .where(eq(liveries.userId, userId))
    .orderBy(desc(liveries.createdAt));
}

// Contact queries
export async function createContact(contact: InsertContact) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(contacts).values(contact);
  return result;
}

export async function updateLivery(id: number, updates: Partial<InsertLivery>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(liveries)
    .set(updates)
    .where(eq(liveries.id, id));
}

export async function deleteLivery(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(liveries)
    .where(eq(liveries.id, id));
}

export async function getContacts(limit?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(contacts).orderBy(desc(contacts.createdAt));
  
  if (limit) {
    query = query.limit(limit) as any;
  }

  return await query;
}
