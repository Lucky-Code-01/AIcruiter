import { NextResponse } from "next/server";
import interviewsetupModel from "@/models/interviewsetupModel";
import dbConnection from "@/utils/Connection";


export async function POST(request:Request){
    await dbConnection();
    try{
        const form  = await request.json();
        if(!form){
            return NextResponse.json({
            message: 'Form data does not recivie',
            success: false
            },{status: 400})
        }

        const { role, experience, interviewType, skills, projects, userId } = form;
        
        const interview = await interviewsetupModel.create({
            userId,
            role,
            experience,
            interviewType,
            skills,
            projects,
        });

        return NextResponse.json({
            message: "Interview created successfully",
            success: true,
            interviewId: interview?._id
        },{status: 201});

    }
    catch(error){
        console.log(`Error generate ${error}`);
        return NextResponse.json({
            message: 'Something went wrong',
            success: 400
        },{status: 400})
    }
}