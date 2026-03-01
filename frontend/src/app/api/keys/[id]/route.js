import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import ApiKey from "@/models/ApiKey";

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    await connectToDatabase();

    // Ensure the user only deletes their own key
    const deletedKey = await ApiKey.findOneAndDelete({
      _id: id,
      clerkUserId: userId,
    });

    if (!deletedKey) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json({ message: "API key revoked successfully" });
  } catch (error) {
    console.error("[KEYS_DELETE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
