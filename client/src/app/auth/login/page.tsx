"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { COLORS } from "@/app/constants/colors";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await axios.post(`${backendUrl}/users/login`, formData);
      const { token, user } = response.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      toast.success("Login successful! We redirecting you to the dashboard.");
      setTimeout(() => router.push("/dashboard"), 1000); // Delay to show toast
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Login failed!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: COLORS.background.dark }}
    >
      <div
        className="w-full max-w-screen-lg space-y-8 p-14 rounded-md"
        style={{ backgroundColor: "white" }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Enter your credentials below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-8 py-3 rounded-full border border-gray-300 bg-white text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-8 py-3 rounded-full border border-gray-300 bg-white text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center items-center w-full rounded-full font-medium text-lg px-8 py-3"
              style={{
                backgroundColor: COLORS.primary.DEFAULT,
                color: "white",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/auth/register")}
              className="flex justify-center mt-6 items-center w-full rounded-full border border-gray-300 bg-white px-8 py-3 text-lg font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}