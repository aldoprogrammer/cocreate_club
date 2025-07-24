'use client';

export default function CreatorDashboard() {
  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">🎨 Creator Dashboard</h1>
        <p className="text-gray-400 mb-8">Manage your content, track your growth, and engage with your supporters.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="📈 Analytics" description="View growth and earnings insights." />
          <Card title="🛠️ Create Campaign" description="Launch a new campaign for your supporters." />
          <Card title="📬 Messages" description="Chat with your audience and backers." />
          <Card title="💰 Payouts" description="Manage your withdrawal and earning history." />
          <Card title="🎨 Profile Customization" description="Personalize your public creator profile." />
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
