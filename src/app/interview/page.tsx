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
    const { data:session } = useSession();
    const user = session?.user;
    const userId = user?._id;

    const handleInput = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "experience" ? Number(value) :
                value
        }));
    }

    const openFile = () => {
        if (fileInput.current) {
            fileInput.current.click();
        }
    };

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
            formData.append("resume", fileInput.current.files[0])
            const response = await axios.post('/api/resume-analysis', formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.data.success) {
                toast.success(response.data.message || "Resume Analyized Successfully!!");
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

        }
        catch (error) {
            const axiosError = error as AxiosError<APIResponse>
            toast.error(axiosError.response?.data.message || "Something went wrong to get AI Response");
        }
        finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if(!userId){
            return;
        }

        setIssubmit(true);
        try {
            const response = await axios.post('/api/start-interview', {
                ...form,
                userId
            });
            const interviewId = response.data.interviewId;
            router.push(`/live-interview/${interviewId}`);
        }
        catch (error) {
            const apiError = error as AxiosError<APIResponse>
            toast.error(apiError.response?.data.message);
        }
        finally {
            setIssubmit(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

                {/* LEFT SIDE */}
                <div className="bg-linear-to-br from-green-100 to-green-200 p-12 flex flex-col justify-center">

                    <h2 className="text-3xl font-bold mb-4">
                        Start Your AI Interview
                    </h2>

                    <p className="text-gray-600 mb-8">
                        Practice real interview scenarios powered by AI. Improve
                        communication, technical skills, and confidence.
                    </p>

                    <div className="space-y-4">

                        <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
                            <User className="text-green-600" size={20} />
                            <span className="text-sm font-medium">
                                Choose Role & Experience
                            </span>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
                            <Mic className="text-green-600" size={20} />
                            <span className="text-sm font-medium">
                                Smart Voice Interview
                            </span>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
                            <BarChart3 className="text-green-600" size={20} />
                            <span className="text-sm font-medium">
                                Performance Analytics
                            </span>
                        </div>

                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="p-12">

                    <h3 className="text-2xl font-semibold mb-6">
                        Interview Setup
                    </h3>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Role */}
                        <div className="w-full border rounded-xl flex pl-4 pr-4 py-3 gap-2 items-center focus-within:ring-2 focus-within:ring-green-400 transition">
                            <User className="text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Enter Role"
                                className="flex-1 border-none outline-none"
                                value={form.role}
                                name="role"
                                onChange={handleInput}
                            />
                        </div>

                        {/* Experience */}
                        <div className="w-full border rounded-xl flex pl-4 pr-4 py-3 gap-2 items-center focus-within:ring-2 focus-within:ring-green-400 transition">
                            <Briefcase className="text-gray-400" size={18} />
                            <input
                                type="number"
                                placeholder="Experience (e.g. 2 years)"
                                className="flex-1 border-none outline-none"
                                name="experience"
                                value={form.experience}
                                onChange={handleInput}
                            />
                        </div>

                        {/* Interview Type */}
                        <select
                            className="w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-green-400"
                            name="interviewType"
                            value={form.interviewType}
                            onChange={handleInput}
                        >
                            <option value="technical">Technical Interview</option>
                            <option value="hr">HR Interview</option>
                            <option value="behavioral">Behavioral Interview</option>
                        </select>

                        {/* Upload Resume */}
                        <div className="border-2 border-dashed rounded-xl text-center cursor-pointer hover:bg-gray-50 transition p-8">
                            <div onClick={openFile}>
                                <Upload className="mx-auto text-green-600 mb-2" />
                                <p className="text-sm text-gray-500">
                                    {filename ? filename : "Click to upload resume (Optional)"}
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
                                    className={`mt-4 px-6 py-2 rounded-2xl text-white transition 
                                    ${isAnalyzed
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-black hover:bg-gray-600"
                                        }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader className="animate-spin" size={16} />
                                            <span>Analyzing...</span>
                                        </div>
                                    ) : isAnalyzed ? (
                                        "Already Analyzed"
                                    ) : (
                                        "Analyze Resume"
                                    )}
                                </button>
                            )}
                        </div>

                        {/* AI Result */}
                        {(form.skills.length > 0 || form.projects.length > 0) && (
                            <div className="bg-gray-50 p-6 rounded-2xl shadow-md mt-4">
                                <h2 className="text-md font-semibold text-gray-700">
                                    Resume Analysis Result
                                </h2>

                                {form.projects.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-semibold">Projects:</p>
                                        <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
                                            {form.projects.map((proj, index) => (
                                                <li key={index}>{proj}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {form.skills.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-semibold">Skills:</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {form.skills.map((skill, index) => (
                                                <div
                                                    key={index}
                                                    className="px-4 py-1 text-sm bg-emerald-100 text-emerald-600 rounded-full"
                                                >
                                                    {skill}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Start Interview */}
                        <button
                            type="submit"
                            disabled={issubmit}
                            className={`w-full flex justify-center gap-1 items-center py-3 rounded-full transition
                                ${issubmit
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gray-700 hover:bg-gray-800 text-white"
                                }`}
                        >
                            {issubmit ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </>
                            ) : (
                                "Start Interview"
                            )}
                        </button>
                    </form>
                </div>

            </div>

        </div>
    );
}

export default page
