import dbConnection from "@/utils/Connection";
import interviewsessionModel from "@/models/interviewsessionModel";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await dbConnection();
    try {
        const { sessionId } = await request.json();
        const interviewSession = await interviewsessionModel.findById(sessionId).select("result");

        if (!interviewSession) {
            return NextResponse.json({
                message: "Interview session not found",
                success: false
            }, { status: 400 });
        }

        return NextResponse.json({
            message: "Session found successfully",
            success: true,
            sessionData: interviewSession
        }, { status: 200 })
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({
            message: "Something went wrong",
            success: false
        }, { status: 500 })
    }
}