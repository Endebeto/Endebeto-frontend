import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ExperiencesBrowseFilterSheet } from "@/components/experiences-browse/ExperiencesBrowseFilterSheet";
import { ExperiencesBrowseHeader } from "@/components/experiences-browse/ExperiencesBrowseHeader";
import { ExperiencesBrowseResults } from "@/components/experiences-browse/ExperiencesBrowseResults";
import { useExperiencesBrowse } from "@/hooks/useExperiencesBrowse";

export default function Experiences() {
  const browse = useExperiencesBrowse();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16 pb-16 px-4 max-w-7xl mx-auto">
        <ExperiencesBrowseHeader browse={browse} />
        <ExperiencesBrowseFilterSheet browse={browse} />
        <ExperiencesBrowseResults browse={browse} />
      </main>

      <Footer />
    </div>
  );
}
