import Link from "next/link";
export function generateStaticParams() {
  return [
    { slug: "zhangjiajie-5-day" },
    { slug: "china-classic" },
  ];
}
export default function TourDetail(){return <main><section className="tourHero"><div><p className="eyebrow">PRIVATE JOURNEY · 5 DAYS</p><h1>Zhangjiajie Avatar Mountains</h1><p>Walk among soaring sandstone peaks, ride the world's highest outdoor elevator and discover the landscapes that made Zhangjiajie famous.</p><div className="pills"><span>5 Days / 4 Nights</span><span>Private Guide</span><span>Flexible Departure</span></div></div></section>
<section className="section detailLayout"><div><h2>Journey overview</h2><p className="bigp">A comfortable five-day introduction to Zhangjiajie with private transfers, local guiding and time to experience the national forest park without rushing.</p><h2>Day by day</h2>{["Arrival in Zhangjiajie","Zhangjiajie National Forest Park","Tianzi Mountain & Golden Whip Stream","Tianmen Mountain","Departure"].map((d,i)=><div className="day" key={d}><b>DAY {i+1}</b><div><h3>{d}</h3><p>Private sightseeing with a flexible pace, local recommendations and convenient transfers arranged around your itinerary.</p></div></div>)}
<h2>What's included</h2><div className="included"><span>✓ Private airport / station transfers</span><span>✓ Professional local guide</span><span>✓ Selected attraction tickets</span><span>✓ Comfortable hotel options</span><span>✓ Private vehicle during touring</span><span>✓ 24/7 travel support</span></div></div>
<aside className="quoteCard"><small>TAILOR THIS TRIP</small><h3>Make it your journey</h3><p>Tell us your dates, group size and preferences. We'll prepare a personalized proposal.</p><Link href="/quote" className="btn">Get My Trip Plan →</Link><hr/><p className="muted">No forced shopping · Clear inclusions · Flexible itinerary</p></aside></section></main>}
