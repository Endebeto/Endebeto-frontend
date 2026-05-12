import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export function ExperienceDetailNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-20 text-center">
        <h1 className="font-headline text-2xl font-bold text-primary">
          Experience not found
        </h1>
        <Link
          to="/experiences"
          className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Experiences
        </Link>
      </div>
      <Footer />
    </div>
  );
}
