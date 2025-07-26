import type { TransactionDetails, PaymentVerificationConfig } from './types.js';
import { 
  CBE_VERIFICATION_BASE_URL, 
  TRANSACTION_REFERENCE_REGEX, 
  TRANSACTION_URL_REGEX,
  DEFAULT_MAX_TRANSACTION_AGE_HOURS 
} from './constants.js';
import { extractTextFromPdfUrl } from './pdf-extractor.js';
import { extractTransactionDetails } from './transaction-parser.js';

/**
 * Validates input format (reference number or URL)
 * @param input The transaction reference number or URL to validate
 * @throws Error if input format is invalid
 */
function validateInput(input: string): void {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  const isValidRef = TRANSACTION_REFERENCE_REGEX.test(input);
  const isValidUrl = TRANSACTION_URL_REGEX.test(input);

  if (!isValidRef && !isValidUrl) {
    throw new Error('Invalid transaction reference number or URL format');
  }
}

/**
 * Constructs the PDF URL based on input type
 * @param input Transaction reference number or URL
 * @param cbeAccountNumber CBE account number for verification
 * @returns The complete PDF URL
 */
function constructPdfUrl(input: string, cbeAccountNumber: string): string {
  if (TRANSACTION_URL_REGEX.test(input)) {
    // If input is a URL, replace the last 8 characters with our account number
    return input.slice(0, -8) + cbeAccountNumber.slice(-8);
  }
  
  if (TRANSACTION_REFERENCE_REGEX.test(input)) {
    // If input is a reference number, construct the full URL
    return `${CBE_VERIFICATION_BASE_URL}/?id=${input}${cbeAccountNumber.slice(-8)}`;
  }

  throw new Error('Unable to construct PDF URL from input');
}

/**
 * Creates a default configuration object
 * @param cbeAccountNumber The CBE account number
 * @param overrides Optional configuration overrides
 * @returns Complete configuration object
 */
function createDefaultConfig(
  cbeAccountNumber: string,
  overrides: Partial<PaymentVerificationConfig> = {}
): PaymentVerificationConfig {
  return {
    cbeAccountNumber,
    maxTransactionAgeHours: DEFAULT_MAX_TRANSACTION_AGE_HOURS,
    rejectUnauthorized: false, // Default to false for CBE compatibility
    ...overrides,
  };
}

/**
 * Verifies a CBE direct deposit transaction by extracting and parsing PDF content
 * @param transactionRefNumberOrUrl Transaction reference number or PDF URL
 * @param config Configuration options for verification
 * @returns Promise resolving to extracted transaction details
 * @throws Error if verification fails at any stage
 */
export async function verifyDirectDeposit(
  transactionRefNumberOrUrl: string,
  config: PaymentVerificationConfig
): Promise<TransactionDetails> {
  // Validate inputs
  validateInput(transactionRefNumberOrUrl);
  
  if (!config.cbeAccountNumber) {
    throw new Error('CBE account number is required for verification');
  }

  try {
    // Construct the PDF URL
    const pdfUrl = constructPdfUrl(transactionRefNumberOrUrl, config.cbeAccountNumber);
    
    // Extract text from PDF
    const pdfText = await extractTextFromPdfUrl(pdfUrl, config);
    
    // Parse transaction details
    const transactionDetails = extractTransactionDetails(pdfText, config);
    
    return transactionDetails;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Verification failed: ${error}`);
  }
}

/**
 * Convenience function to verify payment with minimal configuration
 * @param transactionRefNumberOrUrl Transaction reference number or PDF URL
 * @param cbeAccountNumber CBE account number for verification
 * @param options Optional configuration overrides
 * @returns Promise resolving to extracted transaction details
 */
export async function verifyPayment(
  transactionRefNumberOrUrl: string,
  cbeAccountNumber: string,
  options: Partial<PaymentVerificationConfig> = {}
): Promise<TransactionDetails> {
  const config = createDefaultConfig(cbeAccountNumber, options);
  return verifyDirectDeposit(transactionRefNumberOrUrl, config);
}

/**
 * Validates CBE account number format
 * @param accountNumber The account number to validate
 * @returns True if valid, false otherwise
 */
export function isValidCbeAccountNumber(accountNumber: string): boolean {
  return typeof accountNumber === 'string' && 
         accountNumber.length >= 8 && 
         /^\d+$/.test(accountNumber);
} 