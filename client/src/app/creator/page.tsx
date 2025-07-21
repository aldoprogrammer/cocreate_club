import DeployNFTasBadge from "../components/creators/DeployNFTasBadge";
import { COLORS } from "../constants/colors";

export default function CreatorPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: COLORS.background.dark }}
    >
      <div className="max-w-4xl w-full text-center">
        <DeployNFTasBadge />
        <h1
          className="text-4xl md:text-6xl font-bold mb-8"
          style={{ color: COLORS.primary.DEFAULT }}
        >
          Creator Dashboard
        </h1>
        <p
          className="text-xl mb-12 max-w-2xl mx-auto"
          style={{ color: COLORS.text.muted }}
        >
          Welcome to your creator space. Here you can manage your content,
          engage with your audience, and grow your community.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: COLORS.background.light }}
          >
            <h3 style={{ color: COLORS.text.DEFAULT }}>Analytics</h3>
          </div>
          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: COLORS.background.light }}
          >
            <h3 style={{ color: COLORS.text.DEFAULT }}>Content</h3>
          </div>
          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: COLORS.background.light }}
          >
            <h3 style={{ color: COLORS.text.DEFAULT }}>Community</h3>
          </div>
        </div>
      </div>
    </div>
  );
}