"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import '@/app/globals.css'
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { APIResponse } from "@/utils/APIResponse";
import { useSession } from "next-auth/react";

function Page() {
  const router = useRouter();
  const { data:session, status } = useSession();
  const user = session?.user;
  const userId = user?._id;

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchHistory() {
    try {
      setLoading(true);

      const response = await axios.post('/api/history-data', {
        userId
      });

      const result = response.data;

      if (result.success) {
        setHistory(result.data);
      }

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
    if(status === "loading") return;
    if(!userId) return;
    fetchHistory();
  }, [userId,status]);

  return (
    <div className="w-full h-screen bg-gray-100 p-4 flex flex-col overflow-hidden">
      
      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto flex flex-col h-full">

        {/* Header */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full border shadow cursor-pointer"
          >
            <ArrowLeftIcon />
          </div>

          <div>
            <h1 className="text-lg sm:text-2xl font-bold">
              Interview History
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Track your past interview and performance report
            </p>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="mt-6 flex-1 overflow-hidden">
          
          <div className="w-full h-full rounded-2xl shadow p-4 overflow-y-auto space-y-4 scrollbar-hide">
            
            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center h-[60vh]">
                <p className="text-gray-500 animate-pulse">
                  Loading analytics...
                </p>
              </div>
            )}

            {/* Empty */}
            {!loading && history.length === 0 && (
              <p className="text-center text-gray-500">
                No interviews found
              </p>
            )}

            {/* Real Data Mapping */}
            {history.map((item, index) => (
              
              <div
                key={index}
                onClick={() => router.push(`/interview-dashboard/${item.sessionId}`)}
                className="w-full p-4 bg-white shadow border rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:shadow-md transition"
              >

                {/* LEFT */}
                <div className="space-y-1">
                  <h1 className="font-medium text-sm sm:text-base">
                    {item.role}
                  </h1>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Interview Mode:
                    <span className="font-medium"> {item.mode}</span>
                  </p>

                  <span className="text-xs sm:text-sm text-gray-400">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                {/* RIGHT */}
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  
                  <div className="text-left sm:text-right">
                    <p className="text-emerald-500 font-semibold text-base sm:text-lg">
                      {item.score}/10
                    </p>
                    <span className="text-xs sm:text-sm text-gray-500">
                      Overall Score
                    </span>
                  </div>

                  <p
                    className={`text-xs sm:text-sm rounded-lg py-1 px-3 font-semibold ${
                      item.status === "complete"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {item.status}
                  </p>

                </div>

              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}

export default Page;