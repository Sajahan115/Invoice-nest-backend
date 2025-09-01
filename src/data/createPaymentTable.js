import pool from "../config/db.js";

export const createPaymentTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS payments (
      payment_id BIGSERIAL PRIMARY KEY,

      business_id BIGINT NOT NULL 
        REFERENCES business(business_id) ON DELETE CASCADE,

      user_id BIGINT NOT NULL 
        REFERENCES users(user_id) ON DELETE CASCADE,

      payment_date DATE NOT NULL,
      amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),

      payee_name VARCHAR(255),

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

  const dropTriggerQuery = `
    DROP TRIGGER IF EXISTS update_payment_updated_at ON payments;
  `;

  const createTriggerQuery = `
    CREATE TRIGGER update_payment_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `;

  try {
    await pool.query(createTableQuery);
    await pool.query(createFunctionQuery);
    await pool.query(dropTriggerQuery);
    await pool.query(createTriggerQuery);
    console.log("Payments table, function, and trigger created successfully");
  } catch (error) {
    console.error(
      "Error creating payments table, function, or trigger:",
      error
    );
  }
};
