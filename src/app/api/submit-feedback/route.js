import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import { ApiError } from "@/utils/ApiError";

export async function POST(req) {
  await dbConnect();

  const { formData, username, invoiceNumber } = req.json();

  const {
    overallSatisfaction,
    communication,
    qualityOfService,
    valueForMoney,
    likelihoodToRecommend,
    overallRating,
    customFeedback,
    suggestions,
  } = formData;

  try {
    const owner = OwnerModel.findOne({username});
    if (!owner) {
    throw new ApiError(404 , "Organisation not found");
    }
    
  } catch (error) {
    
  }
}
