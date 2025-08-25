import pool from "../config/db.js";

export const insertInvoiceItemService = async (data, client = pool) => {
  const insertInvoiceItemQuery = `
    INSERT INTO InvoiceItem (
      invoice_id,
      description,
      hsn_code,
      rate,
      quantity,
      net_amount
    ) VALUES (
      $1, $2, $3, $4, $5, $6
    )
    RETURNING *;
  `;

  const values = [
    data.invoiceId,
    data.description,
    data.hsnCode,
    data.rate,
    data.quantity,
    data.netAmount,
  ];

  const result = await client.query(insertInvoiceItemQuery, values); // ✅ changed here
  return result.rows[0];
};

export const updateInvoiceItemService = async (data, client = pool) => {
  const updateInvoiceItemQuery = `
    UPDATE InvoiceItem SET
      description = $1,
      hsn_code = $2,
      rate = $3,
      quantity = $4,
      net_amount = $5
    WHERE item_id = $6 AND invoice_id = $7
    RETURNING *;
  `;

  const values = [
    data.description,
    data.hsnCode,
    data.rate,
    data.quantity,
    data.netAmount,
    data.itemId,
    data.invoiceId,
  ];

  const result = await client.query(updateInvoiceItemQuery, values); // ✅ changed here
  return result.rows[0];
};

export const getInvoiceItemsIds = async (invoiceId, client = pool) => {
  const result = await client.query(
    `SELECT item_id FROM InvoiceItem WHERE invoice_id = $1`,
    [invoiceId]
  );

  return result.rows;
};

export const deleteInvoiceItemService = async (itemId, client = pool) => {
  await client.query(`DELETE FROM InvoiceItem WHERE item_id = $1`, [itemId]);
};
