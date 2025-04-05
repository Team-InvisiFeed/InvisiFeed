import cloudinary from "cloudinary";
import OwnerModel from "@/model/Owner";

// Cloudinary Config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Deletes invoice PDFs older than 1 hour from Cloudinary
 * @param {string} username - The username of the owner
 * @returns {Promise<{deleted: number, errors: number}>} - Number of deleted files and errors
 */
export async function deleteOldInvoicePdfs(username) {
  try {
    // Find the owner
    const owner = await OwnerModel.findOne({ username });
    if (!owner || !owner.invoices || owner.invoices.length === 0) {
      return { deleted: 0, errors: 0 };
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let deletedCount = 0;
    let errorCount = 0;

    // Check each invoice for PDFs older than 1 hour
    for (const invoice of owner.invoices) {
      const invoiceCreatedAt = new Date(invoice.createdAt);

      // Skip if invoice is less than 1 hour old
      if (invoiceCreatedAt > oneHourAgo) {
        continue;
      }

      // Delete invoicePdfUrl if it exists and is older than 1 hour
      if (invoice.invoicePdfUrl) {
        try {
          // Extract public_id from URL
          const publicId = extractPublicIdFromUrl(invoice.invoicePdfUrl);
          if (publicId) {
            const result = await cloudinary.v2.uploader.destroy(publicId, {
              resource_type: "raw",
            });
            if (result.result === "ok" || result.result === "not found") {
              invoice.invoicePdfUrl = null;
              deletedCount++;
            }
          }
        } catch (error) {
          console.error(
            `Error deleting invoicePdfUrl for invoice ${invoice.invoiceId}:`,
            error
          );
          errorCount++;
        }
      }

      // Delete mergedPdfUrl if it exists and is older than 1 hour
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
    await owner.save();


    return { deleted: deletedCount, errors: errorCount };
  } catch (error) {
    console.error("Error in deleteOldInvoicePdfs:", error);
    return { deleted: 0, errors: 1 };
  }
}

/**
 * Extracts the public_id from a Cloudinary URL
 * @param {string} url - The Cloudinary URL
 * @returns {string|null} - The public_id or null if not found
 */
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
