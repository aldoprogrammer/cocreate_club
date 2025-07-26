'use client';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">🛡️ Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">
          Manage users, content, and system settings.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#1a1a1d] p-6 rounded-xl border border-white/10 shadow">
            <h2 className="text-lg font-semibold mb-1">👥 User Management</h2>
            <p className="text-sm text-gray-400">View and moderate platform users.</p>
          </div>
          <div className="bg-[#1a1a1d] p-6 rounded-xl border border-white/10 shadow">
            <h2 className="text-lg font-semibold mb-1">📦 Campaign Control</h2>
            <p className="text-sm text-gray-400">Review and manage campaign submissions.</p>
          </div>
          <div className="bg-[#1a1a1d] p-6 rounded-xl border border-white/10 shadow">
            <h2 className="text-lg font-semibold mb-1">⚙️ System Settings</h2>
            <p className="text-sm text-gray-400">Configure platform-wide settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
