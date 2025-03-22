import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import { ApiError } from "@/utils/ApiError";

export async function POST(req) {
  await dbConnect();

  const { username, invoiceNumber } = await req.json();

  const decodedUsername = decodeURIComponent(username);
  console.log(decodedUsername);

  const decodedInvoiceNumber = decodeURIComponent(invoiceNumber);
  console.log(decodedInvoiceNumber);

  try {
    const owner = await OwnerModel.findOne({ username: decodedUsername });
    console.log("owner dekh : ", owner);

    if (!owner) {
      return Response.json(
        { message: "Invoice Provider not found" },
        { status: 404 }
      );
    }

    const invoiceId = await owner.invoiceIds.some(
      (id) => id === decodedInvoiceNumber
    );
    console.log(invoiceId);

    if (invoiceId === false) {
      console.log("Invoice galat");
      return Response.json(
        { message: "Invoice Number invalid" },
        { status: 404 }
      );
    }

    return Response.json(
      { message: "Invoice Number and Username verified" },
      { status: 201 }
    );
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
