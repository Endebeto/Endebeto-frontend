import { MarketingArticleLayout } from "@/pages/MarketingArticleLayout";

export default function SafetyPage() {
  return (
    <MarketingArticleLayout title="Safety">
      <p>
        Your safety matters. We encourage hosts to provide accurate descriptions, clear meeting points, and realistic difficulty levels for each experience.
      </p>
      <p>
        Travelers should read listings carefully, follow host guidance on site, and use official checkout so bookings and payments are recorded correctly.
      </p>
      <p>
        If something feels unsafe or misrepresented, stop participation where reasonable and contact{" "}
        <a href="mailto:support@endebeto.com" className="font-bold text-primary hover:underline">
          support@endebeto.com
        </a>{" "}
        with details—we review reports promptly.
      </p>
    </MarketingArticleLayout>
  );
}
