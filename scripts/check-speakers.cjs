require("dotenv").config({ path: ".env.local" });
const postgres = require("postgres");
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
(async () => {
  const rows = await sql`SELECT id, name FROM speakers ORDER BY name`;
  console.log("speakers in DB:");
  for (const r of rows) console.log(" ", r.id, r.name);
  const enumRows = await sql`SELECT unnest(enum_range(NULL::target_class))::text AS v`;
  console.log("target_class values:", enumRows.map(r => r.v));
  await sql.end();
})();
