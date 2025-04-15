/**
 * HTML to PDF Converter
 * This file contains the utility function for converting HTML to PDF using Puppeteer
 */

import puppeteer from 'puppeteer';

/**
 * Converts HTML content to PDF
 * @param {string} html - The HTML content to convert
 * @returns {Promise<Buffer>} - The PDF buffer
 */
const convertHtmlToPdf = async (html) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    return pdf;
  } finally {
    await browser.close();
  }
};

export { convertHtmlToPdf }; 