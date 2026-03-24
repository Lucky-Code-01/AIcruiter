"use client"

import Card from "@/components/Card/page";
import Navbar from "@/components/Navbar/page";
import './globals.css';
import AdvancedCapabilities from "@/components/AdvanceCapability/page";
import InterviewRound from "@/components/InterviewRound/page";
import Footer from "@/components/Footer/page";
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-100 text-black py-6 px-3 sm:px-6">

      <Navbar />

      {/* Hero */}
      <section className="text-center pt-16 sm:pt-20 px-2">

        <p className="text-green-600 text-xs sm:text-sm font-medium">
          ✨ AI Powered Smart Interview Platform
        </p>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 sm:mt-6 leading-tight">
          Practice Interviews with <br />
          <span className="text-green-600 bg-green-100 px-2 sm:px-3 py-1 rounded-lg">
            AI Intelligence
          </span>
        </h1>

        <p className="text-gray-500 mt-4 sm:mt-6 max-w-xl mx-auto text-sm sm:text-base">
          Role-based mock interviews with smart follow-ups, adaptive difficulty
          and real-time performance evaluation.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 sm:mt-8">
          <button className="bg-black text-white px-6 py-3 rounded-full hover:scale-105 transition" onClick={()=>router.push('/interview')}>
            Start Interview
          </button>
          <button className="border border-gray-300 px-6 py-3 rounded-full hover:bg-gray-200 transition" onClick={()=> router.push('/interview-history')}>
            View History
          </button>
        </div>

      </section>

      <Card />
      <AdvancedCapabilities />
      <InterviewRound />
      <Footer />

    </main>
  );
}