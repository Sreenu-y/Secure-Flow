import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "./mongoose";
import User from "@/models/User";

export const checkUser = async () => {
  const user = await currentUser();

  // If no user is logged in via Clerk, return null
  if (!user) return null;

  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Check if user already exists in MongoDB
    const loggedInUser = await User.findOne({ clerkId: user.id });

    if (loggedInUser) {
      return loggedInUser;
    }

    // If user doesn't exist, create them
    const newUser = await User.create({
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    });

    return newUser;
  } catch (error) {
    console.log("Error in CheckUser: ", error.message);
  }
};
