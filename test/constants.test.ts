import { describe, it, expect } from 'vitest';
import {
  CBE_VERIFICATION_BASE_URL,
  TRANSACTION_REFERENCE_REGEX,
  TRANSACTION_URL_REGEX,
  DEFAULT_MAX_TRANSACTION_AGE_HOURS,
  PDF_EXTRACTION_PATTERNS,
} from '../src/constants';

describe('Constants', () => {
  describe('CBE_VERIFICATION_BASE_URL', () => {
    it('should have the correct CBE verification URL', () => {
      expect(CBE_VERIFICATION_BASE_URL).toBe('https://apps.cbe.com.et:100');
    });
  });

  describe('DEFAULT_MAX_TRANSACTION_AGE_HOURS', () => {
    it('should be set to 24 hours', () => {
      expect(DEFAULT_MAX_TRANSACTION_AGE_HOURS).toBe(24);
    });
  });

  describe('TRANSACTION_REFERENCE_REGEX', () => {
    it('should match valid alphanumeric reference numbers', () => {
      expect(TRANSACTION_REFERENCE_REGEX.test('FT25200VMC5N')).toBe(true);
    });

    it('should not match invalid reference numbers', () => {
      expect(TRANSACTION_REFERENCE_REGEX.test('abc-123')).toBe(false);
      expect(TRANSACTION_REFERENCE_REGEX.test('ref 123')).toBe(false);
      expect(TRANSACTION_REFERENCE_REGEX.test('')).toBe(false);
      expect(TRANSACTION_REFERENCE_REGEX.test('ref@123')).toBe(false);
    });
  });

  describe('TRANSACTION_URL_REGEX', () => {
    it('should match valid HTTP and HTTPS URLs', () => {
      expect(TRANSACTION_URL_REGEX.test('https://apps.cbe.com.et:100/?id=FT25200VMC5G56280011')).toBe(true);
    });

    it('should not match non-URL strings', () => {
      expect(TRANSACTION_URL_REGEX.test('https://example.com')).toBe(false);
      expect(TRANSACTION_URL_REGEX.test('not-a-url')).toBe(false);
      expect(TRANSACTION_URL_REGEX.test('ftp://example.com')).toBe(false);
      expect(TRANSACTION_URL_REGEX.test('')).toBe(false);
    });
  });

  describe('PDF_EXTRACTION_PATTERNS', () => {
    it('should match reference number pattern', () => {
      const text = 'Reference No. (VAT Invoice No)   ABC123456';
      const match = text.match(PDF_EXTRACTION_PATTERNS.REFERENCE_NUMBER);
      expect(match?.[1]?.trim()).toBe('ABC123456');
    });

    it('should match payment date time pattern', () => {
      const text = 'Payment Date & Time 12/25/2023, 2:30:45 PM';
      const match = text.match(PDF_EXTRACTION_PATTERNS.PAYMENT_DATE_TIME);
      expect(match?.[1]).toBe('12/25/2023, 2:30:45 PM');
    });

    it('should match total amount pattern', () => {
      const text = 'Total amount debited from customers account 1,500.00 ETB';
      const match = text.match(PDF_EXTRACTION_PATTERNS.TOTAL_AMOUNT);
      expect(match?.[1]?.trim()).toBe('1,500.00 ETB');
    });

    it('should match receiver pattern', () => {
      const text = 'Receiver John Doe Company';
      const match = text.match(PDF_EXTRACTION_PATTERNS.RECEIVER);
      expect(match?.[1]?.trim()).toBe('John Doe Company');
    });

    it('should match payer pattern', () => {
      const text = 'Payer Jane Smith';
      const match = text.match(PDF_EXTRACTION_PATTERNS.PAYER);
      expect(match?.[1]?.trim()).toBe('Jane Smith');
    });
  });
}); 