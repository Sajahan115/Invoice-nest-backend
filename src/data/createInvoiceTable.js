import pool from "../config/db.js";

export const createInvoiceTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS invoices (
      invoice_id BIGSERIAL PRIMARY KEY,

      business_id BIGINT NOT NULL REFERENCES business(business_id) ON DELETE CASCADE,
      created_by BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

      invoice_number VARCHAR(50) NOT NULL,
      invoice_date DATE NOT NULL,

      shipping_charges NUMERIC(10,2) DEFAULT 0,
      cgst NUMERIC(10,2) DEFAULT 0,
      sgst NUMERIC(10,2) DEFAULT 0,
      igst NUMERIC(10,2) DEFAULT 0,

      total_before_tax NUMERIC(10,2) DEFAULT 0,
      total_after_tax NUMERIC(10,2) DEFAULT 0,

      amount_in_words TEXT,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT unique_invoice_number_per_business UNIQUE (business_id, invoice_number)
    );
  `;

  const createFunctionQuery = `
    CREATE OR REPLACE FUNCTION update_invoice_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  const dropTriggerQuery = `
    DROP TRIGGER IF EXISTS update_invoice_updated_at ON invoices;
  `;

  const createTriggerQuery = `
    CREATE TRIGGER update_invoice_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_updated_at_column();
  `;

  try {
    await pool.query(createTableQuery);
    await pool.query(createFunctionQuery);
    await pool.query(dropTriggerQuery);
    await pool.query(createTriggerQuery);
    console.log("Invoices table, function, and trigger created successfully");
  } catch (error) {
    console.error(
      "Error creating invoices table, function, or trigger:",
      error
    );
  }
};
