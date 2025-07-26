/**
 * Interface representing the details of a financial transaction
 */
export interface TransactionDetails {
  /** The unique reference number for the transaction */
  transactionRefNumber: string | null;
  /** The date and time when the payment was made */
  paymentDateTime: Date | null;
  /** The total amount debited from the customer's account */
  totalAmountDebited: string | null;
  /** Information about the payment receiver */
  receiver: string | null;
  /** Information about the payment payer */
  payer: string | null;
}

/**
 * Configuration options for payment verification
 */
export interface PaymentVerificationConfig {
  /** CBE account number for verification */
  cbeAccountNumber: string;
  /** Maximum age in hours for transaction verification (default: 24) */
  maxTransactionAgeHours?: number;
  /** Whether to reject unauthorized SSL certificates (default: false for CBE compatibility) */
  rejectUnauthorized?: boolean;
} 