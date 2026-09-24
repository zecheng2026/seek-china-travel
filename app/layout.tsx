import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "SEEK CHINA TRAVEL | Discover China. Your Way.",
  description: "Private and tailor-made China journeys created by local experts for curious travelers.",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>
    <header className="siteHeader">
      <Link href="/" className="brand" aria-label="Seek China Travel home"><span className="brandMark">S<span>C</span>T</span><span className="brandWords"><b>SEEK CHINA</b><small>TRAVEL</small></span></Link>
      <nav className="mainNav" aria-label="Main navigation"><Link href="/">Home</Link><Link href="/tours">Tours</Link><Link href="/destinations">Destinations</Link><a href="/#guide">Travel Guide</a><a href="#contact">Contact Us</a></nav>
      <details className="mobileMenu"><summary aria-label="Open navigation"><span></span><span></span><span></span></summary><nav aria-label="Mobile navigation"><Link href="/">Home</Link><Link href="/tours">Tours</Link><Link href="/destinations">Destinations</Link><a href="/#guide">Travel Guide</a><a href="#contact">Contact Us</a></nav></details>
      <Link className="headerCta" href="/quote">Get a Quote <span>↗</span></Link>
    </header>
    {children}
    <footer id="contact" className="siteFooter">
      <div className="footerMain"><div className="footerBrand"><Link href="/" className="brand brandInverse"><span className="brandMark">S<span>C</span>T</span><span className="brandWords"><b>SEEK CHINA</b><small>TRAVEL</small></span></Link><p>Meaningful journeys, thoughtfully designed by people who call China home.</p><strong>Discover China. Your Way.</strong></div>
      <div className="footerLinks"><div><h3>Explore</h3><Link href="/tours">Tours</Link><Link href="/destinations">Destinations</Link><a href="/#guide">Travel Guide</a></div><div><h3>Plan</h3><Link href="/quote">Tailor-made Trips</Link><Link href="/quote">Small Groups</Link><Link href="/quote">Get a Quote</Link></div><div><h3>Connect</h3><a href="mailto:hello@seekchinatravel.com">Email Us</a><Link href="/quote">Contact Us</Link><span>Based in China</span></div></div></div>
      <div className="footerBottom"><span>© 2026 SEEK CHINA TRAVEL. All rights reserved.</span><span>Private journeys · Local expertise · No forced shopping</span></div>
    </footer>
  </body></html>;
}
