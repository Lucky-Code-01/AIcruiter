import UserModel from "@/models/userModel";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/option";
import { getServerSession } from "next-auth";
import dbConnection from "@/utils/Connection";

export async function GET(req: Request) {
    try {
        await dbConnection();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({
                message: "Unauthorized! Please login first.",
                success: false
            }, { status: 401 });
        };

        const userId = session?.user._id;

        const exitsUser = await UserModel.findById(userId);

        if (!exitsUser) {
            return NextResponse.json(
                { message: "User not found in database", success: false },
                { status: 404 }
            );
        };

        return NextResponse.json({
            success: true,
            credit: exitsUser.credit,
        }, { status: 200 });

    }
    catch (error: any) {
        console.error(" Error fetching session/credits:", error?.message || error);
        return NextResponse.json(
            { message: "Internal Server Error", success: false },
            { status: 500 }
        );
    }
}