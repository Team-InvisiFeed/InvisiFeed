import sendEmail from './nodemailerUtility';

const sendInvoiceToMail = async (customerEmail, invoiceNumber, pdfUrl, companyName) => {
  const subject = `Invoice from ${companyName} - #${invoiceNumber}`;
  
  // HTML email template with styling
  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333333; font-size: 24px; margin-bottom: 10px;">Invoice from ${companyName}</h1>
        <p style="color: #666666; font-size: 16px;">Invoice #${invoiceNumber}</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Dear Customer,
        </p>
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Thank you for your business. Please find your invoice attached to this email.
        </p>
        <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; border: 1px solid #e9ecef; margin-bottom: 20px;">
          <p style="color: #333333; font-size: 16px; margin: 0;">
            <strong>Invoice Number:</strong> ${invoiceNumber}
          </p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${pdfUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; transition: background-color 0.3s;">
            View Invoice Online
          </a>
        </div>
      </div>
      
      <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
        <p style="color: #666666; font-size: 14px; margin: 0;">
          Best regards,<br>
          <strong>${companyName}</strong>
        </p>
      </div>
    </div>
  `;

  // Plain text version for email clients that don't support HTML
  const textMessage = `
    Dear Customer,

    Thank you for your business. Please find your invoice attached to this email.

    Invoice Number: ${invoiceNumber}

    You can also view your invoice online at: ${pdfUrl}

    Best regards,
    ${companyName}
  `;

  try {
    // Fetch the PDF file
    const pdfResponse = await fetch(pdfUrl);
    const pdfBuffer = await pdfResponse.arrayBuffer();
    
    // Create attachment object
    const attachment = {
      filename: `Invoice_${invoiceNumber}.pdf`,
      content: Buffer.from(pdfBuffer),
    };

    await sendEmail(customerEmail, subject, htmlMessage, attachment);
    return { success: true };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return { success: false, error: error.message };
  }
};

export default sendInvoiceToMail; 