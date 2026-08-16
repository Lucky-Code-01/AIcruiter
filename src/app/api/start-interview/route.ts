import { NextResponse } from "next/server";
import interviewsetupModel from "@/models/interviewsetupModel";
import dbConnection from "@/utils/Connection";
import UserModel from "@/models/userModel";

export async function POST(request: Request) {
    await dbConnection();

    try {
        const form = await request.json();

        if (!form || !form.userId) {
            return NextResponse.json(
                { message: "Form data or userId missing", success: false },
                { status: 400 }
            );
        }

        const { role, experience, interviewType, skills, projects, userId } = form;

        const existUser = await UserModel.findById(userId);

        if (!existUser) {
            return NextResponse.json(
                { message: "User not found!", success: false },
                { status: 404 }
            );
        }

        if (existUser.credit < 50) {
            return NextResponse.json(
                {
                    message: "Insufficient credits! Minimum 50 credits required to start interview.",
                    success: false,
                },
                { status: 403 }
            );
        }

        const interview = await interviewsetupModel.create({
            userId,
            role,
            experience,
            interviewType,
            skills,
            projects,
        });

        // STEP 3: Deduct 50 credits atomically
        await UserModel.updateOne(
            { _id: userId },
            { $inc: { credit: -50 } }
        );

        return NextResponse.json(
            {
                message: "Interview created successfully",
                success: true,
                interviewId: interview?._id,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error(`Error generating interview: ${error?.message || error}`);
        return NextResponse.json(
            { message: "Something went wrong", success: false },
            { status: 500 }
        );
    }
}