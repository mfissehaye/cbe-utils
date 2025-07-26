/**
 * CBE Utils - A TypeScript utility library for CBE payment verification
 */

// Import main verification functions for default export
import { verifyDirectDeposit, verifyPayment, isValidCbeAccountNumber } from './payment-verifier.js';

// Re-export main verification functions
export { verifyDirectDeposit, verifyPayment, isValidCbeAccountNumber } from './payment-verifier.js';

// Re-export types
export type { TransactionDetails, PaymentVerificationConfig } from './types.js';

// Re-export constants that might be useful for consumers
export { 
  CBE_VERIFICATION_BASE_URL,
  TRANSACTION_REFERENCE_REGEX,
  TRANSACTION_URL_REGEX,
  DEFAULT_MAX_TRANSACTION_AGE_HOURS 
} from './constants.js';

// Re-export utility functions for advanced usage
export { extractTextFromPdfUrl, downloadPdf, extractPdfText } from './pdf-extractor.js';
export { extractTransactionDetails } from './transaction-parser.js';

/**
 * Default export for convenient importing
 */
export default {
  verifyDirectDeposit,
  verifyPayment,
  isValidCbeAccountNumber,
}; 