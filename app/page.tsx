import Link from "next/link";

type Visual = { title: string; detail: string; image: string; position?: string };

// Curated, place-specific photography. Remote delivery keeps the static export light.
const images = {
  beijing: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1800&q=86",
  xian: "https://images.unsplash.com/photo-1591122947157-26bad3a117d2?auto=format&fit=crop&w=1600&q=86",
  zhangjiajie: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1800&q=86",
  chengdu: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=1400&q=86",
  chongqing: "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?auto=format&fit=crop&w=1600&q=86",
  guilin: "https://images.unsplash.com/photo-1537531383496-f4749b8032cf?auto=format&fit=crop&w=1600&q=86",
  food: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1400&q=84",
  family: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=84",
  shanghai: "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?auto=format&fit=crop&w=1600&q=86",
  guide: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=84",
  rail: "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=1200&q=82",
};

const destinations: Visual[] = [
  { title: "Beijing", detail: "Imperial heritage & the Great Wall", image: images.beijing, position: "center 42%" },
  { title: "Xi'an", detail: "The Terracotta Army & ancient city walls", image: images.xian },
  { title: "Zhangjiajie", detail: "Sandstone pillars above the clouds", image: images.zhangjiajie },
  { title: "Chengdu", detail: "Giant pandas & Sichuan flavors", image: images.chengdu, position: "center 34%" },
  { title: "Chongqing", detail: "A luminous mountain city on two rivers", image: images.chongqing },
  { title: "Guilin", detail: "Li River calm & iconic karst peaks", image: images.guilin },
];

const interests: Visual[] = [
  { title: "Culture", detail: "Walk through living history", image: images.beijing },
  { title: "Nature", detail: "Landscapes that feel otherworldly", image: images.zhangjiajie },
  { title: "Food", detail: "Taste every region", image: images.food },
  { title: "Family", detail: "Wonder for every generation", image: images.family },
  { title: "Adventure", detail: "Take the path higher", image: images.guilin },
  { title: "City Life", detail: "Meet tomorrow's China", image: images.shanghai },
];

const journeys = [
  { title: "Zhangjiajie Avatar Mountains", days: "5 Days", place: "Zhangjiajie", image: images.zhangjiajie, slug: "zhangjiajie-5-day", text: "Walk between soaring sandstone pillars with a private guide and time to take it all in." },
  { title: "Beijing & Xi'an Classics", days: "7 Days", place: "Beijing · Xi'an", image: images.beijing, slug: "china-classic", text: "Two iconic capitals, one beautifully paced journey through China's extraordinary past." },
  { title: "Chongqing & Wulong", days: "4 Days", place: "Chongqing · Wulong", image: images.chongqing, slug: "china-classic", text: "Discover a cinematic skyline, bold local flavors and spectacular karst scenery." },
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
      <div className="heroBackdrop" aria-hidden="true" />
      <div className="heroContent">
        <p className="eyebrow eyebrow-light">DISCOVER CHINA. YOUR WAY.</p>
        <h1 id="hero-title">Explore <em>Real China</em></h1>
        <p className="lead">Tailor-made China journeys designed around your pace, interests and travel style.</p>
        <ul className="trust"><li>Private &amp; Small Groups</li><li>Professional Local Guides</li><li>Flexible Itineraries</li><li>No Forced Shopping</li></ul>
        <div className="heroActions"><Link className="btn" href="/quote">Plan Your China Trip <span>↗</span></Link><Link className="btn btn-ghost" href="/tours">Explore Tours</Link></div>
      </div>
      <div className="heroMosaic" aria-label="Scenes from across China">
        <div className="mosaicMain" style={{backgroundImage:`url('${images.zhangjiajie}')`}}><span>Zhangjiajie</span></div>
        <div style={{backgroundImage:`url('${images.guilin}')`}}><span>Guilin</span></div>
        <div style={{backgroundImage:`url('${images.shanghai}')`}}><span>Shanghai</span></div>
      </div>
    </section>

    <aside className="tripFinder" aria-label="Start planning your China trip">
      <div className="finderIntro"><span>YOUR JOURNEY</span><strong>Where will China take you?</strong></div>
      <div className="finderPrompt"><small>YOUR IDEAS</small><b>Places, dates &amp; travelers</b><span>Tell us what you have in mind—we'll shape the rest.</span></div>
      <Link href="/quote" className="finderButton">Start Planning <span>→</span></Link>
    </aside>

    <section className="section destinationsSection">
      <div className="sectionHead"><div><p className="eyebrow">POPULAR DESTINATIONS</p><h2>Find your place in China.</h2><p className="sectionIntro">Ancient capitals, surreal landscapes and vibrant modern cities—each one has a different story to tell.</p></div><Link href="/destinations" className="textLink">View all destinations <span>→</span></Link></div>
      <div className="destinationGrid">{destinations.map(({title,detail,image,position}, i) => <Link href="/destinations" className="destination" key={title} style={{backgroundImage:`linear-gradient(180deg, rgba(3,29,53,.04) 28%, rgba(3,29,53,.9)), url('${image}')`,backgroundPosition:position}}><span className="cardIndex">0{i + 1}</span><div><p>{detail}</p><h3>{title}</h3><span className="roundArrow">↗</span></div></Link>)}</div>
    </section>

    <section className="experienceSection section">
      <div className="sectionHead"><div><p className="eyebrow">CHINA, YOUR WAY</p><h2>One country. Endless ways<br/>to experience it.</h2></div><p className="sectionIntro">Follow the experiences that move you. We will connect them into one seamless, personal journey.</p></div>
      <div className="interestGrid">{interests.map(({title,detail,image}, i) => <Link href="/quote" className={`interest interest${i + 1}`} key={title} style={{backgroundImage:`linear-gradient(180deg, transparent 34%, rgba(2,27,50,.9)), url('${image}')`}}><div><span>EXPLORE</span><h3>{title}</h3><p>{detail}</p></div><b aria-hidden="true">↗</b></Link>)}</div>
    </section>

    <section className="journeysSection"><div className="section sectionFlush"><div className="sectionHead"><div><p className="eyebrow">HANDPICKED JOURNEYS</p><h2>Made for curious travelers.</h2></div><Link href="/tours" className="textLink">Explore all journeys <span>→</span></Link></div>
      <div className="journeyGrid">{journeys.map((tour, i) => <article className="journey" key={tour.title}><Link href={`/tours/${tour.slug}`} className="journeyImage" aria-label={`View ${tour.title}`} style={{backgroundImage:`url('${tour.image}')`}}><span>{tour.place}</span><b>0{i + 1}</b></Link><div className="journeyBody"><small>{tour.days} · PRIVATE JOURNEY</small><h3>{tour.title}</h3><p>{tour.text}</p><Link href={`/tours/${tour.slug}`}>View Journey <span>→</span></Link></div></article>)}</div>
    </div></section>

    <section className="whySection"><div className="whyVisual" style={{backgroundImage:`linear-gradient(180deg, transparent 44%, rgba(3,34,63,.92)), url('${images.guide}')`}}><div><span>LOCALLY BASED · ALWAYS CLOSE</span><p>Real people in China, taking care of every detail.</p></div></div><div className="whyContent"><div className="whyStory"><p className="eyebrow eyebrow-light">WHY TRAVEL WITH SCT</p><h2>More than a trip.<br/>Your China story.</h2><p>China can feel wonderfully different. Our locally based team turns that difference into a journey that feels effortless, personal and truly yours.</p></div><div className="whyFeatures">
      <article><Icon name="compass"/><div><h3>Local Expertise</h3><p>On-the-ground specialists and guides who bring every place to life.</p></div></article>
      <article><Icon name="route"/><div><h3>Tailor-made Journeys</h3><p>Your pace, interests and travel style shape every detail.</p></div></article>
      <article><Icon name="support"/><div><h3>Support Throughout</h3><p>A dedicated team stays close from first idea to your journey home.</p></div></article>
      <article><Icon name="clear"/><div><h3>Clear Pricing. No Forced Shopping.</h3><p>Transparent inclusions and authentic experiences, always.</p></div></article>
    </div><Link href="/quote" className="lightLink">Meet your travel team <span>→</span></Link></div></section>

    <section className="section worksSection"><div className="centerHead"><p className="eyebrow">HOW IT WORKS</p><h2>Four steps. One unforgettable journey.</h2><p>Thoughtful planning, without the complexity.</p></div><ol className="steps"><li><span>01</span><h3>Tell us your plan</h3><p>Share your dates, interests and travel style.</p></li><li><span>02</span><h3>Receive your itinerary</h3><p>We design a personal journey for you.</p></li><li><span>03</span><h3>Confirm your trip</h3><p>Refine the details, then book with confidence.</p></li><li><span>04</span><h3>Explore China</h3><p>Arrive and enjoy, with our team beside you.</p></li></ol></section>

    <section className="section guideSection" id="guide"><div className="sectionHead"><div><p className="eyebrow">CHINA TRAVEL GUIDE</p><h2>Good to know before you go.</h2><p className="sectionIntro">Straightforward advice from the team on the ground.</p></div><span className="guideMark" aria-hidden="true">知</span></div><div className="guideGrid"><article style={{backgroundImage:`linear-gradient(180deg,rgba(3,34,63,.05),rgba(3,34,63,.86)),url('${images.shanghai}')`}}><div><span>ESSENTIALS</span><b>5 MIN READ</b></div><section><h3>Paying in China</h3><p>A simple guide to cards, cash and mobile payment for international visitors.</p><Link href="/quote">Read the guide →</Link></section></article><article style={{backgroundImage:`linear-gradient(180deg,rgba(3,34,63,.05),rgba(3,34,63,.86)),url('${images.guilin}')`}}><div><span>PLANNING</span><b>6 MIN READ</b></div><section><h3>Best Time to Visit China</h3><p>Choose the right season for the regions and experiences on your wish list.</p><Link href="/quote">Read the guide →</Link></section></article><article style={{backgroundImage:`linear-gradient(180deg,rgba(3,34,63,.05),rgba(3,34,63,.88)),url('${images.rail}')`}}><div><span>GETTING AROUND</span><b>4 MIN READ</b></div><section><h3>High-Speed Rail Made Easy</h3><p>Everything you need for comfortable, seamless journeys between cities.</p><Link href="/quote">Read the guide →</Link></section></article></div></section>

    <section className="finalCta"><div><p className="eyebrow eyebrow-light">LET'S CREATE SOMETHING EXTRAORDINARY</p><h2>Ready to discover<br/>the real China?</h2></div><div><p>Tell us what inspires you. We'll turn it into a journey designed only for you.</p><Link href="/quote" className="btn btn-white">Plan My China Trip <span>↗</span></Link></div></section>
  </main>;
}
