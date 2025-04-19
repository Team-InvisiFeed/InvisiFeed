import cloudinary from "cloudinary";
import OwnerModel from "@/models/Owner";
import InvoiceModel from "@/models/Invoice";

// Cloudinary Config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function deleteOldInvoicePdfs(username) {
  try {
    // Find the owner
    const owner = await OwnerModel.findOne({ username });
    const invoices = await InvoiceModel.find({
      owner: owner._id
    })
    if (!invoices || !invoices.length === 0) {
      return { deleted: 0, errors: 0 };
    }

    const fifteenMinuteAgo = new Date(Date.now() - 15 * 60 * 1000);
    let deletedCount = 0;
    let errorCount = 0;

    // Check each invoice for PDFs older than 1 hour
    for (const invoice of invoices) {
      const invoiceCreatedAt = new Date(invoice.createdAt);

      // Skip if invoice is less than 15 minutes old
      if (invoiceCreatedAt > fifteenMinuteAgo) {
        continue;
      }

      // Delete mergedPdfUrl if it exists and is older than 15 minutes
      if (invoice.mergedPdfUrl) {
        try {
          // Extract public_id from URL
          const publicId = extractPublicIdFromUrl(invoice.mergedPdfUrl);
          if (publicId) {
            const result = await cloudinary.v2.uploader.destroy(publicId, {
              resource_type: "raw",
            });
            if (result.result === "ok" || result.result === "not found") {
              invoice.mergedPdfUrl = null;
              await invoice.save()
              deletedCount++;
            }
          }
        } catch (error) {
          console.error(
            `Error deleting mergedPdfUrl for invoice ${invoice.invoiceId}:`,
            error
          );
          errorCount++;
        }
      }
    }
   


    return { deleted: deletedCount, errors: errorCount };
  } catch (error) {
    console.error("Error in deleteOldInvoicePdfs:", error);
    return { deleted: 0, errors: 1 };
  }
}

function extractPublicIdFromUrl(url) {
  try {
    const parts = url.split("/");
    if (parts.length < 6) return null;

    const resourceTypeIndex = parts.findIndex((part) =>
      ["raw", "image", "video", "audio"].includes(part)
    );

    if (resourceTypeIndex === -1 || parts[resourceTypeIndex + 1] !== "upload")
      return null;

    // Get everything after 'upload' and version
    const publicIdParts = parts.slice(resourceTypeIndex + 3);

    return publicIdParts.join("/");
  } catch (error) {
    console.error("Error extracting public_id from URL:", error);
    return null;
  }
}
