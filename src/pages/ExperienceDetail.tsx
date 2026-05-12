import { ExperienceDetailBookingSheet } from "@/components/experience-detail/ExperienceDetailBookingSheet";
import { ExperienceDetailDesktop } from "@/components/experience-detail/ExperienceDetailDesktop";
import { ExperienceDetailMobile } from "@/components/experience-detail/ExperienceDetailMobile";
import { ExperienceDetailNotFound } from "@/components/experience-detail/ExperienceDetailNotFound";
import { GalleryLightbox } from "@/components/experience/ExperienceGallery";
import { ExperienceDetailSkeleton } from "@/components/experience/ExperienceDetailSkeleton";
import { useExperienceDetail } from "@/hooks/useExperienceDetail";

export default function ExperienceDetail() {
  const { isLoading, isError, vm } = useExperienceDetail();

  if (isLoading) return <ExperienceDetailSkeleton />;

  if (isError || !vm) return <ExperienceDetailNotFound />;

  return (
    <div className="min-h-screen bg-background">
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
