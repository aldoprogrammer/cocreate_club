import { COLORS } from "../constants/colors";

export default function AudiencePage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: COLORS.background.dark }}
    >
      <div className="max-w-4xl w-full text-center">
        <h1
          className="text-4xl md:text-6xl font-bold mb-8"
          style={{ color: COLORS.secondary.DEFAULT }}
        >
          Audience Hub
        </h1>
        <p
          className="text-xl mb-12 max-w-2xl mx-auto"
          style={{ color: COLORS.text.muted }}
        >
          Discover and support your favorite creators. Get exclusive content and
          be part of the creative process.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: COLORS.background.light }}
          >
            <h3 style={{ color: COLORS.text.DEFAULT }}>Discover</h3>
          </div>
          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: COLORS.background.light }}
          >
            <h3 style={{ color: COLORS.text.DEFAULT }}>Favorites</h3>
          </div>
          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: COLORS.background.light }}
          >
            <h3 style={{ color: COLORS.text.DEFAULT }}>Rewards</h3>
          </div>
        </div>
      </div>
    </div>
  );
}