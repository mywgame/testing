/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index.ts";

async function main() {
  console.log("----------------------------------------------------");
  console.log("CeFi Platform - Database Migration System");
  console.log("----------------------------------------------------");

  try {
    console.log("Starting migration run using shared database pool...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("🎉 SUCCESS: All database schema migrations applied successfully!");
    console.log("----------------------------------------------------");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ CRITICAL ERROR: Migration run failed:", error);
    console.log("----------------------------------------------------");
    try {
      await pool.end();
    } catch (e) {}
    process.exit(1);
  }
}

main();
