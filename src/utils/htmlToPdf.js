/**
 * HTML to PDF Conversion Utility
 * This file contains functions for converting HTML to PDF using Puppeteer
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

/**
 * Converts HTML content to PDF
 * @param {string} html - The HTML content to convert
 * @returns {Promise<Buffer>} - A buffer containing the PDF data
 */
export const convertHtmlToPdf = async (html) => {
  try {
    // Configure Puppeteer to use the correct Chrome executable
    const executablePath = await chromium.executablePath;
    
    // Launch browser with appropriate options
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    // Create a new page
    const page = await browser.newPage();
    
    // Set content to the HTML
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
      },
    });

    // Close the browser
    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error('Error converting HTML to PDF:', error);
    throw new Error(`Failed to convert HTML to PDF: ${error.message}`);
  }
}; 