import { COLORS } from "../constants/colors";

interface ArticleCardProps {
  title: string;
  href: string;
  description: string;
}

export default function ArticleCard({
  title,
  href,
  description,
}: ArticleCardProps) {
  return (
    <a
      href={href}
      className="flex flex-col border rounded-lg p-6 hover:shadow-lg transition-all duration-300"
      style={{
        backgroundColor: COLORS.background.light,
        borderColor: COLORS.background.light,
      }}
    >
      <article>
        <h2
          className="text-xl font-semibold mb-3"
          style={{ color: COLORS.text.DEFAULT }}
        >
          {title}
        </h2>
        <p
          className="text-sm"
          style={{ color: COLORS.text.muted }}
        >
          {description}
        </p>
      </article>
    </a>
  );
}