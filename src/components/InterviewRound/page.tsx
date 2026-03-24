import Image from 'next/image'
import image1 from '../Images/confi.png'
import image2 from '../Images/tech.png'
import image3 from '../Images/HR.png'
import image4 from '../Images/img1.png'

function InterviewRound() {

    let InterviewRound = [
        {
            image: image1,
            heading: "AI Answer Evaluation",
            description: "Scores communication, technical accuracy and confidence."
        },
        {
            image: image2,
            heading: "Technical Mode",
            description: "Deep technical questioning based on selected role."
        },
        {
            image: image4,
            heading: "Confidence Detection ",
            description: "Basic tone and voic analysis insights."
        },
        {
            image: image3,
            heading: "Credits System",
            description: "Unlock premium interview and session easily."
        },
    ];

    return (
        <section className='mt-32 px-6 md:px-20'>
            {/* Heading */}
            <h2 className="text-4xl font-bold text-center">
                Multiple Interview <span className="text-green-600">Modes</span>
            </h2>

            {/* card componet */}
            <div className='grid md:grid-cols-2 gap-10 mt-16 m-auto max-w-5xl justify-items-center'>
                {
                    InterviewRound.map((data, index) => {
                        return <div className='flex items-center gap-6 bg-white p-8 rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-2 transition duration-300 ease-in-out w-full' key={index}>
                            <div className="w-20 h-20 relative">
                                <Image
                                    src={data.image}
                                    alt="AI Evaluation"
                                    fill
                                    sizes="(max-width: 768px) 96px, 128px"
                                    className="object-contain"
                                />
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold">
                                    {data.heading}
                                </h3>
                                <p className="text-gray-500 mt-2 text-sm">
                                    {data.description}
                                </p>
                            </div>
                        </div>
                    })
                }
            </div>

        </section>
    )
}

export default InterviewRound
