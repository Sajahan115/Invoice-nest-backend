import pool from "../config/db.js";
import { buildDateRangeFilter } from "../utils/common.js";

export const insertPaymentRepo = async (data, userId) => {
  const insertPaymentQuery = `
        INSERT INTO Payment (
            user_id,
            payment_date,
            amount,
            payee_name
        ) VALUES (
            $1, $2, $3, $4
        )
        RETURNING *;
    `;
  const values = [userId, data.paymentDate, data.amount, data.payeeName];
  const result = await pool.query(insertPaymentQuery, values);
  return result.rows[0];
};

// export const getUsersAllPaymentsRepo = async (
//   userId,
//   financialYear,
//   startDate,
//   endDate
// ) => {
//   const getAllPaymentQuery = `
//         SELECT * FROM Payment WHERE user_id = $1 ORDER BY payment_date DESC;`;
//   const values = [userId];
//   const result = await pool.query(getAllPaymentQuery, values);
//   return result.rows;
// };

export const getUsersAllPaymentsRepo = async (
  userId,
  financialYear,
  startDate,
  endDate
) => {
  const baseConditions = [`user_id = $1`];
  const values = [userId];

  const { dateCondition, dateValues } = buildDateRangeFilter({
    financialYear,
    startDate,
    endDate,
    dateColumn: "payment_date",
    startingParamIndex: 2,
  });

  if (dateCondition) {
    baseConditions.push(dateCondition);
    values.push(...dateValues);
  }

  const query = `
    SELECT * FROM Payment
    WHERE ${baseConditions.join(" AND ")}
    ORDER BY payment_date DESC;
  `;

  const result = await pool.query(query, values);
  return result.rows;
};

export const getLastPaymentByUserIdRepo = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM Payment WHERE user_id = $1 ORDER BY payment_id DESC LIMIT 1;`,
    [userId]
  );
  return result.rows[0];
};

export const updatePaymentRepo = async (data, userId) => {
  const updatePaymentQuery = `
        UPDATE Payment SET 
            payment_date = $1,
            amount = $2,
            payee_name = $3
        WHERE payment_id = $4 AND user_id = $5
        RETURNING *;
    `;
  const values = [
    data.paymentDate,
    data.amount,
    data.payeeName,
    data.paymentId,
    userId,
  ];
  const result = await pool.query(updatePaymentQuery, values);
  return result.rows[0];
};

export const getTotalPaymentsByUser = async (userId) => {
  const query = `
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM payment
    WHERE user_id = $1
  `;
  const result = await pool.query(query, [userId]);
  return Number(result.rows[0].total);
};

export const updateUserTotalPayment = async (userId, totalAmount) => {
  const query = `
    UPDATE "user"
    SET total_payment_amount = $2
    WHERE user_id = $1 RETURNING *
  `;
  await pool.query(query, [userId, totalAmount]);
};

export const getPaymentById = async (paymentId) => {
  const query = `SELECT * FROM payment WHERE payment_id = $1`;
  const result = await pool.query(query, [paymentId]);
  return result.rows[0]; // returns undefined if not found
};

export const deleteUsersPaymentRepo = async (paymentId, userId) => {
  const query = `
    DELETE FROM payment
    WHERE payment_id = $1 AND user_id = $2
    RETURNING *;
  `;

  const values = [paymentId, userId];

  const result = await pool.query(query, values);

  return result.rows[0];
};
