import { NextResponse } from "next/server";
import connect from "@/utils/dbConnect";
import Team from "@/models/Team";

export async function POST(req) {
  try {
    await connect();

    const { userId, designation, group } = await req.json();

    if (!userId || !designation || !group) {
      return NextResponse.json(
        { success: false, type: "error", message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if member already exists
    const existingMember = await Team.findOne({ user: userId });
    if (existingMember) {
      return NextResponse.json(
        { success: false, type: "error", message: "Team member already exists" },
        { status: 409 } // Conflict
      );
    }

    // Add new member
    await Team.create({
      user: userId,
      designation,
      group,
    });

    return NextResponse.json(
      {
        success: true,
        type: "success",
        message: "Team member added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, type: "error", message: error.message },
      { status: 500 }
    );
  }
}
