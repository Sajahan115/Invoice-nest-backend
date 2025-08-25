import bcrypt from "bcryptjs";

import pool from "../config/db.js";

export const updateUserByUserIdService = async (userId, userData) => {
  const {
    name,
    address,
    contact,
    state,
    stateCode,
    gstNo,
    accountNumber,
    ifsc,
    bankName,
    email,
  } = userData;

  await getUserByUserNameOrUserIdService(null, userId);
  await checkExistingUserNameAndGST(null, gstNo, userId);

  const result = await pool.query(
    `UPDATE "user" 
     SET name = $1, address = $2, phone = $3, state = $4, state_code = $5, 
         gstin = $6, account_number = $7, ifsc_code = $8, bank_name = $9, email = $11
     WHERE user_id = $10 
     RETURNING *`,
    [
      name,
      address,
      contact,
      state,
      stateCode,
      gstNo,
      accountNumber,
      ifsc,
      bankName,
      userId,
      email,
    ]
  );

  return result.rows[0];
};

export const updateTotalBillAmountService = async (userId, amount) => {
  const result = await pool.query(
    `UPDATE "user"
            SET total_bill_amount = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $2
            RETURNING *;`,
    [Number(amount), userId]
  );
  return result.rows[0];
};

export const updateTotalPaymentAmountService = async (userId, amount) => {
  const result = await pool.query(
    `UPDATE "user"
            SET total_payment_amount = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $2
            RETURNING *;`,
    [Number(amount), userId]
  );
  return result.rows[0];
};

export const getUserByUserNameOrUserIdService = async (
  username,
  userId = null
) => {
  let result;

  if (username) {
    result = await pool.query('SELECT * FROM "user" WHERE username = $1', [
      username,
    ]);
  } else if (userId) {
    result = await pool.query('SELECT * FROM "user" WHERE user_id = $1', [
      userId,
    ]);
  }

  if (result.rowCount === 0) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return result.rows[0];
};

export const getAllUsersService = async () => {
  const result = await pool.query(
    'SELECT * FROM "user" WHERE role = $1 ORDER BY name ASC',
    ["user"]
  );

  return result.rows;
};

const checkExistingUserNameAndGST = async (
  username,
  gstin = null,
  userId = null
) => {
  let existing;
  if (userId) {
    existing = await pool.query(
      `SELECT username, gstin FROM "user"
     WHERE (username = $1 OR gstin = $2)
     AND user_id != $3`,
      [username, gstin, userId]
    );
  } else {
    existing = await pool.query(
      `SELECT username, gstin FROM "user" WHERE username = $1 OR gstin = $2`,
      [username, gstin]
    );
  }

  if (existing.rowCount > 0) {
    const conflict = existing.rows[0];
    if (conflict.username === username) {
      const err = new Error("Username already exists");
      err.status = 409;
      throw err;
    }
    if (conflict.gstin === gstin) {
      const err = new Error("GST number already exists");
      err.status = 409;
      throw err;
    }
  }
};

export const createUserService = async (user) => {
  const {
    name,
    username,
    password,
    address,
    phone,
    state,
    state_code,
    gstin,
    account_number,
    ifsc_code,
    bank_name,
    email,
  } = user;

  await checkExistingUserNameAndGST(username, gstin);

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO "user" (name, username, password, address, phone, state, state_code, gstin, account_number, ifsc_code, bank_name, email)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
    [
      name,
      username,
      hashedPassword,
      address,
      phone,
      state,
      state_code,
      gstin,
      account_number,
      ifsc_code,
      bank_name,
      email,
    ]
  );

  return result.rows[0];
};

export const saveRefreshTokenService = async (data) => {
  const { userId, token, expiresAt } = data;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`DELETE FROM RefreshToken WHERE user_id = $1`, [userId]);

    await client.query(
      `INSERT INTO RefreshToken (user_id, token, expires_at )
    VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error saving refresh token:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const getRefreshTokenService = async (refreshToken) => {
  try {
    return await pool.query(`SELECT * FROM RefreshToken WHERE token = $1`, [
      refreshToken,
    ]);
  } catch (error) {
    console.log("Error fetching refresh token:", error);
  }
};

export const deleteRefreshTokenService = async (refreshToken) => {
  try {
    return await pool.query(
      `DELETE FROM RefreshToken WHERE token = $1 RETURNING *`,
      [refreshToken]
    );
  } catch (error) {
    console.log("Error deleting refresh token:", error);
  }
};
