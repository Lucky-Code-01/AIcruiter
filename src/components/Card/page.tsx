import { Mic, Clock, Briefcase } from "lucide-react";
function Card() {
  return (
    <>
      {/* Cards Section */}
      <section className="flex flex-col md:flex-row justify-center items-center gap-10 mt-28 px-10">

        {/* Card 1 */}
        <div className="relative bg-white w-80 p-8 rounded-2xl shadow-lg text-center transform -rotate-3 hover:rotate-0 transition duration-300 hover:border-emerald-600 border-2 ">
          
          {/* Floating Icon */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white p-4 rounded-xl shadow-md border-2 border-green-500 ">
            <Briefcase className="text-green-600" />
          </div>

          <p className="text-green-600 text-xs font-semibold mt-6">STEP 1</p>
          <h3 className="text-lg font-semibold mt-2">
            Role & Experience Selection
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            AI adjusts difficulty based on selected job role.
          </p>
        </div>

        {/* Card 2 */}
        <div className="relative bg-white w-80 p-8 rounded-2xl shadow-xl text-center transform rotate-2 hover:rotate-0 transition duration-300 hover:border-emerald-600 border-2 ">
          
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white p-4 rounded-xl shadow-md border-2 border-green-500">
            <Mic className="text-green-600" />
          </div>

          <p className="text-green-600 text-xs font-semibold mt-6">STEP 2</p>
          <h3 className="text-lg font-semibold mt-2">
            Smart Voice Interview
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            Dynamic follow-up questions based on your answers.
          </p>
        </div>

        {/* Card 3 */}
        <div className="relative bg-white w-80 p-8 rounded-2xl shadow-lg text-center transform -rotate-2 hover:rotate-0 transition duration-300 hover:border-emerald-600 border-2 ">
          
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white p-4 rounded-xl shadow-md border-2 border-green-500">
            <Clock className="text-green-600" />
          </div>

          <p className="text-green-600 text-xs font-semibold mt-6">STEP 3</p>
          <h3 className="text-lg font-semibold mt-2">
            Timer Based Simulation
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            Real interview pressure with time tracking.
          </p>
        </div>

      </section>

    </>
  )
}

export default Card
