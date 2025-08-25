import {
  deleteInvoiceItemService,
  getInvoiceItemsIds,
  insertInvoiceItemService,
  updateInvoiceItemService,
} from "../model/invoiceItemModel.js";
import {
  addInvoiceService,
  getInvoiceByInvoiceIdService,
  getInvoicesWithItemsByUserId,
  getLastInvoiceNumberService,
  updateInvoiceService,
} from "../model/invoiceModel.js";
import {
  getUserByUserNameOrUserIdService,
  updateTotalBillAmountService,
} from "../model/userModel.js";
import {
  appendCurrentTimeToDate,
  generateAmountInWords,
} from "../utils/common.js";
import pool from "../config/db.js";
import { mapInvoiceResponse } from "../utils/response.js";

const createInvoiceNumber = async (fullDate) => {
  const [yearStr, monthStr] = fullDate.split("-");
  const month = Number(monthStr);
  const year = Number(yearStr);

  let firstHalf, secondHalf;

  if (month > 3) {
    secondHalf = `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    secondHalf = `${year - 1}-${year.toString().slice(-2)}`;
  }

  const lastInvoice = await getLastInvoiceNumberService();

  if (lastInvoice) {
    const firstHalfOfLastInvoice = Number(
      lastInvoice.invoice_number.split("/")[0]
    );
    firstHalf = firstHalfOfLastInvoice + 1;
  } else {
    firstHalf = 1;
  }

  return `${firstHalf}/${secondHalf}`;
};

const calcTotalBeforeTax = (items) => {
  const total = items.reduce(
    (total, item) => total + item.quantity * item.rate,
    0
  );
  return Math.ceil(total);
};

const calcTotalAfterTax = async (
  userId,
  shippingCharges,
  totalBeforeTax,
  invoiceId = null
) => {
  let tax = {
    CGST: 0,
    SGST: 0,
    IGST: 0,
  };
  let totalAfterTax, totalBillAmount;

  const user = await getUserByUserNameOrUserIdService(null, userId);

  const adminDetails = await getUserByUserNameOrUserIdService("Sajahan");

  if (adminDetails?.state_code === user?.state_code) {
    tax.CGST = parseFloat(((totalBeforeTax * 9) / 100).toFixed(2));
    tax.SGST = parseFloat(((totalBeforeTax * 9) / 100).toFixed(2));
    totalAfterTax = totalBeforeTax + shippingCharges + tax.CGST + tax.SGST;
  } else {
    console.log("total Before Tax", totalBeforeTax);
    tax.IGST = parseFloat(((totalBeforeTax * 18) / 100).toFixed(2));
    totalAfterTax = totalBeforeTax + shippingCharges + tax.IGST;
  }

  //check for if it is updating or creating invoice
  if (invoiceId) {
    const { total_after_tax } = await getInvoiceByInvoiceIdService(invoiceId);
    const currentTotal = Number(user.total_bill_amount);
    totalBillAmount =
      currentTotal - Number(total_after_tax) + Math.ceil(totalAfterTax);
  } else {
    totalBillAmount = Number(user.total_bill_amount) + Math.ceil(totalAfterTax);
  }

  await updateTotalBillAmountService(userId, totalBillAmount);
  return {
    tax,
    totalAfterTax: Math.ceil(totalAfterTax),
  };
};

export const createInvoiceService = async (req) => {
  const client = await pool.connect();

  try {
    const { userId, items, invoiceDate, shippingCharges = 0 } = req.body;

    const invoiceNumber = await createInvoiceNumber(invoiceDate);
    const totalBeforeTax = calcTotalBeforeTax(items);

    const { tax, totalAfterTax } = await calcTotalAfterTax(
      userId,
      shippingCharges,
      totalBeforeTax
    );

    const amountInWords = generateAmountInWords(totalAfterTax);
    const formattedInvoiceDate = appendCurrentTimeToDate(invoiceDate);

    await client.query("BEGIN");

    const invoiceResult = await addInvoiceService(
      {
        userId,
        invoiceNumber,
        invoiceDate: formattedInvoiceDate,
        shippingCharges,
        cgst: tax.CGST,
        sgst: tax.SGST,
        igst: tax.IGST,
        totalBeforeTax,
        totalAfterTax,
        amountInWords,
      },
      client
    );

    if (!invoiceResult || !invoiceResult.invoice_id) {
      throw new Error("Failed to create invoice");
    }

    for (const item of items) {
      await insertInvoiceItemService(
        {
          invoiceId: invoiceResult.invoice_id,
          description: item.description,
          hsnCode: item.hsnCode,
          rate: item.rate,
          quantity: item.quantity,
          netAmount: (item.quantity * item.rate).toFixed(2),
        },
        client
      );
    }

    await client.query("COMMIT");
    return invoiceResult;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const editInvoiceService = async (req) => {
  const client = await pool.connect();

  try {
    const { invoiceId } = req.params;
    const { userId, items, invoiceDate, shippingCharges = 0 } = req.body;

    const totalBeforeTax = calcTotalBeforeTax(items);

    const { tax, totalAfterTax } = await calcTotalAfterTax(
      userId,
      shippingCharges,
      totalBeforeTax,
      invoiceId
    );

    const amountInWords = generateAmountInWords(totalAfterTax);
    const formattedInvoiceDate = appendCurrentTimeToDate(invoiceDate);

    await client.query("BEGIN");

    //if a user removes an item while editing an invoice
    const existingItems = await getInvoiceItemsIds(invoiceId, client);
    const existingItemIds = existingItems.map((item) => item.item_id);

    const incomingItemIds = items
      .filter((item) => item.itemId)
      .map((item) => item.itemId);

    const itemIdsToDelete = existingItemIds.filter(
      (id) => !incomingItemIds.includes(id)
    );

    for (const id of itemIdsToDelete) {
      await deleteInvoiceItemService(id, client);
    }
    //

    const invoiceResult = await updateInvoiceService({
      invoiceId,
      userId,
      invoiceDate: formattedInvoiceDate,
      shippingCharges,
      cgst: tax.CGST,
      sgst: tax.SGST,
      igst: tax.IGST,
      totalBeforeTax,
      totalAfterTax,
      amountInWords,
    });

    if (!invoiceResult || !invoiceResult.invoice_id) {
      throw new Error("Failed to update invoice");
    }

    for (const item of items) {
      const itemData = {
        invoiceId: invoiceResult.invoice_id,
        description: item.description,
        hsnCode: item.hsnCode,
        rate: item.rate,
        quantity: item.quantity,
        netAmount: (item.quantity * item.rate).toFixed(2),
      };

      if (item.itemId) {
        // update existing item
        await updateInvoiceItemService(
          { itemId: item.itemId, ...itemData },
          client
        );
      } else {
        // insert new item
        await insertInvoiceItemService(itemData, client);
      }
    }
    await client.query("COMMIT");
    return invoiceResult;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getUsersInvoicesService = async (
  userId,
  query,
  page,
  pageSize
) => {
  const { financialYear, startDate, endDate } = query;
  const result = await getInvoicesWithItemsByUserId(
    userId,
    financialYear,
    startDate,
    endDate,
    page,
    pageSize
  );
  return mapInvoiceResponse(result);
};
