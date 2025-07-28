"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  if (!user) return null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const menuItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Campaigns", href: "/campaigns" },
    { label: "Creators", href: "/creators" },
  ];

  return (
    <nav className="backdrop-blur bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center text-white sticky top-0 z-50">
      <div>
        <Link href="/" className="text-xl font-bold">
          🎭 CoCreate Club
        </Link>
      </div>

      <div className="flex justify-center gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-gray-300 hover:text-white transition text-sm"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-300 hidden sm:inline">
          Welcome, {user.fullName}
        </span>
        <button
          onClick={logout}
          className="bg-white/10 hover:bg-white/20 transition px-4 py-1.5 rounded-md"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
