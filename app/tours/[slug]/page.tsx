import TourDetailClient from "./TourDetailClient";

export function generateStaticParams() {
  return [{ slug: "cms-tour" }];
}

export default function TourDetailPage() {
  return <TourDetailClient />;
}
