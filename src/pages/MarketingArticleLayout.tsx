import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export function MarketingArticleLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-14 pb-12">
        <article className="container max-w-2xl mx-auto px-4 py-10">
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-primary mb-6 tracking-tight">
            {title}
          </h1>
          <div className="space-y-4 text-sm md:text-base text-on-surface-variant leading-relaxed">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
