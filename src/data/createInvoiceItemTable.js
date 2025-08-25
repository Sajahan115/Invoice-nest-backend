import pool from "../config/db.js";

export const createInvoiceItemTable = async () => {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS InvoiceItem (
  item_id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT NOT NULL REFERENCES Invoice(invoice_id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  hsn_code VARCHAR(20),
  rate DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  net_amount DECIMAL(10, 2)
);`;

  try {
    await pool.query(createTableQuery);
    console.log("Invoice Item table created successfully");
  } catch (error) {
    console.error("Error creating Invoice Item table: ", error);
  }
};
