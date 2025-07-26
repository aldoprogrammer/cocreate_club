import { useRouter } from "next/navigation";
import { COLORS } from "../constants/colors";
import { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<"creator" | "audience" | null>(null);

  if (!isOpen) return null;

  const handleRoleSelect = async (role: "creator" | "audience") => {
    setIsLoading(role); // Set loading state immediately when button is clicked

    try {
      // Use setTimeout to simulate a delay for demonstration purposes
      // In a real application, you would replace this with your navigation logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      await router.push('/auth/login');
    } catch (error) {
      console.error("Navigation failed:", error);
    } finally {
      setIsLoading(null);
      onClose();
    }
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
            disabled={isLoading !== null}
            className="w-full py-3 rounded-lg font-medium flex items-center justify-center"
            style={{
              backgroundColor:
                isLoading === "creator"
                  ? COLORS.primary.light
                  : COLORS.primary.DEFAULT,
              color: "white",
              opacity: isLoading && isLoading !== "creator" ? 0.7 : 1,
            }}
          >
            {isLoading === "creator" ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirecting...
              </>
            ) : (
              "Creator"
            )}
          </button>
          <button
            onClick={() => handleRoleSelect("audience")}
            disabled={isLoading !== null}
            className="w-full py-3 rounded-lg font-medium border flex items-center justify-center"
            style={{
              backgroundColor: "transparent",
              color:
                isLoading === "audience"
                  ? COLORS.primary.DEFAULT
                  : COLORS.text.DEFAULT,
              borderColor: COLORS.primary.DEFAULT,
              opacity: isLoading && isLoading !== "audience" ? 0.7 : 1,
            }}
          >
            {isLoading === "audience" ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirecting...
              </>
            ) : (
              "Audience Member"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
