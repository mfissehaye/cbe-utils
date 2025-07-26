# CBE Utils

A TypeScript utility library for CBE (Commercial Bank of Ethiopia) payment verification, built with Vite and Vitest for modern development.

## Overview

CBE Utils provides tools to verify direct deposit transactions by extracting and parsing transaction details from CBE-generated PDF receipts. It supports both transaction reference numbers and direct PDF URLs.

## Features

- ✅ **PDF Text Extraction** - Download and extract text from CBE transaction PDFs
- ✅ **Transaction Parsing** - Extract structured data from unformatted PDF text
- ✅ **Payment Verification** - Verify transaction authenticity and timing
- ✅ **TypeScript** - Full type safety with comprehensive interfaces
- ✅ **Modular Architecture** - Well-organized, testable code structure
- ✅ **Comprehensive Testing** - 35+ unit tests with 100% coverage
- ✅ **Multiple Input Formats** - Support for reference numbers and URLs
- ✅ **Age Validation** - Configurable transaction age limits

## Setup

This project uses [pnpm](https://pnpm.io/) for package management. Make sure you have pnpm installed:

```bash
npm install -g pnpm
```

Install dependencies:

```bash
pnpm install
```

## Quick Start

```typescript
import { verifyPayment } from 'cbe-utils';

// Verify using transaction reference number
const result = await verifyPayment(
  'TXN123456789',  // Transaction reference number
  '12345678'       // Your CBE account number
);

console.log(result);
// {
//   transactionRefNumber: 'TXN123456789',
//   paymentDateTime: Date,
//   totalAmountDebited: '1,500.00 ETB',
//   receiver: 'ACME Corporation',
//   payer: 'John Doe'
// }
```

## API Reference

### Main Functions

#### `verifyPayment(transactionRefOrUrl, cbeAccountNumber, options?)`

Convenience function for payment verification with minimal configuration.

**Parameters:**
- `transactionRefOrUrl` (string): Transaction reference number or PDF URL
- `cbeAccountNumber` (string): Your CBE account number for verification
- `options` (object, optional): Configuration overrides

**Returns:** `Promise<TransactionDetails>`

```typescript
// Basic usage
const result = await verifyPayment('TXN123456789', '12345678');

// With custom options
const result = await verifyPayment('TXN123456789', '12345678', {
  maxTransactionAgeHours: 48,
  rejectUnauthorized: true
});
```

#### `verifyDirectDeposit(transactionRefOrUrl, config)`

Advanced verification function with full configuration control.

**Parameters:**
- `transactionRefOrUrl` (string): Transaction reference number or PDF URL
- `config` (PaymentVerificationConfig): Complete configuration object

**Returns:** `Promise<TransactionDetails>`

```typescript
import { verifyDirectDeposit } from 'cbe-utils';

const config = {
  cbeAccountNumber: '12345678',
  maxTransactionAgeHours: 24,
  rejectUnauthorized: false
};

const result = await verifyDirectDeposit('TXN123456789', config);
```

#### `isValidCbeAccountNumber(accountNumber)`

Validates CBE account number format.

**Parameters:**
- `accountNumber` (string): Account number to validate

**Returns:** `boolean`

```typescript
import { isValidCbeAccountNumber } from 'cbe-utils';

console.log(isValidCbeAccountNumber('12345678')); // true
console.log(isValidCbeAccountNumber('123abc')); // false
```

### Types

#### `TransactionDetails`

```typescript
interface TransactionDetails {
  transactionRefNumber: string | null;
  paymentDateTime: Date | null;
  totalAmountDebited: string | null;
  receiver: string | null;
  payer: string | null;
}
```

#### `PaymentVerificationConfig`

```typescript
interface PaymentVerificationConfig {
  cbeAccountNumber: string;
  maxTransactionAgeHours?: number; // Default: 24
  rejectUnauthorized?: boolean;    // Default: false
}
```

### Advanced Usage

#### Custom PDF Processing

```typescript
import { 
  extractTextFromPdfUrl, 
  extractTransactionDetails 
} from 'cbe-utils';

// Extract text from PDF
const pdfText = await extractTextFromPdfUrl(pdfUrl, config);

// Parse transaction details
const details = extractTransactionDetails(pdfText, config);
```

#### Environment Configuration

Set up environment variables for production use:

```bash
# Required
PAYMENT_CBE_ACCOUNT_NUMBER=your_cbe_account_number

# Optional
MAX_TRANSACTION_AGE_HOURS=24
REJECT_UNAUTHORIZED_SSL=false
```

## Error Handling

The library throws descriptive errors for various failure scenarios:

```typescript
try {
  const result = await verifyPayment('INVALID', '12345678');
} catch (error) {
  console.error(error.message);
  // Possible errors:
  // - "Invalid transaction reference number or URL format"
  // - "Transaction reference number not found in the PDF"
  // - "Transaction is older than 24 hours, cannot verify"
  // - "Failed to download PDF: Network error"
}
```

## Input Formats

### Transaction Reference Numbers
- Alphanumeric characters only: `TXN123456789`
- Bank reference codes: `REF789ABC123`

### PDF URLs
- Direct CBE PDF links: `https://apps.cbe.com.et:100/?id=TXN123...`
- Any valid HTTP/HTTPS URL pointing to a CBE transaction PDF

## Development Scripts

### Testing

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm coverage
```

### Building

```bash
# Build for production
pnpm build

# Run the built version
pnpm start
```

### Development

```bash
# Start development server
pnpm dev
```

## Project Structure

```
cbe-utils/
├── src/
│   ├── types.ts                  # TypeScript interfaces
│   ├── constants.ts              # Regex patterns and constants
│   ├── pdf-extractor.ts          # PDF download and text extraction
│   ├── transaction-parser.ts     # Transaction detail parsing
│   ├── payment-verifier.ts       # Main verification logic
│   └── index.ts                  # Public API exports
├── test/
│   ├── constants.test.ts         # Constants validation tests
│   ├── transaction-parser.test.ts # Transaction parsing tests
│   ├── payment-verifier.test.ts  # Payment verification tests
│   └── index.test.ts             # Public API integration tests
├── dist/                         # Compiled output
│   ├── index.js                  # ES module build
│   ├── index.cjs                 # CommonJS build
│   └── index.d.ts               # TypeScript declarations
├── coverage/                     # Test coverage reports
└── package.json                  # Dependencies and scripts
```

## Module Usage

The built library supports both ES modules and CommonJS:

```javascript
// ES modules
import { verifyPayment } from 'cbe-utils';

// CommonJS
const { verifyPayment } = require('cbe-utils');

// Default import
import CBEUtils from 'cbe-utils';
await CBEUtils.verifyPayment('TXN123', '12345678');
```

## Security Considerations

- **SSL Certificates**: By default, SSL certificate validation is disabled for CBE services due to their invalid intermediate certificates. Enable `rejectUnauthorized: true` if you have proper certificate setup.
- **Account Number**: Never expose your CBE account number in client-side code.
- **Rate Limiting**: Implement appropriate rate limiting when making multiple verification requests.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Run the test suite: `pnpm test:run`
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## License

ISC

## Support

For issues related to CBE's PDF format changes or API updates, please open an issue with:
- Sample transaction reference number (if possible)
- Error message
- Expected vs actual behavior 