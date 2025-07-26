import { describe, it, expect } from 'vitest';
import CBEUtils, { 
  verifyDirectDeposit, 
  verifyPayment, 
  isValidCbeAccountNumber,
  CBE_VERIFICATION_BASE_URL,
  TRANSACTION_REFERENCE_REGEX,
  TRANSACTION_URL_REGEX,
  DEFAULT_MAX_TRANSACTION_AGE_HOURS 
} from '../src/index';

describe('CBE Utils - Public API', () => {
  describe('Named Exports', () => {
    it('should export main verification functions', () => {
      expect(typeof verifyDirectDeposit).toBe('function');
      expect(typeof verifyPayment).toBe('function');
      expect(typeof isValidCbeAccountNumber).toBe('function');
    });

    it('should export constants', () => {
      expect(CBE_VERIFICATION_BASE_URL).toBe('https://apps.cbe.com.et:100');
      expect(TRANSACTION_REFERENCE_REGEX).toBeInstanceOf(RegExp);
      expect(TRANSACTION_URL_REGEX).toBeInstanceOf(RegExp);
      expect(DEFAULT_MAX_TRANSACTION_AGE_HOURS).toBe(24);
    });
  });

  describe('Default Export', () => {
    it('should export an object with main functions', () => {
      expect(typeof CBEUtils).toBe('object');
      expect(typeof CBEUtils.verifyDirectDeposit).toBe('function');
      expect(typeof CBEUtils.verifyPayment).toBe('function');
      expect(typeof CBEUtils.isValidCbeAccountNumber).toBe('function');
    });

    it('should have the same functions as named exports', () => {
      expect(CBEUtils.verifyDirectDeposit).toBe(verifyDirectDeposit);
      expect(CBEUtils.verifyPayment).toBe(verifyPayment);
      expect(CBEUtils.isValidCbeAccountNumber).toBe(isValidCbeAccountNumber);
    });
  });

  describe('isValidCbeAccountNumber (integration)', () => {
    it('should validate CBE account number format correctly', () => {
      // Valid account numbers
      expect(isValidCbeAccountNumber('12345678')).toBe(true);
      expect(isValidCbeAccountNumber('123456789012345')).toBe(true);
      
      // Invalid account numbers
      expect(isValidCbeAccountNumber('1234567')).toBe(false); // Too short
      expect(isValidCbeAccountNumber('abc12345')).toBe(false); // Contains letters
      expect(isValidCbeAccountNumber('123-456-78')).toBe(false); // Contains special chars
      expect(isValidCbeAccountNumber('')).toBe(false); // Empty string
    });
  });
}); 