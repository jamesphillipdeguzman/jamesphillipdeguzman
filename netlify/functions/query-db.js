import { Client } from "@neondatabase/serverless";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

/* ------------------------------
   Netlify Serverless Function
------------------------------ */
export async function handler(event, context) {
  try {
    // Add CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight (OPTIONS) requests
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 204,
        headers: corsHeaders,
        body: "",
      };
    }

    // Parse request body
    let body = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError.message);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Invalid JSON in request body" }),
      };
    }

    const query = body.query || "SELECT NOW()";

    // Ensure the database connection string is available
    if (!process.env.NEON_DB_URL) {
      console.error("❌ NEON_DB_URL is not defined in environment variables");
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Database connection string is missing",
        }),
      };
    }

    const client = new Client({ connectionString: process.env.NEON_DB_URL });
    await client.connect();

    console.log("✅ Connected to Neon");
    console.log("🧠 Running query:", query);

    const result = await client.query(query);
    await client.end();

    console.table(result.rows);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(result.rows || []),
    };
  } catch (error) {
    console.error("❌ Error occurred:", error.message);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
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
    if (!query) {
      console.log("⚠️  Please provide an SQL query.");
      console.log("👉 Example:");
      console.log('   node netlify/functions/query-db.mjs "SELECT NOW();"');
      return;
    }

    if (!process.env.NEON_DB_URL) {
      console.error("❌ NEON_DB_URL is not defined in environment variables");
      return;
    }

    const client = new Client({ connectionString: process.env.NEON_DB_URL });
    await client.connect();

    try {
      console.log("✅ Connected to Neon");
      console.log("🧠 Running query:", query);

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
