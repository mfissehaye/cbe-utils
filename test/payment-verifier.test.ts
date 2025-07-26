import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyDirectDeposit, verifyPayment, isValidCbeAccountNumber } from '../src/payment-verifier';
import type { PaymentVerificationConfig } from '../src/types';

// Mock the dependencies
vi.mock('../src/pdf-extractor.js', () => ({
  extractTextFromPdfUrl: vi.fn(),
}));

vi.mock('../src/transaction-parser.js', () => ({
  extractTransactionDetails: vi.fn(),
}));

import { extractTextFromPdfUrl } from '../src/pdf-extractor';
import { extractTransactionDetails } from '../src/transaction-parser';

describe('Payment Verifier', () => {
  const mockConfig: PaymentVerificationConfig = {
    cbeAccountNumber: '12345678',
    maxTransactionAgeHours: 24,
    rejectUnauthorized: false,
  };

  const mockTransactionDetails = {
    transactionRefNumber: 'TXN123456789',
    paymentDateTime: new Date(),
    totalAmountDebited: '1,500.00 ETB',
    receiver: 'ACME Corporation',
    payer: 'John Doe',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(extractTextFromPdfUrl).mockResolvedValue('mock pdf text');
    vi.mocked(extractTransactionDetails).mockReturnValue(mockTransactionDetails);
  });

  describe('verifyDirectDeposit', () => {
    it('should verify transaction with reference number', async () => {
      const result = await verifyDirectDeposit('TXN123456789', mockConfig);

      expect(extractTextFromPdfUrl).toHaveBeenCalledWith(
        'https://apps.cbe.com.et:100/?id=TXN12345678912345678',
        mockConfig
      );
      expect(extractTransactionDetails).toHaveBeenCalledWith('mock pdf text', mockConfig);
      expect(result).toEqual(mockTransactionDetails);
    });

    it('should verify transaction with URL', async () => {
      const testUrl = 'https://apps.cbe.com.et:100/?id=TXN12345678987654321';
      const result = await verifyDirectDeposit(testUrl, mockConfig);

      expect(extractTextFromPdfUrl).toHaveBeenCalledWith(
        'https://apps.cbe.com.et:100/?id=TXN12345678912345678',
        mockConfig
      );
      expect(result).toEqual(mockTransactionDetails);
    });

    it('should throw error for invalid input format', async () => {
      await expect(verifyDirectDeposit('invalid-input-123!', mockConfig))
        .rejects.toThrow('Invalid transaction reference number or URL format');
    });

    it('should throw error for empty input', async () => {
      await expect(verifyDirectDeposit('', mockConfig))
        .rejects.toThrow('Input must be a non-empty string');
    });

    it('should throw error for missing CBE account number', async () => {
      const configWithoutAccount = { ...mockConfig, cbeAccountNumber: '' };
      
      await expect(verifyDirectDeposit('TXN123456789', configWithoutAccount))
        .rejects.toThrow('CBE account number is required for verification');
    });

    it('should propagate PDF extraction errors', async () => {
      vi.mocked(extractTextFromPdfUrl).mockRejectedValue(new Error('PDF download failed'));

      await expect(verifyDirectDeposit('TXN123456789', mockConfig))
        .rejects.toThrow('PDF download failed');
    });

    it('should propagate transaction parsing errors', async () => {
      vi.mocked(extractTransactionDetails).mockImplementation(() => {
        throw new Error('Invalid PDF content');
      });

      await expect(verifyDirectDeposit('TXN123456789', mockConfig))
        .rejects.toThrow('Invalid PDF content');
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment with minimal configuration', async () => {
      const result = await verifyPayment('TXN123456789', '12345678');

      expect(result).toEqual(mockTransactionDetails);
      expect(extractTextFromPdfUrl).toHaveBeenCalledWith(
        expect.stringContaining('TXN123456789'),
        expect.objectContaining({
          cbeAccountNumber: '12345678',
          maxTransactionAgeHours: 24,
          rejectUnauthorized: false,
        })
      );
    });

    it('should accept configuration overrides', async () => {
      const options = {
        maxTransactionAgeHours: 48,
        rejectUnauthorized: true,
      };

      await verifyPayment('TXN123456789', '12345678', options);

      expect(extractTextFromPdfUrl).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          cbeAccountNumber: '12345678',
          maxTransactionAgeHours: 48,
          rejectUnauthorized: true,
        })
      );
    });
  });

  describe('isValidCbeAccountNumber', () => {
    it('should return true for valid account numbers', () => {
      expect(isValidCbeAccountNumber('12345678')).toBe(true);
      expect(isValidCbeAccountNumber('123456789012')).toBe(true);
      expect(isValidCbeAccountNumber('00012345678')).toBe(true);
    });

    it('should return false for invalid account numbers', () => {
      expect(isValidCbeAccountNumber('1234567')).toBe(false); // Too short
      expect(isValidCbeAccountNumber('12345abc')).toBe(false); // Contains letters
      expect(isValidCbeAccountNumber('')).toBe(false); // Empty
      expect(isValidCbeAccountNumber('123-456-78')).toBe(false); // Contains hyphens
    });

    it('should return false for non-string inputs', () => {
      expect(isValidCbeAccountNumber(12345678 as any)).toBe(false);
      expect(isValidCbeAccountNumber(null as any)).toBe(false);
      expect(isValidCbeAccountNumber(undefined as any)).toBe(false);
    });
  });
}); 