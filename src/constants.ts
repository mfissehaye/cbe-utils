/**
 * Base URL for CBE verification service
 */
export const CBE_VERIFICATION_BASE_URL = 'https://apps.cbe.com.et:100';

/**
 * Regular expression to validate transaction reference numbers
 */
export const TRANSACTION_REFERENCE_REGEX = /FT[a-zA-Z0-9]{10}/;

/**
 * Regular expression to validate transaction URLs
 */
export const TRANSACTION_URL_REGEX = /https:\/\/apps.cbe.com.et:100\/\?id=FT[a-zA-Z0-9]{18}/;

/**
 * Default maximum transaction age in hours
 */
export const DEFAULT_MAX_TRANSACTION_AGE_HOURS = 24;

/**
 * Regular expression patterns for extracting transaction details from PDF text
 */
export const PDF_EXTRACTION_PATTERNS = {
  /** Pattern to extract reference number */
  REFERENCE_NUMBER: /Reference No\. \(VAT Invoice No\)\s*(.+)/,
  /** Pattern to extract payment date and time */
  PAYMENT_DATE_TIME: /Payment Date & Time\s*(\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} (?:AM|PM))/,
  /** Pattern to extract total amount debited */
  TOTAL_AMOUNT: /Total amount debited from customers account\s*([\d,.]+\s*ETB)/,
  /** Pattern to extract receiver information */
  RECEIVER: /Receiver\s*(.+)/,
  /** Pattern to extract payer information */
  PAYER: /Payer\s*(.+)/,
} as const; 
