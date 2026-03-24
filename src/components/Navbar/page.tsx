"use client";

import { Bot } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 py-3 bg-white shadow-sm rounded-full mx-2 sm:mx-10 relative">

      {/* Logo */}
      <div className="flex items-center gap-2 font-semibold text-sm sm:text-lg">
        <div className="bg-black text-white p-2 rounded-md">🤖</div>
        InterviewIQ.AI
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 sm:gap-6">

        {/* Coins */}
        <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
          💰 <span>100</span>
        </div>

        {/* Profile Icon */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setOpen(!open)}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-black rounded-full flex items-center justify-center cursor-pointer"
          >
            <Bot className="text-white w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          {/* Dropdown */}
          <div
            className={`absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border p-4 transition-all duration-300 origin-top ${
              open
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
            }`}
          >
            {/* User Info */}
            <div className="mb-3">
              <p className="font-semibold text-sm">
                {user?.username || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t my-2"></div>

            {/* Menu */}
            <div className="flex flex-col gap-2 text-sm">

              <button className="text-left hover:bg-gray-100 px-2 py-1 rounded" onClick={()=> router.push('/interview-history')}>
                Interview History
              </button>

              <button
                onClick={() => signOut()}
                className="text-left text-red-500 hover:bg-red-50 px-2 py-1 rounded"
              >
                Logout
              </button>

            </div>
          </div>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;