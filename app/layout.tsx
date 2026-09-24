import "./globals.css";
import Link from "next/link";
export const metadata = { title:"SEEK CHINA TRAVEL | Discover China. Your Way.", description:"Private and tailor-made China tours with local experts." };

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>
    <header className="nav">
      <Link href="/" className="brand"><img src="/sct-logo-reference.jpg" alt="SEEK CHINA TRAVEL"/></Link>
      <nav className="links">
        <Link href="/">Home</Link><Link href="/tours">Tours</Link><Link href="/destinations">Destinations</Link>
        <a href="/#guide">Travel Guide</a><a href="/#contact">Contact Us</a>
      </nav>
      <Link className="btn btn-small" href="/quote">Get a Quote →</Link>
    </header>
    {children}
    <footer id="contact"><div><b>SEEK CHINA TRAVEL</b><p>Discover China. Your Way.</p></div><div><b>Explore</b><p>Tours · Destinations · Travel Guide</p></div><div><b>Plan Your Trip</b><p>Private tours · Small groups · Tailor-made journeys</p></div></footer>
  </body></html>
}