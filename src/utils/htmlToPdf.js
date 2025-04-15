/**
 * HTML to PDF Conversion Utility
 * This file contains functions for converting HTML to PDF using Puppeteer
 */

import puppeteer from 'puppeteer';

/**
 * Converts HTML content to PDF
 * @param {string} html - The HTML content to convert
 * @returns {Promise<Buffer>} - A buffer containing the PDF data
 */
export const convertHtmlToPdf = async (html) => {
  let browser = null;
  
  try {
    // Launch browser with appropriate options for different environments
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
      ],
    });

    // Create a new page
    const page = await browser.newPage();
    
    // Set content to the HTML with increased timeout
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000 // 30 seconds
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

    return pdfBuffer;
  } catch (error) {
    console.error('Error converting HTML to PDF:', error);
    throw new Error(`Failed to convert HTML to PDF: ${error.message}`);
  } finally {
    // Ensure browser is closed even if an error occurs
    if (browser) {
      await browser.close();
    }
  }
}; 