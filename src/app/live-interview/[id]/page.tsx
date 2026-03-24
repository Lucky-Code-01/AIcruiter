"use client";
import { APIResponse } from "@/utils/APIResponse";
import axios, { AxiosError } from "axios";
import { Mic, MicOff } from "lucide-react"; // MicOff add kiya hai
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function LiveInterview() {
  const { id } = useParams();
  const router = useRouter();

  type questionTypes = {
    question: string;
    answer: string;
    score: string;
    feeback: string;
  };

  const [answer, setAnswer] = useState("");
  const [currentIndex, setcurrentIndex] = useState(0);
  const [sessionId, setsessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<questionTypes[]>([]);
  const [counter, setCounter] = useState(60); // Default timer
  const [maxQuestion, setmaxQuestion] = useState(0);
  const hasFetched = useRef(false);
  const [isTimeout, setisTimeout] = useState(false);
  const [shouldSpeak, setShouldSpeak] = useState(false);

  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const Timer = 60;

  // --- Speech Recognition Setup ---
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Bolna jari rakhne ke liye
      recognitionRef.current.interimResults = true; // Live text dikhane ke liye
      recognitionRef.current.lang = "en-US"; // Language setup

      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswer(transcript); // Textarea mein text set karega
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech error:", event.error);

        if (event.error === 'audio-capture') {
          toast.error("Microphone nahi mil raha. Check karein ki mic plugged in hai ya nahi.");
        } else if (event.error === 'not-allowed') {
          toast.error("Microphone permission blocked hai. Browser settings se allow karein.");
        } else {
          toast.error("Speech Recognition mein error: " + event.error);
        }

        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.error("Browser does not support Speech Recognition");
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (isSpeaking) {
        toast.error("Please wait for AI to finish speaking");
        return;
      }
      setAnswer(""); // Naya answer shuru karne ke liye clear (optional)
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };
  // --------------------------------

  async function fetchQuestion() {
    setLoading(true);
    try {
      const response = await axios.post("/api/interview-question", {
        interviewId: id,
        userId: "69bd35cbd7fb2f3b91fc9c5a",
      });
      const data = response.data;
      setResult(data.interviewQuestion);
      setmaxQuestion(data.totalQuestion);
      setsessionId(data.sessionId);
      setcurrentIndex(data.currentQuestionIndex || 0);
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      toast.error(
        axiosError.response?.data.message || "Something went wrong to get AI Response"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchQuestion();
  }, []);

  useEffect(() => {
    const currentQ = result[currentIndex];
    if (!currentQ || currentQ.answer) return;

    setisTimeout(false);
    setCounter(Timer);
    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setisTimeout(true);
          recognitionRef.current?.stop(); // Timer khatam toh mic band
          toast.error("Time's up! Moving to next question...");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, result]);

  const handleSubmit = async () => {
    // Answer submit karte hi mic band kar do
    recognitionRef.current?.stop();
    setIsListening(false);

    const currentQ = result[currentIndex];

    if (currentQ?.answer || isTimeout) {
      setAnswer("");
      setcurrentIndex((prev) => {
        if (prev >= maxQuestion - 1) return prev;
        setShouldSpeak(true);
        return prev + 1;
      });
      if (currentIndex === maxQuestion - 1) {
        router.push(`/interview-dashboard/${sessionId}`);
      }
      return;
    }

    if (!answer.trim()) {
      toast.error("Please write an answer first");
      return;
    }

    try {
      const response = await axios.post("/api/interview-answer", {
        answer,
        sessionId,
        currentIndex,
      });

      const data = response.data;
      setResult((prev) => {
        const updated = [...prev];
        updated[currentIndex].answer = answer;
        updated[currentIndex].feeback = data.feeback;
        updated[currentIndex].score = data.score;
        return updated;
      });

      setAnswer("");
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      toast.error(
        axiosError.response?.data.message || "Something went wrong to get AI Response"
      );
    }
  };

  const speakQuestion = (text: string) => {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);

    speech.onstart = () => {
      setIsSpeaking(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0; // start from beginning
        videoRef.current.play().catch(() => {
          console.log("Video autoplay blocked");
        });
      }
      recognitionRef.current?.stop(); // AI bolte waqt mic band
    };

    speech.onend = () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0; // reset (optional)
      }
      setIsSpeaking(false);
      // AI bolne ke baad mic auto-start nahi hoga (aapke logic ke mutabik user click karega)
    };

    window.speechSynthesis.speak(speech);
  };

  useEffect(() => {
    if (!result.length) return;
    const currentQ = result[currentIndex];
    if (!currentQ?.answer) {
      setShouldSpeak(true);
    }
  }, [result, currentIndex]);

  useEffect(() => {
    const question = result[currentIndex]?.question;
    if (!question || !shouldSpeak) return;
    speakQuestion(question);
    setShouldSpeak(false);
  }, [currentIndex, result, shouldSpeak]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-gray-500 animate-pulse">Loading analytics...</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row bg-white w-full max-w-6xl md:h-162.5 rounded-lg shadow-lg overflow-hidden">
          {/* left div */}
          <div className=" md:w-97.5 flex flex-col p-4 md:p-6 space-y-4">
            <div className="w-full h-48 md:h-56">
              <video
                ref={videoRef}
                className="w-full h-full rounded-xl mb-4 object-cover border shadow"
                poster="/Video/femalethumbnail.png"
              >
                <source src="/Video/female-ai.mp4" type="video/mp4" />
              </video>
            </div>

            <div className="bg-gray-100 p-3 text-sm text-center font-medium text-gray-700 shadow rounded-xl border">
              {result[currentIndex]?.question}
            </div>

            <div className="shadow rounded-2xl py-6 px-4 border">
              <div className="flex items-center justify-between text-sm font-medium border-b pb-2">
                <span className="text-gray-500">Interview Status</span>
                <span className={isSpeaking ? "text-blue-600 animate-pulse" : "text-emerald-600"}>
                  {isSpeaking ? "AI Speaking..." : isListening ? "Listening..." : "Waiting..."}
                </span>
              </div>

              <div className="w-20 h-20 flex items-center justify-center border-4 border-green-500 rounded-full text-xl font-semibold mt-8 m-auto">
                {counter}s
              </div>

              <div className="flex justify-between w-full mt-6 text-sm border-t pt-2">
                <div className="text-center">
                  <p className="font-bold text-green-600 text-lg">{currentIndex + 1}</p>
                  <p className="text-gray-500">Current Question</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-green-600 text-lg">{maxQuestion}</p>
                  <p className="text-gray-500">Total Questions</p>
                </div>
              </div>
            </div>
          </div>

          {/* right div */}
          <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4">
            <h2 className="text-lg mb-4 text-emerald-600 font-semibold">AI Smart Interview</h2>

            <div className="bg-gray-100 p-4 rounded-2xl shadow border">
              <span className="text-gray-400 text-sm">
                Question {currentIndex + 1} of {maxQuestion}
              </span>
              <p className="font-semibold">{result[currentIndex]?.question}</p>
            </div>

            <textarea
              value={result[currentIndex]?.answer || answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here or click the mic to speak..."
              disabled={!!result[currentIndex]?.answer || isTimeout}
              className="w-full h-full p-3 border rounded-md text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4 resize-none"
            />

            <div
              className={`w-full transition-all duration-300 ease-in-out ${result[currentIndex]?.feeback && "p-6 bg-emerald-100 rounded-2xl shadow border"
                }`}
            >
              {result[currentIndex]?.feeback && (
                <div className="text-sm text-green-600 font-medium mb-4">
                  {result[currentIndex]?.feeback}
                </div>
              )}

              <div className="flex gap-4 items-center">
                {!result[currentIndex]?.answer && !isTimeout && (
                  <button
                    onClick={toggleListening}
                    type="button"
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isListening ? "bg-red-500 animate-bounce" : "bg-black"
                      }`}
                  >
                    {isListening ? (
                      <MicOff className="text-white" size={20} />
                    ) : (
                      <Mic className="text-white" size={20} />
                    )}
                  </button>
                )}

                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md"
                >
                  {result[currentIndex]?.answer || isTimeout
                    ? currentIndex === maxQuestion - 1
                      ? "Finish Interview 🎯"
                      : "Next Question →"
                    : "Submit Answer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}