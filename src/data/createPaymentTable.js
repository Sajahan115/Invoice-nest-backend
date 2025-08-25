import pool from "../config/db.js";

export const createPaymentTable = async () => {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS Payment (
    payment_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES "user"(user_id),
    payment_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
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

  const createTriggerQuery = `
    CREATE TRIGGER update_payment_updated_at
    BEFORE UPDATE ON "payment"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `;

  const dropTriggerQuery = `
  DROP TRIGGER IF EXISTS update_payment_updated_at ON "payment";
  `;

  try {
    await pool.query(createTableQuery);
    await pool.query(createFunctionQuery);
    await pool.query(dropTriggerQuery);
    await pool.query(createTriggerQuery);
    console.log("Payment table, function, and trigger created successfully");
  } catch (error) {
    console.error("Error creating payment table, function, or trigger:", error);
  }
};
