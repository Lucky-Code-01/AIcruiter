import { NextResponse } from "next/server";
import dbConnection from "@/utils/Connection";
import interviewsetupModel from "@/models/interviewsetupModel";
import mongoose from 'mongoose';

export async function POST(request: Request) {
    await dbConnection();

    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "UserId is required" },
                { status: 400 }
            );
        };

        const response = await interviewsetupModel.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                }
            },

            {
                $lookup: {
                    from: 'interviewsessionschemas',
                    localField: '_id',
                    foreignField: 'interviewId',
                    as: "session"
                }
            },

            {
                $unwind: {
                    path: "$session",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $addFields: {
                    avgScore: {
                        $cond: {
                            if: {
                                $gt: [
                                    { $size: { $ifNull: ["$session.result", []] } },
                                    0
                                ]
                            },
                            then: {
                                $avg: "$session.result.score"
                            },
                            else: 0
                        },
                    },
                },
            },

            {
                $project: {
                    role: 1,
                    mode: "$interviewType",
                    score: { $round: ["$avgScore", 1] },
                    status: {
                        $ifNull: ["$session.interviewStatus", "not-started"]
                    },
                    sessionId: "$session._id",
                    createdAt: "$session.createdAt"
                },
            },

            {
                $sort: {
                    createdAt: -1
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error("History API Error:", error);

        return NextResponse.json(
            { success: false, message: "Server Error" },
            { status: 500 }
        );
    }
}