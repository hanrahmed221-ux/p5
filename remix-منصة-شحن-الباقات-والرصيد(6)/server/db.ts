import { postgresDb, hashPassword, verifyPassword } from './postgresDb.ts';

export const db = postgresDb;
export { hashPassword, verifyPassword };
