import pool from "../config/db.js";

export const createRefreshTokenTable = async () => {
  const createTableQuery = `
        CREATE TABLE IF NOT EXISTS RefreshToken (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
            token TEXT NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

  try {
    await pool.query(createTableQuery);
    console.log("RefreshToken table created successfully");
  } catch (error) {
    console.error("Error creating refresh token table:", error);
  }
};
