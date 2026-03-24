// FIRST FUNCTION :- text to resume
import Groq from 'groq-sdk';

const groq = new Groq({apiKey: process.env.GROQ_API_KEY});


async function getResume(inputData:string){
    try{
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an AI resume analyzer.
                    Extract ONLY the following information from the resume text:

                    1. role (candidate's primary job role)
                    2. experience (total years of experience as a number)
                    3. skills (array of skills)
                    4. projects (array of project titles only)

                    Return ONLY valid JSON.
                    Do NOT add explanation.
                    Do NOT add markdown.
                    Do NOT add backticks.

                    JSON format:

                    {
                    "role": "",
                    "experience": "",
                    "skills": [],
                    "projects": []
                    }
`
                },
                {
                    role: 'user',
                    content: inputData
                }
            ],
            model: process.env.GROQ_AIMODEL!,
            temperature: 0.6
        });

        const rawText = response.choices[0]?.message?.content;
        if(!rawText){
            throw new Error("No response from AI");
        }
        const parsedData = JSON.parse(rawText.trim());
        return parsedData;

    }
    catch(error){
        console.log(error);
        throw new Error("Something went wrong!!");
    }
}

async function generateQuestion(inputPrompt:string){
    try{
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: "You are an AI interviewer."
                },
                {
                    role: 'user',
                    content: inputPrompt
                }
            ],
            model: process.env.GROQ_AIMODEL!,
            temperature: 0.6
        });
        const rawText = response.choices[0]?.message.content;
        if(!rawText){
            throw new Error("No response from AI");
        };

        const cleanText = rawText.replace(/```json|```/g, "").trim();
        const questions = JSON.parse(cleanText);
        return questions;
    }
    catch(error){
        console.log(error);
        throw new Error("Something went wrong!!");
    }
}

async function generateResult(inputPrompt:string){
    try{
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: "You are an AI interviewer."
                },
                {
                    role: 'user',
                    content: inputPrompt
                }
            ],
            model: process.env.GROQ_AIMODEL!,
            temperature: 0.6
        });

        const rawText = response.choices[0]?.message.content;
        console.log(rawText);
        if(!rawText){
            throw new Error("No response from AI");
        }

        const cleanResponse = JSON.parse(rawText);
        return cleanResponse;
    }   
    catch(error){
        console.log(error);
        throw new Error("Something went wrong!!");
    }
}

export {
    getResume,
    generateQuestion,
    generateResult
}