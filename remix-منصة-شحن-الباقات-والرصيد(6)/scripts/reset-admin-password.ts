import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../src/db/index.ts';
import * as schema from '../src/db/schema.ts';
import { hashPassword } from '../server/postgresDb.ts';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password || password.length < 12) {
  throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters) for this one-time reset.');
}

const admins = await db.select({ id: schema.admins.id }).from(schema.admins).where(eq(schema.admins.email, email));
const passwordHash = hashPassword(password);

if (admins.length > 0) {
  await db.update(schema.admins).set({ passwordHash }).where(eq(schema.admins.id, admins[0].id));
  console.log(`Admin password reset for ${email}.`);
} else {
  await db.insert(schema.admins).values({
    id: `admin_${crypto.randomUUID()}`,
    name: 'مدير المنصة',
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  });
  console.log(`Admin account created for ${email}.`);
}

process.exit(0);
