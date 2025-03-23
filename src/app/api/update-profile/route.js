import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";

export async function POST(req) {
  await dbConnect();

  const { username, updates } = await req.json();

  const decodedUsername = decodeURIComponent(username);

  try {
    // Update the existing owner document without replacing it
    const updatedOwner = await OwnerModel.findOneAndUpdate(
      { username: decodedUsername }, // Match condition
      { $set: updates }, // Update only the fields provided in `updates`
      { new: true } // Return the updated document
    );

    if (!updatedOwner) {
      return Response.json({ message: "Owner not found" }, { status: 404 });
    }

    return Response.json(
      { message: "Owner updated successfully", updatedOwner },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
