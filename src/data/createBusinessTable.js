import pool from "../config/db.js";

export const createBusinessTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS Business (
    business_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    gstin VARCHAR(20) UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    state VARCHAR(100),
    state_code VARCHAR(5),
    account_number VARCHAR(20) NOT NULL,
    ifsc_code VARCHAR(11) NOT NULL,
    bank_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT gst_state_check CHECK (
        gstin IS NULL OR (state IS NOT NULL AND state_code IS NOT NULL)
    )
);`;

  try {
    await pool.query(query);
  } catch (error) {
    console.log("Error creating Business table: ", error);
  }
};
