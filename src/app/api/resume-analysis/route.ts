import { getResume } from "@/utils/LLMFunction";
import { NextResponse } from "next/server";
import { extractText } from 'unpdf';

export async function POST(request:Request){
    try{
        const fileData = await request.formData();
        const file = fileData.get("resume") as File;
        if(!file){
            return NextResponse.json({
                success: false,
                message: "No resume uploaded!!"
            },{status:400})
        };
        
        // convert the file into object buffer
        const buffer = await file.arrayBuffer();
        const { text } = await extractText(buffer);
        if(!text){
            return NextResponse.json({
                success: false,
                message: "Unable to extract text from file!!"
            },{ status: 400 });
        }

        const finalText = text.join('');
        const resumeData = await getResume(finalText);

        // console.log(text);
        return NextResponse.json({
            message: "Resume parsed by ai",
            success: true,
            data: resumeData
        },{status: 200})

    }
    catch(error){
        console.log(`Error generate ai response ${error}`);
        return NextResponse.json({
            message: 'Something went wrong to generate ai response',
            success: 400
        },{status: 400})
    }
};