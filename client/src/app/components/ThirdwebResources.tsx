import ArticleCard from "./ArticleCard";
import { COLORS } from "../constants/colors";

export default function ThirdwebResources() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <ArticleCard
        title="For Creators"
        href="/creator"
        description="Tools and analytics to grow your community"
      />

      <ArticleCard
        title="For Audience"
        href="/audience"
        description="Connect with your favorite creators"
      />

      <ArticleCard
        title="How It Works"
        href="#"
        description="Learn about our platform and how to get started"
      />
    </div>
  );
}