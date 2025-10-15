import { Client } from "@neondatabase/serverless";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

/* ------------------------------
   Register Function
------------------------------ */

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { username, email, password, user_type } = JSON.parse(event.body);
  const client = new Client({ connectionString: process.env.NEON_DB_URL });

  try {
    await client.connect();
    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query(
      `INSERT INTO users (username, email, password, user_type)
       VALUES ($1, $2, $3, $4)`,
      [username, email, hashedPassword, user_type],
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User registered successfully" }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  } finally {
    await client.end();
  }
}
