import Link from "next/link";

const tours=[
 ["Zhangjiajie Avatar Mountains","5 Days","Zhangjiajie","Dramatic sandstone peaks, glass bridges and a relaxed private itinerary."],
 ["Beijing & Xi'an Classics","7 Days","Beijing · Xi'an","Great Wall, Forbidden City and Terracotta Warriors with private local guides."],
 ["Chongqing Mountain City","4 Days","Chongqing · Wulong","Cyberpunk skyline, hotpot culture and spectacular karst landscapes."]
];
const destinations=["Beijing","Xi'an","Zhangjiajie","Chengdu","Chongqing","Guilin"];

export default function Home(){
 return <main>
  <section className="hero">
    <div className="heroShade"></div>
    <div className="heroContent">
      <p className="eyebrow">DISCOVER CHINA. YOUR WAY.</p>
      <h1>Explore <span>Real China</span></h1>
      <p className="lead">Tailor-made China journeys designed around your pace, interests and travel style.</p>
      <div className="trust"><b>Private & Small Groups</b><b>Premium Hotels</b><b>Professional Local Guides</b><b>No Hidden Costs</b></div>
      <Link className="btn" href="/quote">Plan Your China Trip →</Link>
    </div>
  </section>

  <section className="searchbox">
    <div><small>WHERE</small><b>Choose a destination</b></div><div><small>WHEN</small><b>Your travel dates</b></div><div><small>TRAVELERS</small><b>2 Guests</b></div>
    <Link href="/tours" className="searchbtn">Explore Trips</Link>
  </section>

  <section className="section">
    <div className="sectionHead"><div><p className="eyebrow red">POPULAR DESTINATIONS</p><h2>Where will China take you?</h2></div><Link href="/destinations">View all →</Link></div>
    <div className="destinationGrid">{destinations.map((d,i)=><Link href="/destinations" className={"destination d"+i} key={d}><span>Explore</span><h3>{d}</h3></Link>)}</div>
  </section>

  <section className="section soft">
    <div className="sectionHead"><div><p className="eyebrow red">HANDPICKED JOURNEYS</p><h2>China trips travelers love</h2></div><Link href="/tours">See all tours →</Link></div>
    <div className="cards">{tours.map((t,i)=><article className="card" key={t[0]}><div className={"cardImg ci"+i}><span>{t[2]}</span></div><div className="cardBody"><small>{t[1]} · PRIVATE TOUR</small><h3>{t[0]}</h3><p>{t[3]}</p><Link href={"/tours/"+(i===0?"zhangjiajie-5-day":"china-classic")}>View journey →</Link></div></article>)}</div>
  </section>

  <section className="section why"><p className="eyebrow red">WHY TRAVEL WITH SCT</p><h2>China made simple, personal and memorable.</h2>
    <div className="features"><div><b>01</b><h3>Local expertise</h3><p>Travel with specialists who understand the destinations, logistics and culture.</p></div><div><b>02</b><h3>Designed around you</h3><p>Adjust hotels, pace, experiences and destinations before you confirm.</p></div><div><b>03</b><h3>Support throughout</h3><p>One travel team from planning through the end of your China journey.</p></div><div><b>04</b><h3>Clear pricing</h3><p>Know what is included before booking, with no forced shopping stops.</p></div></div>
  </section>

  <section className="section process"><p className="eyebrow">YOUR TRIP, YOUR WAY</p><h2>From idea to China in four easy steps</h2><div className="steps"><div><b>1</b><span>Tell us your plan</span></div><div><b>2</b><span>Receive your itinerary</span></div><div><b>3</b><span>Confirm your trip</span></div><div><b>4</b><span>Explore China</span></div></div><Link href="/quote" className="btn">Start Planning →</Link></section>

  <section className="section" id="guide"><p className="eyebrow red">CHINA TRAVEL GUIDE</p><h2>Know before you go</h2><div className="guideGrid"><article><small>ESSENTIALS</small><h3>Paying in China</h3><p>What international visitors should know about mobile payments and cards.</p></article><article><small>PLANNING</small><h3>Best time to visit China</h3><p>A practical seasonal guide for different regions and travel styles.</p></article><article><small>GETTING AROUND</small><h3>High-speed rail made easy</h3><p>How to plan comfortable city-to-city travel across China.</p></article></div></section>

  <section className="cta"><p>YOUR CHINA STORY STARTS HERE</p><h2>Ready to discover the real China?</h2><Link href="/quote" className="btn white">Plan My China Trip →</Link></section>
 </main>
}