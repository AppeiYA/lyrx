// seedAdmin.js
import pkg from "pg";
import argon2 from 'argon2'
import dotenv from "dotenv";
import pool from "../config/db";
import cuid from "cuid";

// dotenv.config();
// const { Pool } = pkg;

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL, // or { user, host, database, password, port }
// });

const seedAdmin = async () => {
  try {
    const client = await pool.connect();

    // check if admin already exists
    const checkAdmin = await client.query(
      "SELECT * FROM users WHERE role = $1 LIMIT 1",
      ["admin"]
    );

    if (checkAdmin.rows.length > 0) {
      console.log("Admin already exists:", checkAdmin.rows[0].email);
      client.release();
      process.exit(0);
    }
    // generate admin Id
    const id = cuid()

    // generate hashed password
    const hashedPassword = await argon2.hash("Admin@123");

    // get present date
    const now = new Date();

    const result = await client.query(
      `INSERT INTO users (id, username, email, password, role, "tokenVersion", "updatedAt", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, "SuperAdmin", "admin@example.com", hashedPassword, "admin", 0, now, now]
    );

    console.log("Admin seeded:", result.rows[0].email);
    client.release();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
};

seedAdmin();
