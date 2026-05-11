import { MarketingArticleLayout } from "@/pages/MarketingArticleLayout";

export default function PrivacyPage() {
  return (
    <MarketingArticleLayout title="Privacy">
      <p>
        Endebeto collects information needed to run accounts, bookings, payouts, and support—for example contact details you provide and activity related to reservations you make or host listings you manage.
      </p>
      <p>
        We use trusted infrastructure partners for hosting, payments, and email as described in your flows on the site. We do not sell personal data.
      </p>
      <p>
        To exercise privacy rights or ask questions, email{" "}
        <a href="mailto:support@endebeto.com" className="font-bold text-primary hover:underline">
          support@endebeto.com
        </a>
        .
      </p>
    </MarketingArticleLayout>
  );
}
