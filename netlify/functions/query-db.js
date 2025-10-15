import { Client } from "@neondatabase/serverless";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

/* ------------------------------
   Netlify Serverless Function
------------------------------ */
export async function handler(event, context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 204, headers: corsHeaders };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const query = body.query || "SELECT NOW()";

    const connectionString =
      process.env.NEON_DB_URL || process.env.NETLIFY_DATABASE_URL;

    if (!connectionString) {
      console.error(
        "❌ No database URL found. Env keys available:",
        Object.keys(process.env).filter((k) => k.toLowerCase().includes("db")),
      );
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error:
            "No database connection string found in environment variables.",
        }),
      };
    }

    const client = new Client({ connectionString });
    await client.connect();

    console.log(
      "✅ Connected to Neon via:",
      connectionString.includes("neon.tech") ? "Neon" : "Other",
    );
    console.log("🧠 Running query:", query);

    const result = await client.query(query);
    await client.end();

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.error("❌ Error occurred:", error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
}

/* ------------------------------
   CLI Mode (Run via Node)
------------------------------ */
if (path.basename(process.argv[1]).startsWith("query-db")) {
  const run = async () => {
    const query = process.argv[2];
    const connectionString =
      process.env.NEON_DB_URL || process.env.NETLIFY_DATABASE_URL;

    if (!query) {
      console.log("⚠️  Please provide an SQL query.");
      console.log(
        '👉 Example: node netlify/functions/query-db.js "SELECT NOW();"',
      );
      return;
    }

    if (!connectionString) {
      console.error("❌ No DB URL defined.");
      return;
    }

    const client = new Client({ connectionString });
    await client.connect();

    try {
      console.log("✅ Connected to Neon");
      const result = await client.query(query);
      console.table(result.rows);
      console.log(`✅ Query complete. Rows returned: ${result.rowCount}`);
    } catch (error) {
      console.error("❌ Query failed:", error.message);
    } finally {
      await client.end();
    }
  };

  run();
}
