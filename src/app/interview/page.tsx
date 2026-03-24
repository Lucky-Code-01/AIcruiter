"use client";
import axios, { AxiosError } from "axios";
import { User, Briefcase, Mic, BarChart3, Upload, Loader, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { APIResponse } from '@/utils/APIResponse';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function page() {

    const fileInput = useRef<HTMLInputElement | null>(null);
    const [filename, setFileName] = useState('');
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [issubmit, setIssubmit] = useState(false);

    const [form, setForm] = useState({
        role: '',
        experience: 0,
        interviewType: 'technical',
        skills: [],
        projects: []
    });

    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user;
    const userId = user?._id;

    const handleInput = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "experience" ? Number(value) : value
        }));
    };

    const openFile = () => fileInput.current?.click();

    const captureFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFileName(event.target.files[0].name);
        }
    };

    const analyzeResume = async () => {
        try {
            if (!fileInput.current?.files?.[0]) return;
            setLoading(true);

            const formData = new FormData();
            formData.append("resume", fileInput.current.files[0]);

            const response = await axios.post('/api/resume-analysis', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.data.success) {
                toast.success(response.data.message || "Resume Analyzed Successfully!!");

                const aiData = response.data.data;
                setForm((prev) => ({
                    ...prev,
                    role: aiData.role || prev.role,
                    experience: aiData.experience || prev.experience,
                    interviewType: aiData.interviewType || prev.interviewType,
                    skills: aiData.skills || prev.skills,
                    projects: aiData.projects || prev.projects
                }));

                setIsAnalyzed(true);
            }

        } catch (error) {
            const axiosError = error as AxiosError<APIResponse>;
            toast.error(axiosError.response?.data.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!userId) return;

        setIssubmit(true);
        try {
            const response = await axios.post('/api/start-interview', {
                ...form,
                userId
            });

            router.push(`/live-interview/${response.data.interviewId}`);
        } catch (error) {
            const apiError = error as AxiosError<APIResponse>;
            toast.error(apiError.response?.data.message);
        } finally {
            setIssubmit(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">

            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

                {/* LEFT */}
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 md:p-10 lg:p-12 flex flex-col justify-center">

                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                        Start Your AI Interview
                    </h2>

                    <p className="text-gray-600 mb-6 text-sm sm:text-base">
                        Practice real interview scenarios powered by AI. Improve
                        communication, technical skills, and confidence.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-white p-3 sm:p-4 rounded-xl shadow-sm">
                            <User className="text-green-600" size={20} />
                            <span className="text-sm font-medium">
                                Choose Role & Experience
                            </span>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3 sm:p-4 rounded-xl shadow-sm">
                            <Mic className="text-green-600" size={20} />
                            <span className="text-sm font-medium">
                                Smart Voice Interview
                            </span>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3 sm:p-4 rounded-xl shadow-sm">
                            <BarChart3 className="text-green-600" size={20} />
                            <span className="text-sm font-medium">
                                Performance Analytics
                            </span>
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="p-6 md:p-10 lg:p-12">

                    <h3 className="text-xl sm:text-2xl font-semibold mb-6">
                        Interview Setup
                    </h3>

                    <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>

                        {/* Role */}
                        <div className="w-full border rounded-xl flex px-4 py-3 gap-2 items-center focus-within:ring-2 focus-within:ring-green-400">
                            <User className="text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Enter Role"
                                className="flex-1 outline-none text-sm sm:text-base"
                                value={form.role}
                                name="role"
                                onChange={handleInput}
                            />
                        </div>

                        {/* Experience */}
                        <div className="w-full border rounded-xl flex px-4 py-3 gap-2 items-center focus-within:ring-2 focus-within:ring-green-400">
                            <Briefcase className="text-gray-400" size={18} />
                            <input
                                type="number"
                                placeholder="Experience"
                                className="flex-1 outline-none text-sm sm:text-base"
                                name="experience"
                                value={form.experience}
                                onChange={handleInput}
                            />
                        </div>

                        {/* Select */}
                        <select
                            className="w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
                            name="interviewType"
                            value={form.interviewType}
                            onChange={handleInput}
                        >
                            <option value="technical">Technical</option>
                            <option value="hr">HR</option>
                            <option value="behavioral">Behavioral</option>
                        </select>

                        {/* Upload */}
                        <div className="border-2 border-dashed rounded-xl text-center cursor-pointer hover:bg-gray-50 transition p-6 sm:p-8">
                            <div onClick={openFile}>
                                <Upload className="mx-auto text-green-600 mb-2" />
                                <p className="text-xs sm:text-sm text-gray-500">
                                    {filename || "Click to upload resume"}
                                </p>
                            </div>

                            <input
                                type="file"
                                className="hidden"
                                ref={fileInput}
                                onChange={captureFile}
                            />

                            {filename && (
                                <button
                                    type="button"
                                    onClick={analyzeResume}
                                    disabled={loading || isAnalyzed}
                                    className={`mt-4 px-5 py-2 rounded-xl text-white text-sm
                                    ${isAnalyzed ? "bg-gray-400" : "bg-black hover:bg-gray-600"}`}
                                >
                                    {loading ? "Analyzing..." : isAnalyzed ? "Done" : "Analyze"}
                                </button>
                            )}
                        </div>

                        {/* Result */}
                        {(form.skills.length > 0 || form.projects.length > 0) && (
                            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                                <h2 className="text-sm font-semibold">Resume Analysis</h2>

                                {form.projects.length > 0 && (
                                    <ul className="list-disc ml-5 text-xs sm:text-sm mt-2">
                                        {form.projects.map((p, i) => <li key={i}>{p}</li>)}
                                    </ul>
                                )}

                                {form.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {form.skills.map((s, i) => (
                                            <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={issubmit}
                            className={`w-full py-3 rounded-full text-white text-sm sm:text-base
                            ${issubmit ? "bg-gray-400" : "bg-gray-800 hover:bg-black"}`}
                        >
                            {issubmit ? "Please wait..." : "Start Interview"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default page;