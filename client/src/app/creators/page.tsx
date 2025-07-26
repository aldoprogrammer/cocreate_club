"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function CreatorPage() {
  const [creators, setCreators] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    if (!token) {
      toast.error("Please log in to view creators");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter for role === 'creator'
      const onlyCreators = response.data.filter((user: User) => user.role === "creator");
      setCreators(onlyCreators);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch creators");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121214] text-white">
      <Navbar />
      <div className="px-6 py-10">
        <div className="bg-[#1a1a1d] rounded-xl border border-white/10 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">All Creators</h2>
            <button
              onClick={fetchCreators}
              disabled={loading}
              className="flex items-center px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-sm text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Refreshing...
                </>
              ) : (
                "Refresh"
              )}
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
          ) : creators.length === 0 ? (
            <p className="text-sm text-gray-400">No creators available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((creator) => (
                <Link
                  key={creator._id}
                  href={`/creators/${creator._id}`}
                  className="bg-[#222226] hover:bg-[#2a2a2e] transition-all rounded-xl border border-white/10 p-5 shadow-sm cursor-pointer"
                >
                  <h3 className="text-lg font-semibold mb-1 text-white">{creator.fullName}</h3>
                  <p className="text-sm text-gray-400">{creator.email}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}