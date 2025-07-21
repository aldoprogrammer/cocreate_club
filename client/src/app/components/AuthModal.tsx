import { useRouter } from "next/navigation";
import { COLORS } from "../constants/colors";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleRoleSelect = (role: "creator" | "audience") => {
    router.push(`${role}/login`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background-DEFAULT rounded-xl p-8 max-w-md w-full"
        style={{
          backgroundColor: COLORS.background.DEFAULT,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: COLORS.text.DEFAULT }}
        >
          Join as
        </h2>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect("creator")}
            className="w-full py-3 rounded-lg font-medium"
            style={{
              backgroundColor: COLORS.primary.DEFAULT,
              color: "white",
            }}
          >
            Creator
          </button>
          <button
            onClick={() => handleRoleSelect("audience")}
            className="w-full py-3 rounded-lg font-medium border"
            style={{
              backgroundColor: "transparent",
              color: COLORS.text.DEFAULT,
              borderColor: COLORS.primary.DEFAULT,
            }}
          >
            Audience Member
          </button>
        </div>
      </div>
    </div>
  );
}