import { Resend } from "resend";
const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

const numToWords = (num) => {
  if (num === 0) return "Zero";

  const getWords = (n, suffix = "") => {
    let word = "";
    if (n > 19) {
      word +=
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    } else if (n > 0) {
      word += ones[n];
    }
    return word ? word + " " + suffix : "";
  };

  let result = "";

  result += getWords(Math.floor(num / 10000000), "Crore ");
  result += getWords(Math.floor((num % 10000000) / 100000), "Lakh ");
  result += getWords(Math.floor((num % 100000) / 1000), "Thousand ");
  result += getWords(Math.floor((num % 1000) / 100), "Hundred ");

  if (num > 100 && num % 100 !== 0) result += "and ";
  result += getWords(num % 100);

  return result.trim();
};

export const generateAmountInWords = (amount) => {
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  let words = `${numToWords(integerPart)} Rupees`;
  if (decimalPart > 0) {
    words += ` and ${numToWords(decimalPart)} Paise`;
  }

  return words + " Only";
};

export const appendCurrentTimeToDate = (dateOnly) => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  console.log(`${dateOnly}T${hours}:${minutes}:${seconds}`);

  return `${dateOnly}T${hours}:${minutes}:${seconds}`;
};

export function buildDateRangeFilter({
  financialYear,
  startDate,
  endDate,
  dateColumn = "invoice_date", // default column name
  startingParamIndex = 2,
}) {
  const conditions = [];
  const values = [];
  let paramIndex = startingParamIndex;

  if (financialYear) {
    const [startFy, endFy] = financialYear
      .split("-")
      .map((part, index) => (index === 0 ? part : `20${part}`));
    const from = `${startFy}-04-01`;
    const to = `${endFy}-03-31`;

    conditions.push(
      `${dateColumn} BETWEEN $${paramIndex} AND $${paramIndex + 1}`
    );
    values.push(from, to);
    paramIndex += 2;
  } else if (startDate && endDate) {
    conditions.push(
      `${dateColumn} BETWEEN $${paramIndex} AND $${paramIndex + 1}`
    );
    values.push(startDate, endDate);
    paramIndex += 2;
  }

  return {
    dateCondition: conditions.join(" AND "),
    dateValues: values,
    nextParamIndex: paramIndex,
  };
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInvoiceEmail = async ({ to, subject, body, buffer }) => {
  try {
    const data = await resend.emails.send({
      from: "Invoice Nest <onboarding@resend.dev>", // Use verified domain in production
      to,
      subject: subject,
      html: body,
      attachments: [
        {
          filename: "invoice.png",
          content: buffer.toString("base64"),
        },
      ],
    });

    return data;
  } catch (error) {
    throw error;
  }
};
