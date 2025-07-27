import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyDirectDeposit, verifyPayment, isValidCbeAccountNumber } from '../src/payment-verifier';
import type { PaymentVerificationConfig } from '../src/types';

const TEST_CBE_ACCOUNT_NUMBER = '1000188961473'

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
    cbeAccountNumber: TEST_CBE_ACCOUNT_NUMBER,
    maxTransactionAgeHours: 24,
    rejectUnauthorized: false,
  };

  const mockTransactionDetails = {
    transactionRefNumber: 'FT25200VMC5N56279011',
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
      const result = await verifyDirectDeposit('FT25200VMC5N56279011', mockConfig);

      expect(extractTextFromPdfUrl).toHaveBeenCalledWith(
        'https://apps.cbe.com.et:100/?id=FT25200VMC5N5627901188961473',
        mockConfig
      );
      expect(extractTransactionDetails).toHaveBeenCalledWith('mock pdf text', mockConfig);
      expect(result).toEqual(mockTransactionDetails);
    });

    it('should verify transaction with URL', async () => {
      const testUrl = 'https://apps.cbe.com.et:100/?id=FT25200VMC5N56279011';
      const result = await verifyDirectDeposit(testUrl, mockConfig);

      expect(extractTextFromPdfUrl).toHaveBeenCalledWith(
        'https://apps.cbe.com.et:100/?id=FT25200VMC5N88961473',
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
      
      await expect(verifyDirectDeposit('FT25200VMC5N56279011', configWithoutAccount))
        .rejects.toThrow('CBE account number is required for verification');
    });

    it('should propagate PDF extraction errors', async () => {
      vi.mocked(extractTextFromPdfUrl).mockRejectedValue(new Error('PDF download failed'));

      await expect(verifyDirectDeposit('FT25200VMC5N56279011', mockConfig))
        .rejects.toThrow('PDF download failed');
    });

    it('should propagate transaction parsing errors', async () => {
      vi.mocked(extractTransactionDetails).mockImplementation(() => {
        throw new Error('Invalid PDF content');
      });

      await expect(verifyDirectDeposit('FT25200VMC5N56279011', mockConfig))
        .rejects.toThrow('Invalid PDF content');
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment with minimal configuration', async () => {
      const result = await verifyPayment('FT25200VMC5N56279011', TEST_CBE_ACCOUNT_NUMBER);

      expect(result).toEqual(mockTransactionDetails);
      expect(extractTextFromPdfUrl).toHaveBeenCalledWith(
        expect.stringContaining('FT25200VMC5N56279011'),
        expect.objectContaining({
          cbeAccountNumber: TEST_CBE_ACCOUNT_NUMBER,
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

      await verifyPayment('FT25200VMC5N56279011', TEST_CBE_ACCOUNT_NUMBER, options);

      expect(extractTextFromPdfUrl).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          cbeAccountNumber: TEST_CBE_ACCOUNT_NUMBER,
          maxTransactionAgeHours: 48,
          rejectUnauthorized: true,
        })
      );
    });
  });

  describe('isValidCbeAccountNumber', () => {
    it('should return true for valid account numbers', () => {
      expect(isValidCbeAccountNumber(TEST_CBE_ACCOUNT_NUMBER)).toBe(true);
    });

    it('should return false for invalid account numbers', () => {
      expect(isValidCbeAccountNumber('12345')).toBe(false); // Too short
      expect(isValidCbeAccountNumber('')).toBe(false); // Empty
      expect(isValidCbeAccountNumber('123-456-78')).toBe(false); // Contains hyphens
    });

    it('should return false for non-string inputs', () => {
      expect(isValidCbeAccountNumber(Number(TEST_CBE_ACCOUNT_NUMBER) as any)).toBe(false);
      expect(isValidCbeAccountNumber(null as any)).toBe(false);
      expect(isValidCbeAccountNumber(undefined as any)).toBe(false);
    });
  });
}); 