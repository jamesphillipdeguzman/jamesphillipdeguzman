import { Client } from "@neondatabase/serverless";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { email, password } = JSON.parse(event.body);
  const client = new Client({ connectionString: process.env.NEON_DB_URL });

  try {
    await client.connect();
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid password" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Login successful", user }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  } finally {
    await client.end();
  }
}
