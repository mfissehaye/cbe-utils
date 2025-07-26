import dayjs from 'dayjs';
import type { TransactionDetails, PaymentVerificationConfig } from './types.js';
import { PDF_EXTRACTION_PATTERNS, DEFAULT_MAX_TRANSACTION_AGE_HOURS } from './constants.js';

/**
 * Validates that a transaction is within the allowed time window
 * @param paymentDateTime The payment date and time
 * @param maxAgeHours Maximum allowed age in hours
 * @throws Error if transaction is too old
 */
function validateTransactionAge(
  paymentDateTime: Date,
  maxAgeHours: number = DEFAULT_MAX_TRANSACTION_AGE_HOURS
): void {
  const hoursDiff = dayjs().diff(dayjs(paymentDateTime), 'hour');
  if (hoursDiff > maxAgeHours) {
    throw new Error(
      `Transaction is older than ${maxAgeHours} hours (${hoursDiff} hours old), cannot verify`
    );
  }
}

/**
 * Extracts the transaction reference number from the PDF text
 * @param text The PDF text content
 * @returns The extracted reference number or null if not found
 */
function extractReferenceNumber(text: string): string | null {
  const match = text.match(PDF_EXTRACTION_PATTERNS.REFERENCE_NUMBER);
  return match?.[1]?.trim() || null;
}

/**
 * Extracts the payment date and time from the PDF text
 * @param text The PDF text content
 * @returns The extracted date or null if not found
 */
function extractPaymentDateTime(text: string): Date | null {
  const match = text.match(PDF_EXTRACTION_PATTERNS.PAYMENT_DATE_TIME);
  if (!match?.[1]) return null;
  
  try {
    return new Date(match[1].trim());
  } catch {
    return null;
  }
}

/**
 * Extracts the total amount debited from the PDF text
 * @param text The PDF text content
 * @returns The extracted amount or null if not found
 */
function extractTotalAmount(text: string): string | null {
  const match = text.match(PDF_EXTRACTION_PATTERNS.TOTAL_AMOUNT);
  return match?.[1]?.trim() || null;
}

/**
 * Extracts the receiver information from the PDF text
 * @param text The PDF text content
 * @returns The extracted receiver info or null if not found
 */
function extractReceiver(text: string): string | null {
  const match = text.match(PDF_EXTRACTION_PATTERNS.RECEIVER);
  return match?.[1]?.trim() || null;
}

/**
 * Extracts the payer information from the PDF text
 * @param text The PDF text content
 * @returns The extracted payer info or null if not found
 */
function extractPayer(text: string): string | null {
  const match = text.match(PDF_EXTRACTION_PATTERNS.PAYER);
  return match?.[1]?.trim() || null;
}

/**
 * Extracts transaction details from unformatted PDF text
 * @param text The unformatted text containing transaction information
 * @param config Configuration options for validation
 * @returns An object with extracted transaction details
 * @throws Error if required fields are missing or transaction is too old
 */
export function extractTransactionDetails(
  text: string,
  config: PaymentVerificationConfig
): TransactionDetails {
  const details: TransactionDetails = {
    transactionRefNumber: extractReferenceNumber(text),
    paymentDateTime: extractPaymentDateTime(text),
    totalAmountDebited: extractTotalAmount(text),
    receiver: extractReceiver(text),
    payer: extractPayer(text),
  };

  // Validate required fields
  if (!details.transactionRefNumber) {
    throw new Error('Transaction reference number not found in the PDF');
  }

  if (!details.paymentDateTime) {
    throw new Error('Payment date and time not found in the PDF');
  }

  // Validate transaction age
  const maxAge = config.maxTransactionAgeHours ?? DEFAULT_MAX_TRANSACTION_AGE_HOURS;
  validateTransactionAge(details.paymentDateTime, maxAge);

  return details;
} 