import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";

export async function POST(req) {
  await dbConnect();

  const { username, updates } = await req.json();

  const decodedUsername = decodeURIComponent(username);

  try {
    // Handle nested address fields
    let updateQuery = {};
    
    // If the update field contains a dot (.), it's a nested field
    if (Object.keys(updates)[0].includes('.')) {
      const [parentField, childField] = Object.keys(updates)[0].split('.');
      updateQuery = {
        [`${parentField}.${childField}`]: updates[Object.keys(updates)[0]]
      };
    } else {
      // Handle top-level fields
      updateQuery = updates;
    }

    // Update the existing owner document
    const updatedOwner = await OwnerModel.findOneAndUpdate(
      { username: decodedUsername },
      { $set: updateQuery },
      { new: true }
    );

    if (!updatedOwner) {
      return Response.json({ message: "Owner not found" }, { status: 404 });
    }

    return Response.json(
      { 
        message: "Profile updated successfully", 
        data: updatedOwner 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json(
      { 
        message: "Failed to update profile", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}
