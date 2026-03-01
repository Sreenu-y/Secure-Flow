import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Prediction from "@/models/Prediction";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get date 7 days ago at midnight
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Aggregate predictions over the last 7 days per user
    const aggregationPipeline = [
      {
        $match: {
          clerkUserId: userId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          requests: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort chronologically
      },
    ];

    const aggregatedData = await Prediction.aggregate(aggregationPipeline);

    // Create a map of existing data for fast lookup
    const dataMap = aggregatedData.reduce((acc, curr) => {
      acc[curr._id] = curr.requests;
      return acc;
    }, {});

    // Ensure we send back an array of exactly 7 items (last 7 days), filling 0s for missing days
    const result = [];
    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
    });

    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);

      // YYYY-MM-DD format for lookup
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const lookupKey = `${year}-${month}-${day}`;

      // Formatted date for chart (e.g., "Feb 23")
      const formattedDate = formatter.format(d);

      result.push({
        date: formattedDate,
        requests: dataMap[lookupKey] || 0,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching usage data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
