"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import "@/app/globals.css";
import {
  XAxis,
  YAxis,
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { APIResponse } from "@/utils/APIResponse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Page() {
  const params = useParams();
  const sessionId = params?.sessionId;
  const router = useRouter();

  const [result, setResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchInterview() {
    try {
      setLoading(true);

      const response = await axios.post("/api/dashboard-data", {
        sessionId,
      });

      const data = response.data.sessionData;
      setResult(data.result);
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      toast.error(
        axiosError.response?.data.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (sessionId) fetchInterview();
  }, [sessionId]);

  // Derived Data
  const maxScore = 10;

  const overallScore =
    result.length > 0
      ? (
        result.reduce((acc, curr) => acc + (curr.score || 0), 0) /
        result.length
      ).toFixed(1)
      : 0;

  // Trend Data
  const trendData = result.map((item, index) => ({
    name: `Q${index + 1}`,
    score: item.score || 0,
  }));

  // Pie Data
  const pieData = [
    { name: "score", value: Number(overallScore) },
    { name: "rest", value: 10 - Number(overallScore) },
  ];

  const COLORS = ["#10b981", "#e5e7eb"];

  const avgScore =
    result.length > 0
      ? result.reduce((acc, curr) => acc + (curr.score || 0), 0) /
      result.length
      : 0;

  const avgAnswerLength =
    result.length > 0
      ? result.reduce((acc, curr) => acc + (curr.answer?.length || 0), 0) /
      result.length
      : 0;

  // normalize answer length (max assume 200 chars)
  const communicationScore = Math.min((avgAnswerLength / 200) * 10, 10);

  const skills = [
    { name: "Confidence", value: avgScore },
    { name: "Communication", value: communicationScore },
    { name: "Correctness", value: avgScore },
  ];


  // function for downloading pdf report
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // 🎯 Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129);
    doc.text("AI Interview Performance Report", 105, 20, { align: "center" });

    doc.setDrawColor(16, 185, 129);
    doc.line(20, 25, 190, 25);

    // 🎯 Score
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(20, 35, 170, 15, 3, 3, "F");

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Final Score: ${overallScore}/10`, 105, 45, { align: "center" });

    // 🎯 Skills
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(20, 55, 170, 25, 3, 3, "F");

    doc.setFontSize(11);
    doc.text(`Confidence: ${avgScore.toFixed(1)}`, 25, 65);
    doc.text(`Communication: ${communicationScore.toFixed(1)}`, 25, 72);
    doc.text(`Correctness: ${avgScore.toFixed(1)}`, 25, 79);

    // 🎯 Advice (dynamic)
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(20, 90, 170, 30, 3, 3);

    doc.setFont("helvetica", "bold");
    doc.text("Professional Advice", 25, 100);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const advice =
      Number(overallScore) > 7
        ? "Great performance. Keep refining your answers."
        : Number(overallScore) > 4
          ? "Good effort. Improve clarity and structure."
          : "Significant improvement required. Practice more.";

    const splitAdvice = doc.splitTextToSize(advice, 160);
    doc.text(splitAdvice, 25, 107);

    // 🎯 Table Data
    const tableData = result.map((q, i) => [
      i + 1,
      q.question,
      `${q.score || 0}/10`,
      q.feeback || "You didn't answer this question",
    ]);

    // 🎯 Table
    autoTable(doc, {
      startY: 130,
      head: [["#", "Question", "Score", "Feedback"]],
      body: tableData,

      styles: {
        fontSize: 9,
        cellPadding: 3,
      },

      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
      },

      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 70 },
        2: { cellWidth: 20 },
        3: { cellWidth: 80 },
      },
    });

    doc.save("Interview_Report.pdf");
  };

  return (
    <div className="w-full min-h-screen flex flex-col p-4 bg-gray-100">

      {/* Navbar */}
      <div className="w-full flex justify-between items-center py-4 px-3">
        <div className="flex items-center gap-3">
          <div
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full border shadow cursor-pointer"
          >
            <ArrowLeftIcon />
          </div>

          <h1 className="text-lg sm:text-2xl font-bold">
            Interview Analytics
          </h1>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="bg-emerald-500 text-white font-semibold py-1 px-2 rounded transition-all duration-300 ease-in-out hover:bg-emerald-700"
        >
          Download
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-gray-500 animate-pulse">
            Loading analytics...
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT */}
          <div className="w-full lg:w-[350px] flex flex-col gap-6">

            {/* Overall */}
            <div className="bg-white p-6 rounded-2xl shadow text-center">
              <h2 className="text-sm text-gray-500">
                Overall Performance
              </h2>

              <div className="relative w-36 h-36 mx-auto mt-4">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={40}
                      outerRadius={60}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">
                  {overallScore}
                </div>
              </div>
              <span className="text-xs sm:text-sm text-gray-500">Out of 10</span>
              <h1 className="font-semibold mt-2 text-sm sm:text-base text-center">
                Significant improvement required.
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm text-center">
                Work on clarity and confidence.
              </p>
            </div>
            {/* Skill Evaluation */}
            <div className="rounded-2xl shadow border p-4 sm:p-6 bg-white">
              <h1 className="text-sm text-gray-600 font-semibold mb-4">
                Skill Evaluation
              </h1>

              {skills.map((skill, index) => (
                <div key={index} className="mb-4">

                  <div className="flex justify-between text-sm mb-1">
                    <span>{skill.name}</span>
                    <span className="text-emerald-600 font-semibold">
                      {skill.value.toFixed(1)}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(skill.value / 10) * 100}%` }}
                    />
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Trend Chart */}
            <div className="bg-white p-6 rounded-2xl shadow h-[250px]">
              <h2 className="text-sm text-gray-500 mb-3">
                Performance Trend
              </h2>

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    fill="url(#colorScore)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Questions */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-sm text-gray-500 mb-4">
                Question Breakdown
              </h2>

              <div className="space-y-4 max-h-[400px] overflow-y-auto  scrollbar-hide">
                {result.map((q, index) => (
                  <div key={q._id} className="border p-4 rounded-lg">

                    <div className="flex justify-between text-sm font-medium">
                      <span>Question {index + 1}</span>
                      <span>
                        Score: {q.score}/{maxScore}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mt-2">
                      {q.question}
                    </p>

                    <div className="mt-3 text-sm bg-emerald-50 p-2 rounded border text-emerald-700">
                      <b>Feedback:</b> {q.feeback || "You didn't answer this question"}
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Page;