import pool from "../config/db.js";

export const createInvoiceItemTable = async () => {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS invoice_items (
  item_id BIGSERIAL PRIMARY KEY,

  invoice_id BIGINT NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE,

  description TEXT NOT NULL,
  hsn_code VARCHAR(20),

  rate NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL,
  net_amount NUMERIC(10,2) NOT NULL
);`;

  try {
    await pool.query(createTableQuery);
    console.log("Invoice Item table created successfully");
  } catch (error) {
    console.error("Error creating Invoice Item table: ", error);
  }
};
