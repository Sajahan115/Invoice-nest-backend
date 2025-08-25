import pool from "../config/db.js";

export const createInvoiceTable = async () => {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS Invoice (
    invoice_id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES "user"(user_id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date TIMESTAMP NOT NULL,
    shipping_charges DECIMAL(10, 2),
    cgst DECIMAL(10, 2),
    sgst DECIMAL(10, 2),
    igst DECIMAL(10, 2),
    total_before_tax DECIMAL(10, 2) NOT NULL,
    total_after_tax DECIMAL(10, 2) NOT NULL,
    amount_in_words TEXT NOT NULL,
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
    $$ LANGUAGE plpgsql;`;

  const createTriggerQuery = `
    CREATE TRIGGER update_invoice_updated_at
    BEFORE UPDATE ON "invoice"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `;

  const dropTriggerQuery = `
  DROP TRIGGER IF EXISTS update_invoice_updated_at ON "invoice";
  `;

  try {
    await pool.query(createTableQuery);
    await pool.query(createFunctionQuery);
    await pool.query(dropTriggerQuery);
    await pool.query(createTriggerQuery);
    console.log("Invoice table, function, and trigger created successfully");
  } catch (error) {
    console.error("Error creating invoice table, function, or trigger:", error);
  }
};
