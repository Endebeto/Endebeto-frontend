import { MarketingArticleLayout } from "@/pages/MarketingArticleLayout";

export default function AboutPage() {
  return (
    <MarketingArticleLayout title="About Us">
      <p>
        Endebeto connects travelers with hosts who offer authentic cultural and heritage experiences across Ethiopia and the broader Horn of Africa.
      </p>
      <p>
        Our mission is to make respectful, community-centered tourism easy to discover and book—while helping hosts preserve and share their traditions sustainably.
      </p>
      <p className="text-xs opacity-90 pt-2">
        Questions? Reach us at{" "}
        <a href="mailto:support@endebeto.com" className="font-bold text-primary hover:underline">
          support@endebeto.com
        </a>
        .
      </p>
    </MarketingArticleLayout>
  );
}
