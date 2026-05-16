import { Helmet } from "react-helmet-async";
import { ExperienceDetailBookingSheet } from "@/components/experience-detail/ExperienceDetailBookingSheet";
import { ExperienceDetailDesktop } from "@/components/experience-detail/ExperienceDetailDesktop";
import { ExperienceDetailMobile } from "@/components/experience-detail/ExperienceDetailMobile";
import { ExperienceDetailNotFound } from "@/components/experience-detail/ExperienceDetailNotFound";
import { GalleryLightbox } from "@/components/experience/ExperienceGallery";
import { ExperienceDetailSkeleton } from "@/components/experience/ExperienceDetailSkeleton";
import { useExperienceDetail } from "@/hooks/useExperienceDetail";

export default function ExperienceDetail() {
  const { isLoading, isError, vm } = useExperienceDetail();

  const pageTitle = vm?.exp?.title
    ? `${vm.exp.title} — Endebeto`
    : "Endebeto — Authentic Ethiopian Experiences";
  const pageDesc = vm?.exp?.summary || vm?.exp?.description || "";
  const pageImage = vm?.exp?.imageCover || "/imgs/hero.jpg";

  if (isLoading) return <ExperienceDetailSkeleton />;

  if (isError || !vm) return <ExperienceDetailNotFound />;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={pageImage} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={pageImage} />
      </Helmet>
      {vm.lightboxIndex !== null && vm.allGalleryImages.length > 0 && (
        <GalleryLightbox
          images={vm.allGalleryImages}
          index={vm.lightboxIndex}
          title={vm.exp.title}
          onClose={() => vm.setLightboxIndex(null)}
        />
      )}

      <ExperienceDetailMobile vm={vm} />
      <ExperienceDetailDesktop vm={vm} />

      {vm.showBookingModal && <ExperienceDetailBookingSheet vm={vm} />}
    </div>
  );
}
