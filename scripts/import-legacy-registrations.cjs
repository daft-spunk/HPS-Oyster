// One-off: import the legacy hpsoyster.com export into the active session.
// Mirrors the bulk-upload server action's parsing logic.
require("dotenv").config({ path: ".env.local" });
const fs = require("node:fs");
const path = require("node:path");
const postgres = require("postgres");

const SESSION_ID = "d82fa83b-5469-4e24-9e53-97a87f963ae5";
const CSV_PATH = path.join(__dirname, "legacy-export.csv");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        if (row.some((c) => c.length > 0)) rows.push(row);
        row = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((c) => c.length > 0)) rows.push(row);
  }
  let headerIdx = rows.findIndex((r) => r.some((c) => /Roll\s*Number/i.test(c)));
  if (headerIdx < 0) headerIdx = 0;
  const headers = rows[headerIdx].map((h) => h.trim());
  return rows.slice(headerIdx + 1).map((r) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (r[i] || "").trim();
    });
    return obj;
  });
}

(async () => {
  const sql = postgres(process.env.DATABASE_URL, { max: 1, idle_timeout: 5 });
  try {
    const text = fs.readFileSync(CSV_PATH, "utf8");
    const rows = parseCsv(text);
    console.log(`Parsed ${rows.length} data rows from CSV.`);

    const linked = await sql`
      SELECT sc.id, c.name FROM session_companies sc
      JOIN companies c ON c.id = sc.company_id
      WHERE sc.session_id = ${SESSION_ID}
    `;
    const byName = new Map();
    for (const sc of linked) byName.set(sc.name.toLowerCase().trim(), sc.id);
    console.log("Sponsors linked to session:", Array.from(byName.keys()));

    const lookup = (cell) => {
      if (!cell || !cell.trim()) return { id: null, reason: null };
      const dashIdx = cell.indexOf(" - ");
      const head = (dashIdx > 0 ? cell.slice(0, dashIdx) : cell).trim();
      const reason = dashIdx > 0 ? cell.slice(dashIdx + 3).trim() : "";
      const companyName = head.split(",")[0].trim().toLowerCase();
      let id = null;
      for (const [k, v] of byName) {
        if (k === companyName || k.startsWith(companyName) || companyName.startsWith(k)) {
          id = v;
          break;
        }
      }
      return { id, reason: reason || null };
    };

    // Insert every CSV row that isn't already in the DB at the EXACT same
    // timestamp. We dedup on (class, roll, created_at_seconds) so re-running
    // the importer is idempotent, but two genuinely-different submissions from
    // the same student (e.g. updated reasons later in the day) both stay.
    let inserted = 0;
    let skippedDup = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const studentName = (r["Name of the Student"] || "").trim();
      const rollNumber = (r["Roll Number"] || "").trim();
      const classSection = (r["Class/Section"] || "").trim();
      if (!studentName || !rollNumber) {
        errors.push(`Row ${i + 2}: missing student or roll`);
        continue;
      }
      const dateRaw = r["Date"] || "";
      const createdAt = dateRaw ? new Date(dateRaw.replace(" ", "T")) : null;
      const finalCreatedAt = createdAt && !isNaN(createdAt.getTime()) ? createdAt : new Date();

      const p1 = lookup(r["Internship 1"] || "");
      const p2 = lookup(r["Internship 2"] || "");
      const p3 = lookup(r["Internship 3"] || "");
      if (!p1.id || !p1.reason) {
        errors.push(`Row ${i + 2} (${studentName}, roll ${rollNumber}): no first preference matched`);
        continue;
      }

      // Idempotency: skip if a row with the same (class, roll, exact timestamp) is already in
      const [existing] = await sql`
        SELECT id FROM internship_registrations
        WHERE session_id = ${SESSION_ID}
          AND class_section = ${classSection}
          AND roll_number = ${rollNumber}
          AND date_trunc('second', created_at) = date_trunc('second', ${finalCreatedAt}::timestamptz)
        LIMIT 1
      `;
      if (existing) {
        skippedDup++;
        continue;
      }

      try {
        await sql`
          INSERT INTO internship_registrations (
            session_id, student_name, class_section, roll_number,
            parent_name, parent_email, parent_phone, interests,
            pref_1_session_company_id, pref_1_reason,
            pref_2_session_company_id, pref_2_reason,
            pref_3_session_company_id, pref_3_reason,
            created_at
          ) VALUES (
            ${SESSION_ID}, ${studentName}, ${classSection}, ${rollNumber},
            ${r["Parent Name"] || ""}, ${r["Parent Email Id"] || ""}, ${r["Parent Phone Number"] || ""},
            ${r["Child s general interests"] || null},
            ${p1.id}, ${p1.reason},
            ${p2.id || null}, ${p2.reason || null},
            ${p3.id || null}, ${p3.reason || null},
            ${finalCreatedAt}
          )
        `;
        inserted++;
      } catch (e) {
        errors.push(`Row ${i + 2} (${studentName}): ${e.message || e}`);
      }
    }

    console.log(`\n✅ Inserted: ${inserted}`);
    console.log(`↪︎ Skipped (already imported with same timestamp): ${skippedDup}`);
    if (errors.length) {
      console.log(`\n⚠ Errors / skips (${errors.length}):`);
      errors.forEach((e) => console.log("  -", e));
    }
  } finally {
    await sql.end({ timeout: 1 });
  }
})();
