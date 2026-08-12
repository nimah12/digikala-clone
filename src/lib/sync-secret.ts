export function isSyncSecret(secret: string | null | undefined): boolean {
  if (!secret) return false;
  const expected = process.env.SYNC_SECRET;
  if (!expected) return false;
  return secret === expected;
}
