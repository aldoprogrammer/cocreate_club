import Image from "next/image";
import { COLORS } from "../constants/colors";
import thirdwebIcon from "@public/thirdweb.svg";

export default function Header() {
  return (
    <header className="flex flex-col items-center mb-20">
      <Image
        src={thirdwebIcon}
        alt="Cocreate Club Logo"
        className="size-[150px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
      />

      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-center">
        <span style={{ color: COLORS.text.DEFAULT }}>Cocreate</span>{" "}
        <span style={{ color: COLORS.primary.DEFAULT }}>Club</span>
      </h1>

      <p
        className="text-lg text-center max-w-2xl mx-auto"
        style={{ color: COLORS.text.muted }}
      >
        The platform where creators and audiences come together to build
        something amazing.
      </p>
    </header>
  );
}