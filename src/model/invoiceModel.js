import pool from "../config/db.js";
import { buildDateRangeFilter } from "../utils/common.js";

export const getLastInvoiceNumberService = async () => {
  const result = await pool.query(`SELECT invoice_number
FROM Invoice
ORDER BY invoice_id DESC
LIMIT 1;`);
  return result.rows[0];
};

export const getLastInvoiceByUserIdService = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM Invoice WHERE user_id = $1 ORDER BY invoice_id DESC LIMIT 1;`,
    [userId]
  );
  return result.rows[0];
};

export const addInvoiceService = async (data, client = pool) => {
  const insertInvoiceQuery = `
    INSERT INTO Invoice (
      user_id,
      invoice_number,
      invoice_date,
      shipping_charges,
      cgst,
      sgst,
      igst,
      total_before_tax,
      total_after_tax,
      amount_in_words
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    )
    RETURNING *;
  `;

  const values = [
    data.userId,
    data.invoiceNumber,
    data.invoiceDate,
    data.shippingCharges,
    data.cgst,
    data.sgst,
    data.igst,
    data.totalBeforeTax,
    data.totalAfterTax,
    data.amountInWords,
  ];

  const result = await client.query(insertInvoiceQuery, values);
  return result.rows[0];
};

// export const getInvoicesWithItemsByUserId = async (
//   userId,
//   financialYear,
//   startDate,
//   endDate
// ) => {
//   console.log(startDate, endDate, financialYear);
//   const query = `
//         SELECT
//       i.invoice_id,
//       i.invoice_number,
//       i.invoice_date,
//       i.shipping_charges,
//       i.cgst,
//       i.sgst,
//       i.igst,
//       i.total_before_tax,
//       i.total_after_tax,
//       i.amount_in_words,
//       json_agg(
//         json_build_object(
//           'item_id', ii.item_id,
//           'description', ii.description,
//           'hsn_code', ii.hsn_code,
//           'rate', ii.rate,
//           'quantity', ii.quantity,
//           'net_amount', ii.net_amount
//         )
//       ) AS items
//     FROM Invoice i
//     INNER JOIN InvoiceItem ii ON i.invoice_id = ii.invoice_id
//     WHERE i.user_id = $1
//     GROUP BY i.invoice_id
//     ORDER BY CAST(SPLIT_PART(i.invoice_number, '/', 1) AS INTEGER)
//     ;`;
//   // ORDER BY i.invoice_date DESC
//   const result = await pool.query(query, [userId]);
//   return result.rows;
// };

export const getInvoicesWithItemsByUserId = async (
  userId,
  financialYear,
  startDate,
  endDate,
  page,
  pageSize
) => {
  const offset = (page - 1) * pageSize;

  const conditions = [`i.user_id = $1`];
  const values = [userId];

  const { dateCondition, dateValues } = buildDateRangeFilter({
    financialYear,
    startDate,
    endDate,
    dateColumn: "i.invoice_date", // aliased with "i."
    startingParamIndex: 2,
  });

  if (dateCondition) {
    conditions.push(dateCondition);
    values.push(...dateValues);
  }

  const paramIndexLimit = values.length + 1;
  const paramIndexOffset = values.length + 2;
  values.push(pageSize, offset);

  const query = `
    SELECT
      i.invoice_id,
      i.invoice_number,
      i.invoice_date,
      i.shipping_charges,
      i.cgst,
      i.sgst,
      i.igst,
      i.total_before_tax,
      i.total_after_tax,
      i.amount_in_words,
      json_agg(
        json_build_object(
          'item_id', ii.item_id,
          'description', ii.description,
          'hsn_code', ii.hsn_code,
          'rate', ii.rate,
          'quantity', ii.quantity,
          'net_amount', ii.net_amount
        )
      ) AS items
    FROM Invoice i
    INNER JOIN InvoiceItem ii ON i.invoice_id = ii.invoice_id
    WHERE ${conditions.join(" AND ")}
    GROUP BY i.invoice_id
    ORDER BY CAST(SPLIT_PART(i.invoice_number, '/', 1) AS INTEGER) DESC
    LIMIT $${paramIndexLimit} OFFSET $${paramIndexOffset};
  `;

  const result = await pool.query(query, values);
  return result.rows;
};

export const updateInvoiceService = async (data, client = pool) => {
  const updateInvoiceQuery = `
  UPDATE Invoice SET
    invoice_date = $1,
    shipping_charges = $2,
    cgst = $3,
    sgst = $4,
    igst = $5,
    total_before_tax = $6,
    total_after_tax = $7,
    amount_in_words = $8
  WHERE invoice_id = $9 AND user_id = $10
  RETURNING *;
`;

  const values = [
    data.invoiceDate,
    data.shippingCharges,
    data.cgst,
    data.sgst,
    data.igst,
    data.totalBeforeTax,
    data.totalAfterTax,
    data.amountInWords,
    data.invoiceId,
    data.userId,
  ];

  const result = await client.query(updateInvoiceQuery, values);
  return result.rows[0];
};

export const getInvoiceByInvoiceIdService = async (invoiceId) => {
  const result = await pool.query(
    `SELECT * FROM Invoice WHERE invoice_id = $1`,
    [invoiceId]
  );
  return result.rows[0];
};
