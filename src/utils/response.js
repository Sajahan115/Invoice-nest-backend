export const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};

export const mapUserResponse = (user) => {
  return {
    _id: user.user_id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    address: user.address,
    contact: user.phone,
    state: user.state,
    stateCode: user.state_code,
    gstNo: user.gstin,
    totalBillAmount: user.total_bill_amount,
    totalPaymentAmount: user.total_payment_amount,
    bankDetails: {
      accountNumber: user.account_number,
      ifsc: user.ifsc_code,
      bankName: user.bank_name,
    },
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
};

export const mapAllUsersResponse = (
  userDetails,
  user,
  lastInvoice,
  lastPayment
) => {
  return userDetails.push({
    _id: user.user_id,
    name: user.name,
    totalBillAmount: Number(user.total_bill_amount),
    totalPaymentAmount: Number(user.total_payment_amount),
    lastInvoiceNumber: lastInvoice?.invoice_number || null,
    lastInvoiceAmount: Number(lastInvoice?.total_after_tax || 0),
    lastInvoiceDate: lastInvoice?.invoice_date || null,
    lastPaymentAmount: Number(lastPayment?.amount || 0),
    lastPaymentDate: lastPayment?.payment_date || null,
  });
};

export const mapInvoiceResponse = (data) => {
  return data.map((invoice) => {
    return {
      invoiceId: invoice.invoice_id,
      invoiceNumber: invoice.invoice_number,
      invoiceDate: invoice.invoice_date,
      shippingCharges: invoice.shipping_charges,
      cgst: invoice.cgst,
      sgst: invoice.sgst,
      igst: invoice.igst,
      totalBeforeTax: invoice.total_before_tax,
      totalAfterTax: invoice.total_after_tax,
      amountInWords: invoice.amount_in_words,
      items: invoice.items.map((item) => {
        return {
          itemId: item.item_id,
          description: item.description,
          hsnCode: item.hsn_code,
          rate: item.rate,
          quantity: item.quantity,
          netAmount: item.net_amount,
        };
      }),
    };
  });
};

export const mapPaymentResponse = (data) => {
  return data.map((payment) => {
    return {
      id: payment.payment_id,
      amount: payment.amount,
      paymentDate: payment.payment_date,
      payeeName: payment.payee_name,
    };
  });
};
