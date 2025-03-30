import { NextResponse } from 'next/server';
import sendInvoiceToMail from '@/utils/sendInvoiceToMail';

export async function POST(req) {
  try {
    const { customerEmail, invoiceNumber, pdfUrl, companyName } = await req.json();

    if (!customerEmail || !invoiceNumber || !pdfUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendInvoiceToMail(
      customerEmail,
      invoiceNumber,
      pdfUrl,
      companyName
    );

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-invoice-email route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 