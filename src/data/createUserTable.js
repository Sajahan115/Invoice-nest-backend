import pool from "../config/db.js";

export const createUserTable = async () => {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS "user" (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    state VARCHAR(50) NOT NULL,
    state_code VARCHAR(5) NOT NULL,
    gstin VARCHAR(50) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    ifsc_code VARCHAR(11) NOT NULL,
    bank_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    total_bill_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_payment_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
  );`;

  const createFunctionQuery = `
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  const createTriggerQuery = `
    CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `;

  const dropTriggerQuery = `
  DROP TRIGGER IF EXISTS update_user_updated_at ON "user";
  `;

  try {
    await pool.query(createTableQuery);
    await pool.query(createFunctionQuery);
    await pool.query(dropTriggerQuery);
    await pool.query(createTriggerQuery);
    console.log("User table, function, and trigger created successfully");
  } catch (error) {
    console.error("Error creating user table, function, or trigger:", error);
  }
};
