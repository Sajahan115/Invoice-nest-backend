import Joi from "joi";

const userSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string()
    .min(4)
    .max(50)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one letter, one number, and one special character",
    }),
  confirmPassword: Joi.string().optional().valid(Joi.ref("password")).messages({
    "any.only": "Confirm password must match the password",
    "string.empty": "Confirm password is required",
  }),
  email: Joi.string()
    .min(4)
    .max(100)
    .pattern(
      /^(?!.*\.\.)[a-zA-Z0-9](\.?[a-zA-Z0-9_-])*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/
    )
    .required()
    .messages({
      "string.pattern.base": "Email must be a valid email address",
      "string.empty": "Email is required",
      "string.min": "Email must be at least 4 characters long",
      "string.max": "Email must not exceed 100 characters",
    }),
  address: Joi.string().min(3).max(255).required(),
  phone: Joi.string().min(10).max(10).required(),
  state: Joi.string().min(2).max(50).required(),
  state_code: Joi.string().min(2).max(5).required(),
  gstin: Joi.string()
    .length(15)
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "GSTIN must be a valid 15-character GST number",
      "string.length": "GSTIN must be exactly 15 characters",
    }),
  account_number: Joi.string().min(10).max(20).required(),
  ifsc_code: Joi.string().min(2).max(11).required(),
  bank_name: Joi.string().min(3).max(50).required(),
});

export const validateUserInput = (req, res, next) => {
  const { error } = userSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details[0].message,
    });
  }
  next();
};

const createInvoiceItemSchema = Joi.object({
  description: Joi.string().min(1).max(255).required().messages({
    "string.base": "Description must be a string",
    "string.empty": "Description is required",
  }),
  hsnCode: Joi.string().alphanum().min(2).max(20).required(),
  quantity: Joi.number().positive().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.positive": "Quantity must be greater than 0",
    "any.required": "Quantity is required",
  }),
  rate: Joi.number().positive().precision(2).required().messages({
    "number.base": "Rate must be a number",
    "number.positive": "Rate must be greater than 0",
    "any.required": "Rate is required",
  }),
});

const createInvoiceSchema = Joi.object({
  invoiceDate: Joi.date().iso().required().messages({
    "date.base": "Invoice date must be a valid date",
    "date.format": "Invoice date must be in YYYY-MM-DD format",
    "any.required": "Invoice date is required",
  }),
  userId: Joi.number().integer().min(1).required().messages({
    "number.base": "User ID must be a number",
    "number.integer": "User ID must be an integer",
    "any.required": "User ID is required",
  }),
  shippingCharges: Joi.number().precision(2).min(0).optional().messages({
    "number.base": "Shipping charges must be a number",
    "number.min": "Shipping charges cannot be negative",
  }),
  items: Joi.array().items(createInvoiceItemSchema).min(1).required().messages({
    "array.base": "Items must be an array",
    "array.min": "At least one item is required",
    "any.required": "Items are required",
  }),
});

export const validateCreateInvoiceInput = (req, res, next) => {
  const { error } = createInvoiceSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details[0].message,
    });
  }

  next();
};

const editInvoiceItemSchema = Joi.object({
  itemId: Joi.alternatives()
    .try(Joi.number().integer().positive(), Joi.string().allow("", null))
    .optional(),
  description: Joi.string().min(1).max(255).required().messages({
    "string.base": "Description must be a string",
    "string.empty": "Description is required",
  }),
  hsnCode: Joi.string().alphanum().min(2).max(20).required(),
  quantity: Joi.number().positive().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.positive": "Quantity must be greater than 0",
    "any.required": "Quantity is required",
  }),
  rate: Joi.number().positive().precision(2).required().messages({
    "number.base": "Rate must be a number",
    "number.positive": "Rate must be greater than 0",
    "any.required": "Rate is required",
  }),
});

const editInvoiceSchema = Joi.object({
  invoiceDate: Joi.date().iso().required().messages({
    "date.base": "Invoice date must be a valid date",
    "date.format": "Invoice date must be in YYYY-MM-DD format",
    "any.required": "Invoice date is required",
  }),
  userId: Joi.number().integer().min(1).required().messages({
    "number.base": "User ID must be a number",
    "number.integer": "User ID must be an integer",
    "any.required": "User ID is required",
  }),
  shippingCharges: Joi.number().precision(2).min(0).optional().messages({
    "number.base": "Shipping charges must be a number",
    "number.min": "Shipping charges cannot be negative",
  }),
  items: Joi.array().items(editInvoiceItemSchema).min(1).required().messages({
    "array.base": "Items must be an array",
    "array.min": "At least one item is required",
    "any.required": "Items are required",
  }),
});

export const validateEditInvoiceInput = (req, res, next) => {
  const { error } = editInvoiceSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details[0].message,
    });
  }

  next();
};

const addPaymentSchema = Joi.object({
  paymentDate: Joi.date().iso().required().messages({
    "date.base": "Payment date must be a valid date",
    "date.format": "Payment date must be in YYYY-MM-DD format",
    "any.required": "Payment date is required",
  }),
  amount: Joi.number().positive().integer().min(1).required().messages({
    "number.base": "Amount must be a number",
    "number.integer": "Amount must be an integer",
    "number.positive": "Amount must be greater than 0",
    "any.required": "Amount is required",
  }),
  payeeName: Joi.string().required().messages({
    "string.base": "Payee must be a string",
    "string.empty": "Payee is required",
  }),
});

export const validateAddPaymentInput = (req, res, next) => {
  const { error } = addPaymentSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details[0].message,
    });
  }

  next();
};

const updatePaymentSchema = Joi.object({
  paymentId: Joi.number().integer().min(1).required().messages({
    "number.base": "Payment ID must be a number",
    "number.integer": "Payment ID must be an integer",
    "any.required": "Payment ID is required",
  }),
  paymentDate: Joi.date().iso().required().messages({
    "date.base": "Payment date must be a valid date",
    "date.format": "Payment date must be in YYYY-MM-DD format",
    "any.required": "Payment date is required",
  }),
  amount: Joi.number().positive().integer().min(1).required().messages({
    "number.base": "Amount must be a number",
    "number.integer": "Amount must be an integer",
    "number.positive": "Amount must be greater than 0",
    "any.required": "Amount is required",
  }),
  payeeName: Joi.string().required().messages({
    "string.base": "Payee must be a string",
    "string.empty": "Payee is required",
  }),
});

export const validateUpdatePaymentInput = (req, res, next) => {
  const { error } = updatePaymentSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details[0].message,
    });
  }

  next();
};

const deletePaymentSchema = Joi.object({
  paymentId: Joi.number().integer().min(1).required().messages({
    "number.base": "Payment ID must be a number",
    "number.integer": "Payment ID must be an integer",
    "any.required": "Payment ID is required",
  }),
});

export const validateDeletePaymentInput = (req, res, next) => {
  const { error } = deletePaymentSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details[0].message,
    });
  }

  next();
};
