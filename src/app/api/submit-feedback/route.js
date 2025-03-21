import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import { ApiError } from "@/utils/ApiError";

export async function POST(req) {
  await dbConnect();

  const { formData, username, invoiceNumber } = await req.json();

  console.log(formData);

  const decodedUsername = decodeURIComponent(username);
  // console.log(decodedUsername);

  const decodedInvoiceNumber = decodeURIComponent(invoiceNumber);
  // console.log(decodedInvoiceNumber);

  try {
    const owner = await OwnerModel.findOne({ username: decodedUsername });
    console.log("owner dekh : ", owner);

    if (!owner) {
      throw new ApiError(404, "Organisation not found");
    }

    owner.feedbacks.push(formData);
    
    await owner.save();

    const invoiceId = await owner.invoiceIds.some(
      (id) => id === decodedInvoiceNumber
    );    
    console.log(invoiceId);
    

    if (invoiceId) {
      await OwnerModel.updateOne(
        { _id: owner._id },
        { $pull: { invoiceIds: decodedInvoiceNumber } }
      );
    }

    return Response.json(
      { message: "Feedback added successfully" },
      { status: 201 }
    );
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
