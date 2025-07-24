'use client';

export default function AudienceDashboard() {
  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">👤 Audience Dashboard</h1>
        <p className="text-gray-400 mb-8">Explore your creators, contributions, and rewards.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="❤️ Followed Creators" description="See updates from creators you support." />
          <Card title="🎁 Rewards & Perks" description="Unlock exclusive content and benefits." />
          <Card title="🧾 Contributions" description="Track your past donations and tips." />
          <Card title="🔒 Wallet & Access" description="Connect or manage your Web3 wallet." />
          <Card title="⚙️ Settings" description="Change preferences, profile, and security." />
        </div>
      </div>
    </div>
  );
}

function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-[#1a1a1d] hover:bg-[#222226] transition-all rounded-xl border border-white/10 p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
