import Link from "next/link";

const destinations = [
  ["Beijing", "Imperial heritage & the Great Wall", "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=82"],
  ["Xi'an", "Ancient stories & the Terracotta Army", "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1200&q=82"],
  ["Zhangjiajie", "Pillar mountains above the clouds", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82"],
  ["Chengdu", "Pandas, teahouses & Sichuan flavors", "https://images.unsplash.com/photo-1529921879218-f99546d03a4f?auto=format&fit=crop&w=1200&q=82"],
  ["Chongqing", "Mountain-city energy & dramatic gorges", "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=82"],
  ["Guilin", "Quiet rivers & limestone landscapes", "https://images.unsplash.com/photo-1537531383496-f4749b8032cf?auto=format&fit=crop&w=1200&q=82"],
];

const journeys = [
  { title: "Zhangjiajie Avatar Mountains", days: "5 Days", place: "Zhangjiajie", image: destinations[2][2], slug: "zhangjiajie-5-day", text: "Walk between soaring sandstone pillars with a private guide and time to take it all in." },
  { title: "Beijing & Xi'an Classics", days: "7 Days", place: "Beijing · Xi'an", image: destinations[0][2], slug: "china-classic", text: "Two iconic capitals, one beautifully paced journey through China's extraordinary past." },
  { title: "Chongqing & Wulong", days: "4 Days", place: "Chongqing · Wulong", image: destinations[4][2], slug: "china-classic", text: "Discover a cinematic skyline, bold local flavors and spectacular karst scenery." },
];

const Icon = ({ name }: { name: "compass" | "route" | "support" | "clear" }) => {
  const paths = {
    compass: <><circle cx="12" cy="12" r="8"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z"/></>,
    route: <><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h2a2 2 0 0 0 2-2V8a2 2 0 0 1 2-2h2"/></>,
    support: <><path d="M4 13v-2a8 8 0 0 1 16 0v2"/><path d="M4 13a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2v-2Zm16 0a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2v-2ZM17 17c0 2-1.5 3-4 3"/></>,
    clear: <><path d="M4 7h16M7 12h10M10 17h4"/><path d="m17 16 1.5 1.5L21 15"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

export default function Home() {
  return <main>
    <section className="hero" aria-labelledby="hero-title">
      <div className="heroContent">
        <p className="eyebrow eyebrow-light">DISCOVER CHINA. YOUR WAY.</p>
        <h1 id="hero-title">Explore <em>Real China</em></h1>
        <p className="lead">Tailor-made China journeys designed around your pace, interests and travel style.</p>
        <ul className="trust" aria-label="Why travel with us">
          <li>Private &amp; Small Groups</li><li>Professional Local Guides</li><li>Flexible Itineraries</li><li>No Forced Shopping</li>
        </ul>
        <div className="heroActions"><Link className="btn" href="/quote">Plan Your China Trip <span>↗</span></Link><Link className="btn btn-ghost" href="/tours">Explore Tours</Link></div>
      </div>
      <div className="heroCaption"><span>01</span><p>Journeys that go beyond<br/>the familiar.</p></div>
    </section>

    <section className="tripFinder" aria-label="Trip finder">
      <div className="finderIntro"><span>FIND YOUR TRIP</span><strong>Start exploring</strong></div>
      <div className="finderField"><small>WHERE</small><b>Choose a destination</b></div>
      <div className="finderField"><small>WHEN</small><b>Your travel dates</b></div>
      <div className="finderField"><small>TRAVELERS</small><b>2 guests</b></div>
      <Link href="/tours" className="finderButton">Explore Trips <span>→</span></Link>
    </section>

    <section className="section destinationsSection">
      <div className="sectionHead"><div><p className="eyebrow">POPULAR DESTINATIONS</p><h2>Find your place in China.</h2><p className="sectionIntro">Ancient capitals, surreal landscapes and vibrant modern cities—each one has a different story to tell.</p></div><Link href="/destinations" className="textLink">View all destinations <span>→</span></Link></div>
      <div className="destinationGrid">{destinations.map(([name, desc, image], i) => <Link href="/destinations" className="destination" key={name} style={{backgroundImage:`linear-gradient(180deg, transparent 35%, rgba(3,29,53,.88)), url('${image}')`}}><span className="cardIndex">0{i + 1}</span><div><p>{desc}</p><h3>{name}</h3><span className="roundArrow">↗</span></div></Link>)}</div>
    </section>

    <section className="journeysSection">
      <div className="section sectionFlush"><div className="sectionHead"><div><p className="eyebrow">HANDPICKED JOURNEYS</p><h2>Made for curious travelers.</h2></div><Link href="/tours" className="textLink">Explore all journeys <span>→</span></Link></div>
        <div className="journeyGrid">{journeys.map((tour, i) => <article className="journey" key={tour.title}><Link href={`/tours/${tour.slug}`} className="journeyImage" aria-label={`View ${tour.title}`} style={{backgroundImage:`url('${tour.image}')`}}><span>{tour.place}</span><b>0{i + 1}</b></Link><div className="journeyBody"><small>{tour.days} · PRIVATE JOURNEY</small><h3>{tour.title}</h3><p>{tour.text}</p><Link href={`/tours/${tour.slug}`}>View Journey <span>→</span></Link></div></article>)}</div>
      </div>
    </section>

    <section className="whySection"><div className="whyStory"><p className="eyebrow eyebrow-light">WHY TRAVEL WITH SCT</p><h2>More than a trip.<br/>Your China story.</h2><p>China can feel wonderfully different. Our locally based team turns that difference into a journey that feels effortless, personal and truly yours.</p><Link href="/quote" className="lightLink">Meet your travel team <span>→</span></Link></div><div className="whyFeatures">
      <article><Icon name="compass"/><div><h3>Local Expertise</h3><p>On-the-ground specialists, thoughtful recommendations and guides who bring every place to life.</p></div></article>
      <article><Icon name="route"/><div><h3>Tailor-made Journeys</h3><p>Your pace, interests and travel style shape every detail—not the other way around.</p></div></article>
      <article><Icon name="support"/><div><h3>Support Throughout</h3><p>A dedicated team stays close, from your first idea until you arrive safely home.</p></div></article>
      <article><Icon name="clear"/><div><h3>Clear Pricing. No Forced Shopping.</h3><p>Transparent inclusions and authentic experiences, with no unwanted retail stops.</p></div></article>
    </div></section>

    <section className="section worksSection"><div className="centerHead"><p className="eyebrow">HOW IT WORKS</p><h2>Four steps. One unforgettable journey.</h2><p>Thoughtful planning, without the complexity.</p></div><ol className="steps"><li><span>01</span><h3>Tell us your plan</h3><p>Share your dates, interests and travel style.</p></li><li><span>02</span><h3>Receive your itinerary</h3><p>We design a personal journey for you.</p></li><li><span>03</span><h3>Confirm your trip</h3><p>Refine the details, then book with confidence.</p></li><li><span>04</span><h3>Explore China</h3><p>Arrive and enjoy, with our team beside you.</p></li></ol></section>

    <section className="section guideSection" id="guide"><div className="sectionHead"><div><p className="eyebrow">CHINA TRAVEL GUIDE</p><h2>Good to know before you go.</h2></div><span className="guideMark" aria-hidden="true">知</span></div><div className="guideGrid"><article><div><span>ESSENTIALS</span><b>5 MIN READ</b></div><h3>Paying in China</h3><p>A simple guide to cards, cash and mobile payment for international visitors.</p><Link href="/quote">Read the guide →</Link></article><article><div><span>PLANNING</span><b>6 MIN READ</b></div><h3>Best Time to Visit China</h3><p>Choose the right season for the regions and experiences on your wish list.</p><Link href="/quote">Read the guide →</Link></article><article><div><span>GETTING AROUND</span><b>4 MIN READ</b></div><h3>High-Speed Rail Made Easy</h3><p>Everything you need for comfortable, seamless journeys between cities.</p><Link href="/quote">Read the guide →</Link></article></div></section>

    <section className="finalCta"><div><p className="eyebrow eyebrow-light">LET'S CREATE SOMETHING EXTRAORDINARY</p><h2>Ready to discover<br/>the real China?</h2></div><div><p>Tell us what inspires you. We'll turn it into a journey designed only for you.</p><Link href="/quote" className="btn btn-white">Plan My China Trip <span>↗</span></Link></div></section>
  </main>;
}
