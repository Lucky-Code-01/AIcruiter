import { NextResponse } from "next/server";
import interviewsessionModel from "@/models/interviewsessionModel";
import dbConnection from "@/utils/Connection";
import { generateResult } from "@/utils/LLMFunction";

export async function POST(request:Request){
    await dbConnection();
    try{
        const { sessionId, answer, currentIndex } = await request.json();

        if (
            !sessionId ||
            !answer?.trim() ||
            currentIndex === undefined ||
            currentIndex === null
            ){
            return NextResponse.json({
                message: "Interview not found",
                success: false
            },{status: 400});
        }

        const interviewSession = await interviewsessionModel.findById(sessionId);

        if(!interviewSession){
            return NextResponse.json({
                message: "Inteview session not exists",
                success: false
            },{status: 400})
        }


        const currentQuestion = interviewSession.result[currentIndex];

        const inputPrompt = `
            You are an AI interviewer.

            Evaluate the candidate's answer based on:
            - clarity
            - correctness
            - depth

            Return ONLY valid JSON:
            {
            "score": number (0-10),
            "feedback": "short and specific feedback"
            }

            Question: ${currentQuestion.question}
            Answer: ${answer}
        `;

        const aiResponse = await generateResult(inputPrompt);
        // const aiResponse = {
        //     feedback : "Good answer but lack of clearity",
        //     score: 6
        // }
        
        const { feedback, score } = aiResponse;
        const isLastQuestion = interviewSession.totalQuestion - 1 === currentIndex;
        await interviewsessionModel.updateOne({_id: sessionId},{
            $set:{
                [`result.${currentIndex}.answer`]: answer,
                [`result.${currentIndex}.score`]: score,
                [`result.${currentIndex}.feeback`]: feedback,
                currentQuestionIndex: currentIndex ,
                ...(isLastQuestion && { interviewStatus: "complete" })
            }
        });

        return NextResponse.json({
            message: "Successfully submit",
            feeback: feedback,
            score
        },{status: 200})
        
    }
    catch(error){
        console.log(error);
        return NextResponse.json({
            message: "Something went wrong",
            success: false
        },{ status: 500 })
    }
};