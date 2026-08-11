import { getFeaturedTrip } from "@/data/trip";
import { Hero } from "@/components/Hero";
import { Highlights } from "@/components/Highlights";
import { TripDetails } from "@/components/TripDetails";
import { Itinerary } from "@/components/Itinerary";
import { ApplySection } from "@/components/ApplySection";
import { Footer } from "@/components/Footer";

export default function Page() {
  const trip = getFeaturedTrip();

  return (
    <>
      <a
        href="#apply"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-paper"
      >
        Skip to application
      </a>

      <main>
        <Hero trip={trip} />
        <Highlights trip={trip} />
        <TripDetails trip={trip} />
        <Itinerary trip={trip} />
        <ApplySection trip={trip} />
      </main>

      <Footer trip={trip} />
    </>
  );
}
