import { Document, Page, Text, View, StyleSheet, Image, renderToStream } from '@react-pdf/renderer';
import QRCode from 'qrcode';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontSize: 9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: '1px solid #eaeaea',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    backgroundColor: '#4f46e5',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyInfo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 8,
    color: '#6b7280',
  },
  invoiceTitle: {
    alignItems: 'flex-end',
  },
  invoiceHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 2,
  },
  invoiceNumber: {
    fontSize: 10,
    fontWeight: 'medium',
    color: '#1a1a1a',
  },
  invoiceDate: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
  },
  body: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  infoSection: {
    width: '50%',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'semibold',
    color: '#6b7280',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 8,
    marginBottom: 2,
    color: '#4b5563',
  },
  infoTextBold: {
    fontSize: 10,
    fontWeight: 'semibold',
    color: '#1a1a1a',
  },
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    padding: '4 8',
    fontSize: 8,
    fontWeight: 'semibold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableCell: {
    padding: '6 8',
    fontSize: 8,
    color: '#4b5563',
    borderBottom: '1px solid #eaeaea',
  },
  tableCellBold: {
    fontWeight: 'medium',
    color: '#1a1a1a',
  },
  tableCellRight: {
    textAlign: 'right',
  },
  summary: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  summaryTable: {
    width: 200,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '4 8',
    borderBottom: '1px solid #eaeaea',
  },
  summaryRowLast: {
    backgroundColor: '#f9fafb',
    fontWeight: 'bold',
    fontSize: 10,
    color: '#4f46e5',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1px solid #eaeaea',
  },
  paymentMethod: {
    flex: 1,
  },
  feedbackSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 4,
    border: '1px solid #eaeaea',
    marginTop: 10,
  },
  feedbackText: {
    flex: 1,
    fontSize: 8,
    color: '#4b5563',
    lineHeight: 1.4,
    marginRight: 10,
  },
  qrCode: {
    width: 60,
    height: 60,
  },
  thankYou: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 10,
    fontWeight: 'semibold',
    color: '#1a1a1a',
  },
  signature: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  signatureLine: {
    width: 120,
    height: 1,
    backgroundColor: '#d1d5db',
    marginBottom: 4,
  },
  signatureText: {
    fontSize: 8,
    color: '#6b7280',
  },
  createdWith: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 8,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  createdWithSpan: {
    color: '#4f46e5',
    fontWeight: 'semibold',
  },
});

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Create PDF document
const InvoiceDocument = ({ invoiceData, invoiceNumber, qrDataUrl, subtotal, discountTotal, taxTotal, grandTotal }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Filter out empty fields
  const filteredInvoiceData = {
    ...invoiceData,
    businessName: invoiceData.businessName || undefined,
    businessAddress: invoiceData.businessAddress || undefined,
    businessPhone: invoiceData.businessPhone || undefined,
    businessEmail: invoiceData.businessEmail || undefined,
    customerName: invoiceData.customerName || undefined,
    customerAddress: invoiceData.customerAddress || undefined,
    customerPhone: invoiceData.customerPhone || undefined,
    customerEmail: invoiceData.customerEmail || undefined,
    bankDetails: invoiceData.bankDetails || undefined,
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.logo}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                {filteredInvoiceData.businessName?.[0] || 'C'}
              </Text>
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>
                {filteredInvoiceData.businessName || 'Company Name'}
              </Text>
              <Text style={styles.companyAddress}>
                {filteredInvoiceData.businessAddress || 'Company Address'}
              </Text>
            </View>
          </View>
          <View style={styles.invoiceTitle}>
            <Text style={styles.invoiceHeading}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>{currentDate}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* From Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>From</Text>
            {filteredInvoiceData.businessName && (
              <Text style={[styles.infoText, styles.infoTextBold]}>
                {filteredInvoiceData.businessName}
              </Text>
            )}
            {filteredInvoiceData.businessAddress && (
              <Text style={styles.infoText}>{filteredInvoiceData.businessAddress}</Text>
            )}
            {filteredInvoiceData.businessPhone && (
              <Text style={styles.infoText}>{filteredInvoiceData.businessPhone}</Text>
            )}
            {filteredInvoiceData.businessEmail && (
              <Text style={styles.infoText}>{filteredInvoiceData.businessEmail}</Text>
            )}
          </View>

          {/* To Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>To</Text>
            {filteredInvoiceData.customerName && (
              <Text style={[styles.infoText, styles.infoTextBold]}>
                {filteredInvoiceData.customerName}
              </Text>
            )}
            {filteredInvoiceData.customerAddress && (
              <Text style={styles.infoText}>{filteredInvoiceData.customerAddress}</Text>
            )}
            {filteredInvoiceData.customerPhone && (
              <Text style={styles.infoText}>{filteredInvoiceData.customerPhone}</Text>
            )}
            {filteredInvoiceData.customerEmail && (
              <Text style={styles.infoText}>{filteredInvoiceData.customerEmail}</Text>
            )}
          </View>

          {/* Items Table */}
          <View style={styles.table}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.tableHeader, { width: '40%' }]}>Description</Text>
              <Text style={[styles.tableHeader, { width: '20%' }]}>Price</Text>
              <Text style={[styles.tableHeader, { width: '20%' }]}>Quantity</Text>
              <Text style={[styles.tableHeader, { width: '20%' }]}>Total</Text>
            </View>
            {filteredInvoiceData.items.map((item, index) => (
              <View key={index} style={{ flexDirection: 'row' }}>
                <Text style={[styles.tableCell, styles.tableCellBold, { width: '40%' }]}>
                  {item.description}
                </Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>
                  {formatCurrency(item.rate)}
                </Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellRight, { width: '20%' }]}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
            ))}
          </View>

          {/* Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryTable}>
              <View style={styles.summaryRow}>
                <Text>Subtotal</Text>
                <Text>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Discount</Text>
                <Text>{formatCurrency(discountTotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Tax ({filteredInvoiceData.taxRate}%)</Text>
                <Text>{formatCurrency(taxTotal)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowLast]}>
                <Text>Total</Text>
                <Text>{formatCurrency(grandTotal)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        {filteredInvoiceData.bankDetails && (
          <View style={styles.paymentMethod}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {filteredInvoiceData.bankDetails.split('\n').map((line, index) => (
              <Text key={index} style={styles.infoText}>{line}</Text>
            ))}
          </View>
        )}

        {/* Feedback Section */}
        <View style={styles.feedbackSection}>
          <View style={{ flex: 1 }}>
            <Text style={styles.feedbackText}>
              Scan this QR code to provide feedback on our service. Your input helps us improve!
              Complete the feedback form for a chance to win a special discount coupon for your next service.
            </Text>
          </View>
          <Image src={qrDataUrl} style={styles.qrCode} />
        </View>

        <Text style={styles.thankYou}>Thank You For Your Business!</Text>

        <View style={styles.signature}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>
            {filteredInvoiceData.businessName || 'Signature'}
          </Text>
        </View>

        <Text style={styles.createdWith}>
          Created with <Text style={styles.createdWithSpan}>InvisiFeed</Text>
        </Text>
      </Page>
    </Document>
  );
};

export const generateInvoicePdf = async (invoiceData, invoiceNumber, qrDataUrl, subtotal, discountTotal, taxTotal, grandTotal) => {
  try {
    // Generate QR code
    const qrData = await QRCode.toDataURL(qrDataUrl, { width: 300 });

    // Create PDF document
    const doc = InvoiceDocument({
      invoiceData,
      invoiceNumber,
      qrDataUrl: qrData,
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal
    });

    // Render to stream
    const stream = await renderToStream(doc);
    
    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return buffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 