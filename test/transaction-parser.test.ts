import { describe, it, expect, beforeEach } from 'vitest';
import { extractTransactionDetails } from '../src/transaction-parser';
import type { PaymentVerificationConfig } from '../src/types';

describe('Transaction Parser', () => {
  let mockConfig: PaymentVerificationConfig;

  beforeEach(() => {
    mockConfig = {
      cbeAccountNumber: '12345678',
      maxTransactionAgeHours: 24,
      rejectUnauthorized: false,
    };
  });

  describe('extractTransactionDetails', () => {
    it('should extract complete transaction details from valid PDF text', () => {
      // Use a recent date to avoid age validation errors
      const recentDate = new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).replace(',', ',');

      const pdfText = `
        Reference No. (VAT Invoice No)   TXN123456789
        Payment Date & Time ${recentDate}
        Total amount debited from customers account 1,500.00 ETB
        Receiver ACME Corporation Ltd
        Payer John Doe
      `;

      const result = extractTransactionDetails(pdfText, mockConfig);

      expect(result.transactionRefNumber).toBe('TXN123456789');
      expect(result.paymentDateTime).toBeInstanceOf(Date);
      expect(result.totalAmountDebited).toBe('1,500.00 ETB');
      expect(result.receiver).toBe('ACME Corporation Ltd');
      expect(result.payer).toBe('John Doe');
    });

    it('should throw error when transaction reference number is missing', () => {
      const pdfText = `
        Payment Date & Time 12/25/2023, 2:30:45 PM
        Total amount debited from customers account 1,500.00 ETB
      `;

      expect(() => extractTransactionDetails(pdfText, mockConfig))
        .toThrow('Transaction reference number not found in the PDF');
    });

    it('should throw error when payment date time is missing', () => {
      const pdfText = `
        Reference No. (VAT Invoice No)   TXN123456789
        Total amount debited from customers account 1,500.00 ETB
      `;

      expect(() => extractTransactionDetails(pdfText, mockConfig))
        .toThrow('Payment date and time not found in the PDF');
    });

    it('should throw error when transaction is too old', () => {
      // Create a date that's 25 hours old
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25);
      const formattedDate = oldDate.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).replace(',', ',');

      const pdfText = `
        Reference No. (VAT Invoice No)   TXN123456789
        Payment Date & Time ${formattedDate}
        Total amount debited from customers account 1,500.00 ETB
      `;

      expect(() => extractTransactionDetails(pdfText, mockConfig))
        .toThrow(/Transaction is older than 24 hours/);
    });

    it('should allow custom max transaction age', () => {
      const configWithLongerAge = {
        ...mockConfig,
        maxTransactionAgeHours: 48,
      };

      // Create a date that's 25 hours old (within 48 hour limit)
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25);
      const formattedDate = oldDate.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).replace(',', ',');

      const pdfText = `
        Reference No. (VAT Invoice No)   TXN123456789
        Payment Date & Time ${formattedDate}
        Total amount debited from customers account 1,500.00 ETB
      `;

      expect(() => extractTransactionDetails(pdfText, configWithLongerAge))
        .not.toThrow();
    });

    it('should handle missing optional fields gracefully', () => {
      const recentDate = new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).replace(',', ',');

      const pdfText = `
        Reference No. (VAT Invoice No)   TXN123456789
        Payment Date & Time ${recentDate}
      `;

      const result = extractTransactionDetails(pdfText, mockConfig);

      expect(result.transactionRefNumber).toBe('TXN123456789');
      expect(result.paymentDateTime).toBeInstanceOf(Date);
      expect(result.totalAmountDebited).toBeNull();
      expect(result.receiver).toBeNull();
      expect(result.payer).toBeNull();
    });

    it('should trim whitespace from extracted values', () => {
      const recentDate = new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).replace(',', ',');

      const pdfText = `
        Reference No. (VAT Invoice No)     TXN123456789    
        Payment Date & Time ${recentDate}
        Total amount debited from customers account   1,500.00 ETB   
        Receiver   ACME Corporation Ltd   
        Payer   John Doe   
      `;

      const result = extractTransactionDetails(pdfText, mockConfig);

      expect(result.transactionRefNumber).toBe('TXN123456789');
      expect(result.totalAmountDebited).toBe('1,500.00 ETB');
      expect(result.receiver).toBe('ACME Corporation Ltd');
      expect(result.payer).toBe('John Doe');
    });
  });
}); 