import dotenv from "dotenv";
import pkg from "pg";

const { Pool } = pkg;
dotenv.config();

const isLocal = process.env.NODE_ENV !== "production";

const pool = new Pool({
  user: isLocal ? process.env.DB_LOCAL_USER : process.env.DB_USER,
  host: isLocal ? process.env.DB_LOCAL_HOST : process.env.DB_HOST,
  database: isLocal ? process.env.DB_LOCAL_NAME : process.env.DB_NAME,
  password: isLocal ? process.env.DB_LOCAL_PASSWORD : process.env.DB_PASSWORD,
  port: isLocal ? process.env.DB_LOCAL_PORT : process.env.DB_PORT,
  ssl: isLocal
    ? false // Local DB usually doesn't need SSL
    : { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log(
    `Connected to the ${isLocal ? "local" : "cloud"} database: ${
      isLocal ? process.env.DB_LOCAL_NAME : process.env.DB_NAME
    }`
  );
});

export default pool;
