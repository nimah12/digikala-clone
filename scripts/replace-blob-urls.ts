import { prisma } from "../src/lib/prisma";

const OLD = "https://a3sb8pw77kg7jhrn.public.blob.vercel-storage.com/";
const NEW = "https://digikala-clone-media.nimah12.workers.dev/";
const APPLY = process.argv.includes("--apply");

async function main() {
  const cols = await prisma.$queryRawUnsafe<
    { table_name: string; column_name: string }[]
  >(
    `SELECT table_name, column_name FROM information_schema.columns
     WHERE table_schema = 'public'
     AND data_type IN ('text', 'character varying')`,
  );

  let total = 0;
  for (const { table_name, column_name } of cols) {
    const t = `"${table_name}"`;
    const c = `"${column_name}"`;
    const rows = await prisma.$queryRawUnsafe<{ n: bigint }[]>(
      `SELECT COUNT(*) AS n FROM ${t} WHERE ${c} LIKE $1`,
      `%${OLD}%`,
    );
    const n = Number(rows[0].n);
    if (n === 0) continue;
    total += n;
    console.log(`${table_name}.${column_name}: ${n} رکورد`);
    if (APPLY) {
      await prisma.$executeRawUnsafe(
        `UPDATE ${t} SET ${c} = REPLACE(${c}, $1, $2) WHERE ${c} LIKE $3`,
        OLD,
        NEW,
        `%${OLD}%`,
      );
    }
  }

  console.log(
    APPLY
      ? `تغییر داده شد: ${total} رکورد`
      : `فقط گزارش: ${total} رکورد پیدا شد (برای اعمال، --apply بزن)`,
  );
}

main().finally(() => prisma.$disconnect());
