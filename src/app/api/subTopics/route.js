import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { addSubtopic, addTopics } from "@/action/resources";
import Resource from "@/models/Resouces";

await dbConnect();

export async function POST(req) {
  try {
    const data = await req.json();
    const response = await addSubtopic(data);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Internal server error", success: false },
      { status: 500 }
    );
  }
}

// ✅ GET Request: Fetch All Resources
export async function GET() {
  try {
    const resources = await Resource.find();
    return NextResponse.json(
      { success: true, data: resources },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch resources", success: false },
      { status: 500 }
    );
  }
}
