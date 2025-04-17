const Quixote = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={[styles.header, styles.centerContent]}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>InvisiFeed</Text>
          <Text style={styles.companyTagline}>Your Feedback Matters</Text>
        </View>
      </View>

      {/* Invoice Details */}
      <View style={styles.orgInfo}>
        <View style={styles.invoiceDetails}>
          <Text style={styles.invoiceNumber}>From: Business Name</Text>

          <Text style={styles.invoiceDate}>Email: abc@gmail.com</Text>
          <Text style={styles.invoiceDate}>GSTIN holder name: 2024-04-17</Text>
        </View>
        <View style={styles.invoiceDetails}>
          <Text style={styles.invoiceNumber}>Invoice: 123456</Text>
          <Text style={styles.invoiceDate}>Invoice Date: 2024-04-17</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={[styles.body, styles.centerContent]}>
        <Text style={[styles.infoTextBold, styles.textCenter]}>
          Scan this QR code to share your valuable feedback
        </Text>
        <Text style={[styles.infoText, styles.textCenter]}>
          Your insights help us deliver exceptional service
        </Text>
        <Text style={[styles.infoText, styles.textCenter]}>
          Thank you for choosing InvisiFeed!
        </Text>
        {/* QR Code */}
        <Image src="sample-qr-code-url.png" style={styles.qrCode} />
        <Text style={[styles.infoText, styles.link]}>
          https://sample-feedback-link.com
        </Text>
      </View>

      {/* Coupon Section */}
      <View style={styles.feedbackSection}>
        <Text style={styles.couponHeader}>WIN EXCLUSIVE COUPONS!</Text>
        <View style={styles.feedbackText}>
          <Text>
            Complete the feedback form to claim amazing discounts and special
            offers.
          </Text>
          <Text>Your voice helps us serve you better!</Text>
        </View>
      </View>

      {/*Disclaimer + Footer*/}

      <View style={styles.discFooter}>
        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Disclaimer: This tool is meant strictly for generating valid
            business invoices. Any misuse, such as fake invoicing or GST fraud,
            is punishable under the GST Act, 2017 and Bharatiya Nyaya Sanhita
            (BNS), 2023 (Sections 316 & 333). The user is solely responsible for
            the accuracy of GSTIN or any missing information; as per Rule 46 of
            the CGST Rules, furnishing correct invoice details is the supplier’s
            responsibility. We are not liable for any incorrect, fake, or
            missing GSTIN entered by users.{" "}
          </Text>
        </View>

        {/* Created with */}
        <Text style={styles.createdWith}>
          Created with <Text style={styles.createdWithSpan}>InvisiFeed</Text>
        </Text>
      </View>
    </Page>
  </Document>
);

Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 30,
    fontSize: 10,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  companyInfo: {
    textAlign: "center",
    marginBottom: 10,
  },
  companyName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4f46e5",
  },
  orgInfo: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  companyTagline: {
    fontSize: 14,
    color: "#6b7280",
    alignSelf: "center",
  },
  invoiceDetails: {
    marginTop: 20,
    marginBottom: 20,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  invoiceDate: {
    marginTop: 5,
    fontSize: 12,
    color: "#555",
  },
  body: {
    marginVertical: 20,
  },
  textCenter: {
    textAlign: "center",
    marginVertical: 5,
  },
  infoText: {
    fontSize: 12,
    color: "#4b5563",
  },
  infoTextBold: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  link: {
    color: "#1a56db",
    textDecoration: "underline",
    marginTop: 10,
  },
  qrCode: {
    width: 100,
    height: 100,
    marginTop: 10,
    marginBottom: 10,
  },
  feedbackSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    border: "1px solid #eaeaea",
    textAlign: "center",
  },
  couponHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f59e0b",
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 12,
    color: "#4b5563",
    display: "flex",
    gap: 4,
  },
  disclaimer: {
    marginTop: 30,
    padding: 10,
    backgroundColor: "#fff1f2",
    borderRadius: 4,
    border: "1px solid #fecdd3",
  },
  disclaimerText: {
    fontSize: 7,
    color: "#881337",
    textAlign: "center",
    lineHeight: 1.5,
  },
  createdWith: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 10,
    color: "#6b7280",
    fontStyle: "italic",
  },
  createdWithSpan: {
    color: "#4f46e5",
    fontWeight: "semibold",
  },
  discFooter: {
    position: "absolute",
    bottom: 20,
    right: 20,
    left: 20,
  },
});

ReactPDF.render(<Quixote />);
