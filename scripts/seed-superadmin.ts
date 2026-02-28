import 'dotenv/config';
import argon2 from 'argon2';
import { db, users } from '../db/client';

async function main() {
  const hash = await argon2.hash('YourP@ssw0rd');
  await db.insert(users).values({
    name: 'Super Admin',
    email: 'superadmin@example.com',
    password: hash,
    role: 'SUPERADMIN',
    isSuperAdmin: true,
    tenantId: null,
  });
  console.log('Superadmin created');
}

main().catch((e)=>{ console.error(e); process.exit(1); });