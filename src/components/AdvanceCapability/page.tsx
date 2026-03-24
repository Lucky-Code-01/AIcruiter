import Image from "next/image";
import image1 from '../Images/ai-ans.png';
import image2 from '../Images/history.png';
import image3 from '../Images/resume.png';
import image4 from '../Images/pdf.png'
export default function AdvancedCapabilities() {

  let AICapability = [
    {
      image: image1,
      heading: "AI Answer Evaluation",
      description: "Scores communication, technical accuracy and confidence."
    },
    {
      image: image2,
      heading: "History & Analytics",
      description: "Track progress with performance graphs and topic analysis."
    },
    {
      image: image3,
      heading: "Resume Based Interview",
      description: "Project-specific questions based on uploaded resume."
    },
    {
      image: image4,
      heading: "Downloadable PDF Report",
      description: "Detailed strengths, weaknesses and improvement insights."
    },
  ];


  return (
    <section className="mt-20 sm:mt-32 px-4 sm:px-10 md:px-20">

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
        Advanced AI <span className="text-green-600">Capabilities</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mt-10 sm:mt-16 max-w-5xl mx-auto">

        {AICapability.map((data, index) => (

          <div
            key={index}
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition"
          >

            {/* Image */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 relative shrink-0">
              <Image
                src={data.image}
                alt={data.heading}
                fill
                sizes="(max-width: 768px) 96px, 128px"
                className="object-contain"
              />
            </div>

            {/* Content */}
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold">
                {data.heading}
              </h3>

              <p className="text-gray-500 mt-2 text-xs sm:text-sm">
                {data.description}
              </p>
            </div>

          </div>

        ))}

      </div>
    </section>
  );
}