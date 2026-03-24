import { NextResponse } from "next/server";
import dbConnection from "@/utils/Connection";
import interviewsetupModel from "@/models/interviewsetupModel";
import interviewsessionModel from "@/models/interviewsessionModel";
import { generateQuestion } from "@/utils/LLMFunction";

export async function POST(request: Request) {
  await dbConnection();

  try {
    const { interviewId, userId } = await request.json();

    if (!interviewId || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "InterviewId and UserId are required",
        },
        { status: 400 }
      );
    }

    const interview = await interviewsetupModel.findById(interviewId);

    if (!interview) {
      return NextResponse.json(
        {
          success: false,
          message: "Interview not found",
        },
        { status: 404 }
      );
    }

    let session = await interviewsessionModel.findOne({
      interviewId,
      userId,
    });


    if (!session) {
      const { role, experience, interviewType, skills, projects } = interview;

      const inputPrompt = `
        You are an AI interviewer.

        Generate 5 ${interviewType} interview questions.

        Role: ${role}
        Experience: ${experience}
        Skills: ${skills?.join(", ") || "Not provided"}
        Projects: ${projects?.join(", ") || "Not provided"}

        Return ONLY JSON array:
        [
        "Question 1",
        "Question 2",
        "Question 3",
        "Question 4",
        "Question 5"
        ]
        `;

      const questions = await generateQuestion(inputPrompt);
      // const questions = [
      //   "How are you",
      //   "I hope you are fine",
      //   "How was doing",
      //   "What is your hobies",
      //   "What is your color"
      // ]

      const formattedResult = questions.map((q: string) => ({
        question: q,
        answer: "",
        score: 0,
        feedback: "", 
      }));

      try {
        session = await interviewsessionModel.create({
          userId,
          interviewId,
          result: formattedResult,
          totalQuestion: formattedResult.length,
          currentQuestionIndex: 0,
        });
      } catch (error: any) {
        session = await interviewsessionModel.findOne({
          interviewId,
          userId,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        sessionId: session._id,
        interviewQuestion: session.result,
        totalQuestion: session.totalQuestion,
        currentQuestionIndex: session.currentQuestionIndex,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Interview Question Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}