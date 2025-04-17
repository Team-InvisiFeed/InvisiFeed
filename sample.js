const Invoice = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.logo}>
              <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>
                C
              </Text>
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>Sample Business Name</Text>
              <Text style={styles.companyAddress}>GSTIN: 22ABCDE1234F1Z5</Text>
            </View>
          </View>
          <View style={styles.invoiceTitle}>
            <Text style={styles.invoiceHeading}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#INV12345</Text>
            <Text style={styles.invoiceDate}>Issued on: 2025-04-17</Text>
            <Text style={styles.invoiceDate}>Due Date: 2025-04-30</Text>
          </View>
        </View>
  
        {/* Body */}
        <View style={styles.body}>
          {/* From Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>From</Text>
            <Text style={[styles.infoText, styles.infoTextBold]}>
              Sample Business Name
            </Text>
            <Text style={styles.infoText}>123, Sample Street, City</Text>
            <Text style={styles.infoText}>+91 9876543210</Text>
            <Text style={styles.infoText}>samplebusiness@email.com</Text>
            <Text style={styles.infoText}>GSTIN Holder Name: Sample Name</Text>
          </View>
  
          {/* To Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>To</Text>
            <Text style={[styles.infoText, styles.infoTextBold]}>
              Sample Customer Name
            </Text>
            <Text style={styles.infoText}>789, Customer Avenue, City</Text>
            <Text style={styles.infoText}>+91 1234567890</Text>
            <Text style={styles.infoText}>customer@email.com</Text>
          </View>
  
          {/* Items Table */}
          <View style={styles.table}>
            <View
              style={{ flexDirection: "row", borderBottom: "1px solid #eaeaea" }}
            >
              <Text style={[styles.tableHeader, { width: "25%" }]}>
                Description
              </Text>
              <Text
                style={[
                  styles.tableHeader,
                  { width: "15%", textAlign: "center" },
                ]}
              >
                Quantity
              </Text>
              <Text
                style={[styles.tableHeader, { width: "15%", textAlign: "right" }]}
              >
                Rate
              </Text>
              <Text
                style={[styles.tableHeader, { width: "15%", textAlign: "right" }]}
              >
                Discount
              </Text>
              <Text
                style={[styles.tableHeader, { width: "15%", textAlign: "right" }]}
              >
                Tax
              </Text>
              <Text
                style={[styles.tableHeader, { width: "15%", textAlign: "right" }]}
              >
                Total
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", borderBottom: "1px solid #eaeaea" }}
            >
              <Text style={[styles.tableCell, { width: "25%" }]}>
                Sample Item 1
              </Text>
              <Text
                style={[styles.tableCell, { width: "15%", textAlign: "center" }]}
              >
                2
              </Text>
              <Text
                style={[styles.tableCell, { width: "15%", textAlign: "right" }]}
              >
                500
              </Text>
              <Text
                style={[styles.tableCell, { width: "15%", textAlign: "right" }]}
              >
                10%
              </Text>
              <Text
                style={[styles.tableCell, { width: "15%", textAlign: "right" }]}
              >
                18%
              </Text>
              <Text
                style={[styles.tableCell, { width: "15%", textAlign: "right" }]}
              >
                900
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", borderBottom: "1px solid #eaeaea" }}
            >
              <Text style={[styles.tableCell, { width: "25%" }]}>
                Sample Item 1
              </Text>
              <Text
                style={[styles.tableCell, { width: "15%", textAlign: "center" }]}
              >
                2
              </Text>
              <Text
                style={[styles.tableCell, { width: "15%", textAlign: "right" }]}
              >
                500
              </Text>
              <Text
                style={[styles.tableCell, { width: "15%", textAlign: "right" }]}
              >
                10%
              </Text>
              <Text
                style={[styles.tableCell, { width: "15%", textAlign: "right" }]}
              >
                18%
              </Text>
              <Text
                style={[styles.tableCell, { width: "15%", textAlign: "right" }]}
              >
                900
              </Text>
            </View>
  
  
          </View>
  
          <View style={styles.PScontainer}>
            {/* Payment Details */}
            <View style={styles.paymentMethod}>
              <Text style={[styles.infoTextBold, styles.paymentDetailHeading]}>
                Payment Details
              </Text>
              <Text style={[styles.infoText]}>Method: UPI</Text>
              <Text style={styles.infoText}>
                Terms: Full Payment Before Delivery
              </Text>
              <Text style={styles.infoText}>Bank/UPI Details: sample@upi</Text>
              <Text style={[styles.infoText, { marginTop: 2 , lineHeight:1.3 }]}>
                Kindly ensure payment within the due date to avoid penalties.
                Kindly ensure payment within the due date to avoid penalties.
                Kindly ensure payment within the due date to avoid penalties.
              </Text>
            </View>
  
            {/* Summary */}
            <View style={styles.summary}>
              <View style={styles.summaryTable}>
                <View style={styles.summaryRow}>
                  <Text>Subtotal</Text>
                  <Text>₹1000</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text>Discount</Text>
                  <Text>₹100</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text>Tax (18%)</Text>
                  <Text>₹162</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryRowLast]}>
                  <Text>Total</Text>
                  <Text>₹1062</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
  
        {/* Notes */}
        <View
          style={[
            {
              marginTop: 5,
              marginBottom: 10,
              padding: 10,
              backgroundColor: "#f9fafb",
              borderRadius: 4,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: "#4b5563" }]}>
            Additional Notes
          </Text>
          <Text style={[styles.infoText, { lineHeight: 1.4 }]}>
            Please handle the goods with care. Returns are accepted within 7 days
            of delivery.
          </Text>
        </View>
  
        <View style={styles.signature}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>Sample Business Name</Text>
        </View>
        
        {/* Fixed Footer */}
  
        <View
          style={
            {
              position:"absolute",
                bottom:20,
                  right:20,
                    left:20
            }
          }
          >
          {/* Feedback Section */}
          <View style={styles.feedbackSection}>
            <View style={{ flex: 1 }}>
              <View style={styles.feedbackText}>
                <Text>
                  Scan this QR code to provide feedback on our service. {" "}
                </Text>
                <Text>Your input
                  helps us improve!</Text>
  
                <Text>
                  Complete the feedback form for a chance to win a special
                  coupon for your next service.
                </Text>
  <Link src="https://react-pdf.org/styling#valid-css-properties">Click here</Link>
              </View>
            </View>
            <Image
              src={
                "https://img.freepik.com/free-vector/scan-me-qr-code_78370-2915.jpg"
              }
              style={styles.qrCode}
            />
          </View>
  
          <View
            style={{
              marginTop: 10,
              backgroundColor: "#fff1f2",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #fecdd3",
            }}
          >
            <Text
              style={{
                color: "#881337",
                fontSize: 7,
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              Disclaimer: This tool is meant strictly for generating valid
              business invoices. Any misuse, such as fake invoicing or GST fraud,
              is punishable under the GST Act, 2017 and Bharatiya Nyaya Sanhita
              (BNS), 2023 (Sections 316 & 333). The user is solely responsible for
              the accuracy of GSTIN or any missing information; as per Rule 46 of
              the CGST Rules, furnishing correct invoice details is the supplier’s
              responsibility. We are not liable for any incorrect, fake, or
              missing GSTIN entered by users.
            </Text>
          </View>
          <Text style={styles.createdWith}>
            Created with <Text style={styles.createdWithSpan}>InvisiFeed</Text>
          </Text>
        </View>
      </Page>
    </Document>
  );
  
  const styles = StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "#ffffff",
      padding: 20,
      fontSize: 9,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
      paddingBottom: 10,
      borderBottom: "1px solid #eaeaea",
    },
    logoSection: {
      flexDirection: "row",
      alignItems: "center",
    },
    logo: {
      width: 30,
      height: 30,
      backgroundColor: "#4f46e5",
      borderRadius: 4,
      marginRight: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    companyInfo: {
      flexDirection: "column",
    },
    companyName: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#1a1a1a",
      marginBottom: 2,
    },
    companyAddress: {
      fontSize: 8,
      color: "#6b7280",
    },
    invoiceTitle: {
      alignItems: "flex-end",
    },
    invoiceHeading: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#4f46e5",
      marginBottom: 2,
    },
    invoiceNumber: {
      fontSize: 10,
      fontWeight: "medium",
      color: "#1a1a1a",
    },
    invoiceDate: {
      fontSize: 8,
      color: "#6b7280",
      marginTop: 2,
    },
    body: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 10,
    },
    infoSection: {
      width: "50%",
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 8,
      fontWeight: "semibold",
      color: "#6b7280",
      marginBottom: 5,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    sectionTitleBold: {
      fontSize: 10,
      fontWeight: "bold",
      color: "#6b7280",
      marginBottom: 5,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    infoText: {
      fontSize: 8,
      marginBottom: 5,
      color: "#4b5563",
    },
    infoTextBold: {
      fontSize: 10,
      fontWeight: "semibold",
      color: "#1a1a1a",
    },
    table: {
      width: "100%",
      marginBottom: 10,
      borderCollapse: "collapse",
    },
    tableHeader: {
      backgroundColor: "#f9fafb",
      padding: "8 10",
      fontSize: 8,
      fontWeight: "semibold",
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    tableCell: {
      padding: "8 10",
      fontSize: 8,
      color: "#4b5563",
    },
    tableCellBold: {
      fontWeight: "medium",
      color: "#1a1a1a",
    },
    tableCellRight: {
      textAlign: "right",
    },
    summary: {
      width: "100%",
      alignItems: "flex-end",
      marginBottom: 10,
    },
    summaryTable: {
              borderTop: "1px solid #eaeaea",
  
      width: 200,
    },
    summaryRow: {
  
      flexDirection: "row",
      justifyContent: "space-between",
      padding: "6 8",
      borderBottom: "0.5px solid #eaeaea",
    },
    summaryRowLast: {
      backgroundColor: "#f9fafb",
      fontWeight: "bold",
      fontSize: 10,
      color: "#4f46e5",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
      paddingTop: 10,
      borderTop: "1px solid #eaeaea",
    },
    paymentMethod: {
      width: 300,
    },
    feedbackSection: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: "#f9fafb",
      padding: 15,
      borderRadius: 6,
      border: "1px solid #eaeaea",
      marginTop: 15,
      marginBottom: 15,
    },
    feedbackText: {
      fontSize: 11,
      color: "#4b5563",
      lineHeight: 1.5,
      marginRight: 110,
    },
    qrCode: {
      width: 80,
      height: 80,
    },
    thankYou: {
      textAlign: "center",
      marginTop: 10,
      fontSize: 10,
      fontWeight: "semibold",
      color: "#1a1a1a",
    },
    signature: {
      marginTop: 10,
      alignItems: "flex-end",
    },
    signatureLine: {
      width: 120,
      height: 1,
      backgroundColor: "#d1d5db",
      marginBottom: 4,
    },
    signatureText: {
      fontSize: 8,
      color: "#6b7280",
    },
    createdWith: {
      textAlign: "center",
      marginTop: 10,
      fontSize: 8,
      color: "#6b7280",
      fontStyle: "italic",
    },
    createdWithSpan: {
      color: "#4f46e5",
      fontWeight: "semibold",
    },
    PScontainer: {
      flexDirection: "row",
    },
    paymentDetailHeading: {
      marginBottom: 4,
    },
  });
  
  ReactPDF.render(<Invoice />);
  
  
  
  
  
  
  
  