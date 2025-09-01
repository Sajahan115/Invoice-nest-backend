import pool from "../config/db.js";

export const createUserTable = async () => {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    user_id BIGSERIAL PRIMARY KEY,
    business_id BIGINT REFERENCES Business(business_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(15) NOT NULL CHECK (role IN ('SUPERADMIN', 'ADMIN', 'CLIENT')),
    total_bill_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_payment_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_username_per_business UNIQUE (business_id, username),
    CONSTRAINT unique_email_per_business UNIQUE (business_id, email),

    CONSTRAINT superadmin_business_null CHECK (
      (role = 'SUPERADMIN' AND business_id IS NULL)
      OR (role IN ('ADMIN', 'CLIENT') AND business_id IS NOT NULL)
    ),
    CONSTRAINT superadmin_no_amounts CHECK (
      (role = 'SUPERADMIN' AND total_bill_amount = 0 AND total_payment_amount = 0) 
      OR (role IN ('ADMIN', 'CLIENT'))
    )
  );
`;

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
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;

  const dropTriggerQuery = `
  DROP TRIGGER IF EXISTS update_user_updated_at ON users;
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
