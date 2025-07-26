import axios from 'axios';
import * as https from 'node:https';
import { readPdfText } from 'pdf-text-reader';
import type { PaymentVerificationConfig } from './types.js';

/**
 * Creates an HTTPS agent with appropriate SSL configuration for CBE services
 */
function createHttpsAgent(rejectUnauthorized = false): https.Agent {
  return new https.Agent({ rejectUnauthorized });
}

/**
 * Downloads PDF content from a given URL
 * @param url The URL of the PDF file to download
 * @param config Configuration options for the request
 * @returns Promise resolving to the PDF data as a blob
 */
export async function downloadPdf(
  url: string,
  config: PaymentVerificationConfig
): Promise<any> {
  const httpsAgent = createHttpsAgent(config.rejectUnauthorized);
  
  try {
    const response = await axios.get(url, {
      httpsAgent,
      responseType: 'blob',
      responseEncoding: 'binary',
      timeout: 30000, // 30 second timeout
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to download PDF: ${error.message}`);
    }
    throw new Error(`Unexpected error downloading PDF: ${error}`);
  }
}

/**
 * Extracts text content from PDF data
 * @param pdfData The PDF data as a blob
 * @returns Promise resolving to the extracted text
 */
export async function extractPdfText(pdfData: any): Promise<string> {
  try {
    return await readPdfText({ data: pdfData });
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error}`);
  }
}

/**
 * Downloads and extracts text from a PDF file at the given URL
 * @param url The URL of the PDF file
 * @param config Configuration options
 * @returns Promise resolving to the extracted text
 */
export async function extractTextFromPdfUrl(
  url: string,
  config: PaymentVerificationConfig
): Promise<string> {
  const pdfData = await downloadPdf(url, config);
  return await extractPdfText(pdfData);
} 