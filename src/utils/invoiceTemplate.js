/**
 * Invoice HTML Template Generator
 * This file contains the HTML template for generating invoices
 */

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Create invoice HTML
const createInvoiceHtml = (invoiceData, invoiceNumber, qrDataUrl, subtotal, discountTotal, taxTotal, grandTotal) => {
  // Format date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate HTML
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${invoiceNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          color: #1a1a1a;
          line-height: 1.4;
          background-color: #ffffff;
          padding: 0;
          margin: 0;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 25px;
          background-color: #ffffff;
        }
        
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eaeaea;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
        }
        
        .logo {
          width: 40px;
          height: 40px;
          background-color: #4f46e5;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: white;
          font-weight: 700;
          font-size: 16px;
        }
        
        .company-info h1 {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 3px;
        }
        
        .company-info p {
          font-size: 12px;
          color: #6b7280;
        }
        
        .invoice-title {
          text-align: right;
        }
        
        .invoice-title h2 {
          font-size: 28px;
          font-weight: 700;
          color: #4f46e5;
          margin-bottom: 3px;
        }
        
        .invoice-number {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
        }
        
        .invoice-date {
          font-size: 12px;
          color: #6b7280;
          margin-top: 3px;
        }
        
        .invoice-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-bottom: 25px;
        }
        
        .invoice-info-section {
          margin-bottom: 20px;
        }
        
        .invoice-info-section h3 {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .invoice-info-section p {
          font-size: 12px;
          margin-bottom: 3px;
          color: #4b5563;
        }
        
        .invoice-info-section p:first-of-type {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 14px;
        }
        
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          grid-column: 1 / -1;
        }
        
        .invoice-table th {
          background-color: #f9fafb;
          padding: 8px 12px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .invoice-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #eaeaea;
          font-size: 12px;
          color: #4b5563;
        }
        
        .invoice-table tr:last-child td {
          border-bottom: none;
        }
        
        .invoice-table .description {
          font-weight: 500;
          color: #1a1a1a;
        }
        
        .invoice-table .amount {
          text-align: right;
          font-weight: 500;
          color: #1a1a1a;
        }
        
        .invoice-summary {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
        }
        
        .invoice-summary-table {
          width: 250px;
          border-collapse: collapse;
        }
        
        .invoice-summary-table tr {
          border-bottom: 1px solid #eaeaea;
        }
        
        .invoice-summary-table tr:last-child {
          border-bottom: none;
          background-color: #f9fafb;
        }
        
        .invoice-summary-table td {
          padding: 8px 12px;
          font-size: 12px;
          color: #4b5563;
        }
        
        .invoice-summary-table td:last-child {
          text-align: right;
          font-weight: 500;
          color: #1a1a1a;
        }
        
        .invoice-summary-table tr:last-child td {
          font-weight: 700;
          font-size: 14px;
          color: #4f46e5;
        }
        
        .invoice-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 25px;
          padding-top: 15px;
          border-top: 1px solid #eaeaea;
        }
        
        .payment-method {
          flex: 1;
        }
        
        .payment-method h3 {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .payment-method p {
          font-size: 12px;
          margin-bottom: 3px;
          color: #4b5563;
        }
        
        .feedback-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-left: 20px;
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #eaeaea;
        }
        
        .feedback-section h3 {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .qr-code {
          margin-bottom: 10px;
        }
        
        .qr-code img {
          width: 100px;
          height: 100px;
          border-radius: 6px;
          border: 1px solid #eaeaea;
        }
        
        .feedback-text {
          font-size: 11px;
          color: #4b5563;
          text-align: center;
          max-width: 180px;
          line-height: 1.4;
        }
        
        .feedback-link {
          margin-top: 8px;
          font-size: 11px;
          color: #4f46e5;
          text-decoration: underline;
          font-weight: 500;
        }
        
        .thank-you {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
        }
        
        .signature {
          margin-top: 20px;
          text-align: right;
        }
        
        .signature-line {
          width: 180px;
          height: 1px;
          background-color: #d1d5db;
          margin-left: auto;
          margin-bottom: 6px;
        }
        
        .signature p {
          font-size: 12px;
          color: #6b7280;
        }
        
        .created-with {
          text-align: center;
          margin-top: 25px;
          font-size: 12px;
          color: #6b7280;
          font-style: italic;
        }
        
        .created-with span {
          color: #4f46e5;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div class="logo-section">
            <div class="logo">${invoiceData.businessName ? invoiceData.businessName.charAt(0) : 'C'}</div>
            <div class="company-info">
              <h1>${invoiceData.businessName || 'Company Name'}</h1>
              <p>${invoiceData.businessAddress || 'Company Address'}</p>
            </div>
          </div>
          <div class="invoice-title">
            <h2>INVOICE</h2>
            <div class="invoice-number">#${invoiceNumber}</div>
            <div class="invoice-date">${currentDate}</div>
          </div>
        </div>
        
        <div class="invoice-body">
          <div class="invoice-info-section">
            <h3>From</h3>
            <p>${invoiceData.businessName || 'Company Name'}</p>
            <p>${invoiceData.businessAddress || 'Company Address'}</p>
            <p>${invoiceData.businessPhone || 'Company Phone'}</p>
            <p>${invoiceData.businessEmail || 'Company Email'}</p>
          </div>
          <div class="invoice-info-section">
            <h3>To</h3>
            <p>${invoiceData.customerName}</p>
            <p>${invoiceData.customerAddress || ''}</p>
            <p>${invoiceData.customerPhone || ''}</p>
            <p>${invoiceData.customerEmail || ''}</p>
          </div>
          
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items.map(item => `
                <tr>
                  <td class="description">${item.description}</td>
                  <td>${formatCurrency(item.rate)}</td>
                  <td>${item.quantity}</td>
                  <td class="amount">${formatCurrency(item.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="invoice-summary">
            <table class="invoice-summary-table">
              <tr>
                <td>Subtotal</td>
                <td>${formatCurrency(subtotal)}</td>
              </tr>
              <tr>
                <td>Discount</td>
                <td>${formatCurrency(discountTotal)}</td>
              </tr>
              <tr>
                <td>Tax (${invoiceData.taxRate}%)</td>
                <td>${formatCurrency(taxTotal)}</td>
              </tr>
              <tr>
                <td>Total</td>
                <td>${formatCurrency(grandTotal)}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <div class="invoice-footer">
          <div class="payment-method">
            <h3>Payment Method</h3>
            ${invoiceData.bankDetails ? invoiceData.bankDetails.split('\n').map(line => `<p>${line}</p>`).join('') : '<p>Bank Transfer</p>'}
          </div>
          <div class="feedback-section">
            <h3>Share Your Feedback</h3>
            <div class="qr-code">
              <img src="${qrDataUrl}" alt="QR Code" />
            </div>
            <p class="feedback-text">Scan this QR code to provide feedback on our service. Your input helps us improve!</p>
            <p class="feedback-text">Complete the feedback form for a chance to win a special discount coupon for your next service.</p>
            <a href="${qrDataUrl}" class="feedback-link">Click here to provide feedback</a>
          </div>
        </div>
        
        <div class="thank-you">Thank You For Your Business!</div>
        
        <div class="signature">
          <div class="signature-line"></div>
          <p>${invoiceData.businessName || 'Signature'}</p>
        </div>
        
        <div class="created-with">Created with <span>InvisiFeed</span></div>
      </div>
    </body>
    </html>
  `;
};

export { createInvoiceHtml }; 